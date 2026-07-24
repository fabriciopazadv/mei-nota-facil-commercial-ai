import { loadConfig, CONFIG_FILES } from '../shared/config.js';

/**
 * Cálculo dos três scores comerciais.
 *
 * Os pesos vivem em config/commercial-rules/lead-scoring.json, versionados e
 * revisados por pessoa. A IA lê o resultado; não altera os pesos (ADR-006).
 */

export type ScoreKind = 'intencao_compra' | 'ativacao' | 'risco_cancelamento';

export interface ScoreSignal {
  /** Nome do evento ou sinal (chave em `pesos`). */
  name: string;
  /** Quando ocorreu, em epoch ms. Usado no decaimento. */
  at: number;
}

export interface ScoreResult {
  value: number;
  version: string;
  applied: Array<{ name: string; weight: number; effective: number }>;
  ignored: string[];
}

interface LeadScoringConfig {
  versao: string;
  escala: { minimo: number; maximo: number };
  scores: Record<string, { inicial: number; pesos: Record<string, number> }>;
  decaimento: { meia_vida_dias: number; aplica_a: string[] };
}

const CONFIG = loadConfig<LeadScoringConfig>(CONFIG_FILES.leadScoring);

function clamp(value: number): number {
  return Math.max(CONFIG.escala.minimo, Math.min(CONFIG.escala.maximo, Math.round(value)));
}

/**
 * Decaimento exponencial por meia-vida: um sinal de 30 dias atrás vale metade.
 * Evita score alto eternizado por um evento antigo.
 */
function decayFactor(ageMs: number, halfLifeDays: number): number {
  if (ageMs <= 0) return 1;
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;
  return Math.pow(0.5, ageMs / halfLifeMs);
}

export function computeScore(
  kind: ScoreKind,
  signals: readonly ScoreSignal[],
  now: number = Date.now()
): ScoreResult {
  const definition = CONFIG.scores[kind];
  if (!definition) throw new Error(`score desconhecido: ${kind}`);

  const applyDecay = CONFIG.decaimento.aplica_a.includes(kind);
  const applied: ScoreResult['applied'] = [];
  const ignored: string[] = [];

  let total = definition.inicial;

  for (const signal of signals) {
    const weight = definition.pesos[signal.name];
    if (weight === undefined) {
      ignored.push(signal.name);
      continue;
    }
    const factor = applyDecay ? decayFactor(now - signal.at, CONFIG.decaimento.meia_vida_dias) : 1;
    const effective = weight * factor;
    total += effective;
    applied.push({ name: signal.name, weight, effective: Math.round(effective * 100) / 100 });
  }

  return { value: clamp(total), version: CONFIG.versao, applied, ignored };
}

export interface AllScores {
  intencao: number;
  ativacao: number;
  risco: number;
  version: string;
}

export function computeAllScores(
  signals: readonly ScoreSignal[],
  now: number = Date.now()
): AllScores {
  return {
    intencao: computeScore('intencao_compra', signals, now).value,
    ativacao: computeScore('ativacao', signals, now).value,
    risco: computeScore('risco_cancelamento', signals, now).value,
    version: CONFIG.versao,
  };
}

export type RiskBand = 'baixo' | 'medio' | 'alto' | 'critico';

export function riskBand(score: number): RiskBand {
  if (score >= 75) return 'critico';
  if (score >= 50) return 'alto';
  if (score >= 30) return 'medio';
  return 'baixo';
}

export type ActivationStage = 'cadastrado' | 'explorando' | 'ativado' | 'engajado';

export function activationStage(score: number): ActivationStage {
  if (score >= 70) return 'engajado';
  if (score >= 40) return 'ativado';
  if (score >= 20) return 'explorando';
  return 'cadastrado';
}
