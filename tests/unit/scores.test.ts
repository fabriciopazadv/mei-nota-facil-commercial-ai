import { describe, it, expect } from 'vitest';
import { computeScore, computeAllScores, riskBand, activationStage } from '@/scoring/scores.js';

const NOW = Date.UTC(2026, 6, 24);
const agora = (name: string) => ({ name, at: NOW });

describe('score de intenção de compra', () => {
  it('parte de zero sem sinais', () => {
    expect(computeScore('intencao_compra', [], NOW).value).toBe(0);
  });

  it('soma os pesos dos sinais', () => {
    const r = computeScore('intencao_compra', [agora('registration_completed'), agora('checkout_started')], NOW);
    expect(r.value).toBe(40);
  });

  it('checkout iniciado é o sinal mais forte', () => {
    const checkout = computeScore('intencao_compra', [agora('checkout_started')], NOW).value;
    const perfil = computeScore('intencao_compra', [agora('business_profile_completed')], NOW).value;
    expect(checkout).toBeGreaterThan(perfil);
  });

  it('inatividade reduz o score', () => {
    const r = computeScore('intencao_compra', [agora('checkout_started'), agora('user_inactive_15_days')], NOW);
    expect(r.value).toBe(0);
  });

  it('respeita o teto da escala', () => {
    const muitos = [
      'checkout_started', 'nfse_started', 'first_receipt_created', 'first_budget_created',
      'contract_analysis_completed', 'resposta_positiva_whatsapp', 'registration_completed',
      'business_profile_completed', 'first_client_created', 'nfse_completed',
    ].map(agora);
    expect(computeScore('intencao_compra', muitos, NOW).value).toBe(100);
  });

  it('nunca fica negativo', () => {
    const r = computeScore('intencao_compra', [agora('user_inactive_15_days'), agora('trial_expired')], NOW);
    expect(r.value).toBe(0);
  });

  // Sinal antigo não pode manter um lead "quente" para sempre.
  it('aplica decaimento a sinais antigos', () => {
    const trintaDias = NOW - 30 * 24 * 60 * 60 * 1000;
    const recente = computeScore('intencao_compra', [agora('checkout_started')], NOW).value;
    const antigo = computeScore('intencao_compra', [{ name: 'checkout_started', at: trintaDias }], NOW).value;
    expect(antigo).toBeLessThan(recente);
    expect(antigo).toBe(15); // meia-vida de 30 dias: 30 → 15
  });

  it('ignora sinal desconhecido e reporta', () => {
    const r = computeScore('intencao_compra', [agora('sinal_inventado')], NOW);
    expect(r.value).toBe(0);
    expect(r.ignored).toContain('sinal_inventado');
  });

  it('informa a versão da política usada', () => {
    expect(computeScore('intencao_compra', [], NOW).version).toBe('1.0.0');
  });
});

describe('score de ativação', () => {
  it('não sofre decaimento — ativação é um fato consumado', () => {
    const antigo = NOW - 60 * 24 * 60 * 60 * 1000;
    const r = computeScore('ativacao', [{ name: 'nfse_completed', at: antigo }], NOW);
    expect(r.value).toBe(20);
  });

  it('classifica os estágios', () => {
    expect(activationStage(0)).toBe('cadastrado');
    expect(activationStage(25)).toBe('explorando');
    expect(activationStage(45)).toBe('ativado');
    expect(activationStage(80)).toBe('engajado');
  });
});

describe('score de risco de cancelamento', () => {
  it('pedido de cancelamento é o sinal mais forte', () => {
    expect(computeScore('risco_cancelamento', [agora('cancellation_requested')], NOW).value).toBe(50);
  });

  it('pagamento aprovado reduz o risco', () => {
    const r = computeScore('risco_cancelamento', [agora('user_inactive_15_days'), agora('payment_approved')], NOW);
    expect(r.value).toBe(0);
  });

  it('classifica as faixas', () => {
    expect(riskBand(10)).toBe('baixo');
    expect(riskBand(35)).toBe('medio');
    expect(riskBand(60)).toBe('alto');
    expect(riskBand(80)).toBe('critico');
  });

  it('combina sinais até a faixa crítica', () => {
    const r = computeScore(
      'risco_cancelamento',
      [agora('cancellation_requested'), agora('payment_failed'), agora('reclamacao_registrada')],
      NOW
    );
    expect(riskBand(r.value)).toBe('critico');
  });
});

describe('cálculo conjunto', () => {
  it('calcula os três scores de forma independente', () => {
    const r = computeAllScores([agora('checkout_started'), agora('nfse_completed')], NOW);
    expect(r.intencao).toBeGreaterThan(0);
    expect(r.ativacao).toBeGreaterThan(0);
    expect(r.risco).toBe(0);
    expect(r.version).toBe('1.0.0');
  });
});
