/**
 * Detecção de opt-out.
 *
 * É REGRA, não interpretação: roda antes de qualquer chamada de IA. Um modelo
 * pode ser convencido a ignorar um pedido de descadastramento; uma comparação de
 * texto não pode. Ver docs/commercial-ai/07-whatsapp.md §4.
 */

export type OptOutChannel = 'whatsapp' | 'email' | 'todos';

/**
 * Termos que caracterizam pedido de parada. Comparados sobre o texto
 * normalizado (minúsculo, sem acento, sem pontuação).
 */
const OPT_OUT_TERMS = [
  'sair',
  'parar',
  'pare',
  'para de mandar',
  'cancelar',
  'cancela',
  'descadastrar',
  'descadastre',
  'remover',
  'remova',
  'me tira',
  'me tire',
  'nao quero',
  'nao quero mais',
  'nao me mande',
  'nao me manda',
  'nao envie',
  'nao enviar',
  'stop',
  'unsubscribe',
  'sem interesse',
  'nao perturbe',
];

/**
 * Frases que contêm um termo de opt-out mas NÃO são pedido de parada.
 * Sem isso, "quero cancelar minha assinatura" seria tratado como
 * descadastramento de mensagens — duas coisas bem diferentes.
 */
const FALSE_POSITIVES = [
  'cancelar minha assinatura',
  'cancelar assinatura',
  'cancelar meu plano',
  'como cancelar',
  'quero cancelar a assinatura',
  'cancelar o orcamento',
  'cancelar a nota',
  'cancelar nfse',
  'cancelar recibo',
];

export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface OptOutDetection {
  isOptOut: boolean;
  matchedTerm?: string;
  /** Sinaliza pedido de cancelamento de assinatura — trata-se de outro fluxo. */
  isSubscriptionCancellation: boolean;
}

export function detectOptOut(message: string): OptOutDetection {
  const text = normalizeText(message);

  const cancellation = FALSE_POSITIVES.find((p) => text.includes(p));
  if (cancellation) {
    return { isOptOut: false, isSubscriptionCancellation: true };
  }

  // Mensagem curta e isolada ("sair", "parar") é o caso mais comum e mais claro.
  const exact = OPT_OUT_TERMS.find((t) => text === t);
  if (exact) return { isOptOut: true, matchedTerm: exact, isSubscriptionCancellation: false };

  const contained = OPT_OUT_TERMS.filter((t) => t.includes(' ')).find((t) => text.includes(t));
  if (contained) {
    return { isOptOut: true, matchedTerm: contained, isSubscriptionCancellation: false };
  }

  return { isOptOut: false, isSubscriptionCancellation: false };
}

export interface ConsentState {
  whatsapp: boolean;
  marketing: boolean;
  optOutAt?: string | null;
  optOutChannel?: OptOutChannel | null;
}

export type SendDecision =
  | { allowed: true }
  | { allowed: false; reason: 'opt_out' | 'sem_consentimento' | 'kill_switch' };

/**
 * Última verificação antes de enviar. A ordem importa: o kill switch vem
 * primeiro porque precisa parar tudo, inclusive o que teria consentimento.
 */
export function canSend(params: {
  channel: 'whatsapp' | 'email';
  category: 'transacional' | 'onboarding' | 'recuperacao' | 'marketing' | 'suporte';
  consent: ConsentState;
  killSwitch: boolean;
}): SendDecision {
  const { channel, category, consent, killSwitch } = params;

  if (killSwitch) return { allowed: false, reason: 'kill_switch' };

  if (consent.optOutAt) {
    const scope = consent.optOutChannel ?? 'todos';
    if (scope === 'todos' || scope === channel) {
      // Opt-out não bloqueia transacional: confirmação de pagamento e resposta a
      // ticket decorrem de ação do próprio usuário.
      if (category !== 'transacional' && category !== 'suporte') {
        return { allowed: false, reason: 'opt_out' };
      }
    }
  }

  if (channel === 'whatsapp' && !consent.whatsapp) {
    return { allowed: false, reason: 'sem_consentimento' };
  }
  if (category === 'marketing' && !consent.marketing) {
    return { allowed: false, reason: 'sem_consentimento' };
  }

  return { allowed: true };
}
