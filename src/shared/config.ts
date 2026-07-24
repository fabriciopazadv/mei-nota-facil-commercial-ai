import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * Carregamento das políticas comerciais.
 *
 * As regras de negócio vivem em `config/`, em JSON versionado, e são lidas por
 * código — nunca embutidas em prompt (ADR-006). Assim o limite é verificado por
 * uma comparação, não pela boa vontade de um modelo.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
export const CONFIG_ROOT = resolve(HERE, '../../config');

const cache = new Map<string, unknown>();

/** Lê um arquivo de `config/`. Resultado memoizado — as políticas não mudam em execução. */
export function loadConfig<T = unknown>(relativePath: string): T {
  const cached = cache.get(relativePath);
  if (cached !== undefined) return cached as T;

  const fullPath = resolve(CONFIG_ROOT, relativePath);
  if (!fullPath.startsWith(CONFIG_ROOT)) {
    throw new Error(`caminho fora de config/: ${relativePath}`);
  }

  const parsed = JSON.parse(readFileSync(fullPath, 'utf8')) as T;
  cache.set(relativePath, parsed);
  return parsed;
}

/** Útil em teste, para reler um arquivo alterado. */
export function clearConfigCache(): void {
  cache.clear();
}

export const CONFIG_FILES = {
  leadScoring: 'commercial-rules/lead-scoring.json',
  discountPolicy: 'commercial-rules/discount-policy.json',
  trialExtension: 'commercial-rules/trial-extension-policy.json',
  contactFrequency: 'commercial-rules/contact-frequency.json',
  retentionRules: 'commercial-rules/retention-rules.json',
  humanApproval: 'autonomy/human-approval-rules.json',
  aiCostLimits: 'costs/ai-cost-limits.json',
  whatsappCosts: 'costs/whatsapp-costs.json',
  messageLimits: 'limits/message-limits.json',
} as const;

export type AutonomyLevel = 'total' | 'limitada' | 'aprovacao_obrigatoria';

interface HumanApprovalConfig {
  autonomia_total: { acoes: string[] };
  autonomia_limitada: { acoes: Record<string, unknown> };
  aprovacao_humana_obrigatoria: { acoes: string[] };
}

/**
 * Classifica uma ação na matriz de autonomia.
 *
 * Ação desconhecida é tratada como `aprovacao_obrigatoria`. O padrão seguro é
 * pedir permissão, não presumir que pode — ver ADR-007.
 */
export function autonomyLevelFor(action: string): AutonomyLevel {
  const config = loadConfig<HumanApprovalConfig>(CONFIG_FILES.humanApproval);
  if (config.aprovacao_humana_obrigatoria.acoes.includes(action)) return 'aprovacao_obrigatoria';
  if (Object.keys(config.autonomia_limitada.acoes).includes(action)) return 'limitada';
  if (config.autonomia_total.acoes.includes(action)) return 'total';
  return 'aprovacao_obrigatoria';
}

interface DiscountPolicy {
  status: string;
  autonomia_ia: {
    desconto_maximo_percentual: number;
    desconto_maximo_centavos: number;
    pode_oferecer_sem_aprovacao: boolean;
  };
  condicoes_pre_aprovadas: unknown[];
}

export type DiscountDecision =
  | { allowed: true; maxPercent: number; maxCents: number }
  | { allowed: false; reason: 'politica_nao_definida' | 'acima_do_limite'; requiresApproval: true };

/**
 * Decide se um desconto pode ser concedido sem aprovação humana.
 * Enquanto a política não for definida pelo proprietário, a resposta é sempre não.
 */
export function canOfferDiscount(percent: number, cents: number): DiscountDecision {
  const policy = loadConfig<DiscountPolicy>(CONFIG_FILES.discountPolicy);
  const { autonomia_ia: autonomy } = policy;

  if (!autonomy.pode_oferecer_sem_aprovacao) {
    return { allowed: false, reason: 'politica_nao_definida', requiresApproval: true };
  }
  if (percent > autonomy.desconto_maximo_percentual || cents > autonomy.desconto_maximo_centavos) {
    return { allowed: false, reason: 'acima_do_limite', requiresApproval: true };
  }
  return {
    allowed: true,
    maxPercent: autonomy.desconto_maximo_percentual,
    maxCents: autonomy.desconto_maximo_centavos,
  };
}

interface TrialExtensionPolicy {
  autonomia_ia: { extensao_maxima_dias: number; pode_estender_sem_aprovacao: boolean };
}

export function canExtendTrial(days: number): { allowed: boolean; requiresApproval: boolean } {
  const policy = loadConfig<TrialExtensionPolicy>(CONFIG_FILES.trialExtension);
  const { autonomia_ia: autonomy } = policy;
  const allowed =
    autonomy.pode_estender_sem_aprovacao && days > 0 && days <= autonomy.extensao_maxima_dias;
  return { allowed, requiresApproval: !allowed };
}
