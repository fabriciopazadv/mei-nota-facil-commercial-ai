import { describe, it, expect } from 'vitest';
import { detectOptOut, canSend, normalizeText } from '@/consent/optOut.js';

describe('detecção de opt-out', () => {
  it.each(['sair', 'PARAR', 'Pare', 'cancelar', 'descadastrar', 'remover', 'stop', 'Sair!'])(
    'reconhece pedido de parada: %s',
    (msg) => {
      expect(detectOptOut(msg).isOptOut).toBe(true);
    }
  );

  it.each(['não quero mais receber', 'nao me mande mais nada', 'por favor, me tira da lista'])(
    'reconhece pedido em frase: %s',
    (msg) => {
      expect(detectOptOut(msg).isOptOut).toBe(true);
    }
  );

  it('ignora acento e pontuação', () => {
    expect(detectOptOut('Não quero!!!').isOptOut).toBe(true);
    expect(normalizeText('Não, obrigado!')).toBe('nao obrigado');
  });

  // "Cancelar assinatura" é fluxo de cancelamento, não descadastramento de
  // mensagens. Confundir os dois deixaria o usuário sem resposta sobre o que pediu.
  it.each([
    'quero cancelar minha assinatura',
    'como cancelar assinatura?',
    'preciso cancelar meu plano',
  ])('distingue cancelamento de assinatura de opt-out: %s', (msg) => {
    const r = detectOptOut(msg);
    expect(r.isOptOut).toBe(false);
    expect(r.isSubscriptionCancellation).toBe(true);
  });

  it.each([
    'oi, quero saber o preço',
    'como emito uma nota fiscal?',
    'obrigado pela ajuda',
    'quanto custa?',
  ])('não confunde mensagem comum com opt-out: %s', (msg) => {
    expect(detectOptOut(msg).isOptOut).toBe(false);
  });
});

describe('permissão de envio', () => {
  const consentimentoTotal = { whatsapp: true, marketing: true };

  it('permite envio com consentimento válido', () => {
    expect(
      canSend({
        channel: 'whatsapp',
        category: 'onboarding',
        consent: consentimentoTotal,
        killSwitch: false,
      })
    ).toEqual({ allowed: true });
  });

  it('kill switch bloqueia até o que teria consentimento', () => {
    expect(
      canSend({
        channel: 'whatsapp',
        category: 'onboarding',
        consent: consentimentoTotal,
        killSwitch: true,
      })
    ).toMatchObject({ allowed: false, reason: 'kill_switch' });
  });

  it('bloqueia WhatsApp sem consentimento', () => {
    expect(
      canSend({
        channel: 'whatsapp',
        category: 'onboarding',
        consent: { whatsapp: false, marketing: true },
        killSwitch: false,
      })
    ).toMatchObject({ allowed: false, reason: 'sem_consentimento' });
  });

  it('bloqueia marketing sem consentimento de marketing', () => {
    expect(
      canSend({
        channel: 'email',
        category: 'marketing',
        consent: { whatsapp: true, marketing: false },
        killSwitch: false,
      })
    ).toMatchObject({ allowed: false, reason: 'sem_consentimento' });
  });

  it('opt-out bloqueia comunicação comercial', () => {
    expect(
      canSend({
        channel: 'whatsapp',
        category: 'recuperacao',
        consent: { ...consentimentoTotal, optOutAt: '2026-07-01T00:00:00Z', optOutChannel: 'todos' },
        killSwitch: false,
      })
    ).toMatchObject({ allowed: false, reason: 'opt_out' });
  });

  // Opt-out de mensagens comerciais não pode impedir a confirmação de um
  // pagamento que a própria pessoa acabou de fazer.
  it('opt-out NÃO bloqueia transacional nem suporte', () => {
    const consent = { ...consentimentoTotal, optOutAt: '2026-07-01T00:00:00Z', optOutChannel: 'todos' as const };
    expect(canSend({ channel: 'email', category: 'transacional', consent, killSwitch: false })).toEqual({ allowed: true });
    expect(canSend({ channel: 'email', category: 'suporte', consent, killSwitch: false })).toEqual({ allowed: true });
  });

  it('opt-out por canal bloqueia só aquele canal', () => {
    const consent = {
      ...consentimentoTotal,
      optOutAt: '2026-07-01T00:00:00Z',
      optOutChannel: 'whatsapp' as const,
    };
    expect(canSend({ channel: 'whatsapp', category: 'recuperacao', consent, killSwitch: false })).toMatchObject({ allowed: false });
    expect(canSend({ channel: 'email', category: 'recuperacao', consent, killSwitch: false })).toEqual({ allowed: true });
  });
});
