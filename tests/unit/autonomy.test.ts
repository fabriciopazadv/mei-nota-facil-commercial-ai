import { describe, it, expect } from 'vitest';
import { autonomyLevelFor, canOfferDiscount, canExtendTrial, loadConfig, CONFIG_FILES } from '@/shared/config.js';

describe('matriz de autonomia', () => {
  it.each([
    'responder_duvida_coberta_pela_base_de_conhecimento',
    'atualizar_propriedade_do_contato',
    'criar_tarefa_humana',
    'interromper_sequencia',
  ])('classifica como autonomia total: %s', (action) => {
    expect(autonomyLevelFor(action)).toBe('total');
  });

  it.each(['conceder_extensao_de_trial', 'oferecer_desconto_pre_aprovado', 'reativar_contato_inativo'])(
    'classifica como autonomia limitada: %s',
    (action) => {
      expect(autonomyLevelFor(action)).toBe('limitada');
    }
  );

  it.each([
    'alterar_preco',
    'conceder_reembolso',
    'publicar_campanha_paga',
    'enviar_campanha_em_massa',
    'excluir_dados',
    'responder_ameaca_judicial',
    'alterar_pesos_de_lead_scoring',
  ])('exige aprovação humana: %s', (action) => {
    expect(autonomyLevelFor(action)).toBe('aprovacao_obrigatoria');
  });

  // Padrão seguro: o que não está declarado precisa de permissão.
  it('trata ação desconhecida como aprovação obrigatória', () => {
    expect(autonomyLevelFor('acao_inventada_pela_ia')).toBe('aprovacao_obrigatoria');
  });
});

describe('política de desconto', () => {
  it('recusa qualquer desconto enquanto a política não estiver definida', () => {
    expect(canOfferDiscount(10, 150)).toMatchObject({
      allowed: false,
      reason: 'politica_nao_definida',
      requiresApproval: true,
    });
  });

  it('recusa inclusive desconto zero — sem política, não há oferta automática', () => {
    expect(canOfferDiscount(0, 0).allowed).toBe(false);
  });

  it('a política nasce em zero, deliberadamente', () => {
    const policy = loadConfig<{ autonomia_ia: { desconto_maximo_percentual: number; pode_oferecer_sem_aprovacao: boolean } }>(
      CONFIG_FILES.discountPolicy
    );
    expect(policy.autonomia_ia.desconto_maximo_percentual).toBe(0);
    expect(policy.autonomia_ia.pode_oferecer_sem_aprovacao).toBe(false);
  });
});

describe('extensão de trial', () => {
  it('recusa extensão enquanto a política não estiver definida', () => {
    expect(canExtendTrial(7)).toEqual({ allowed: false, requiresApproval: true });
  });

  it('recusa extensão de zero dias', () => {
    expect(canExtendTrial(0).allowed).toBe(false);
  });
});

describe('integridade das políticas', () => {
  it('toda ação da matriz aparece em exatamente um nível', () => {
    const config = loadConfig<{
      autonomia_total: { acoes: string[] };
      autonomia_limitada: { acoes: Record<string, unknown> };
      aprovacao_humana_obrigatoria: { acoes: string[] };
    }>(CONFIG_FILES.humanApproval);

    const todas = [
      ...config.autonomia_total.acoes,
      ...Object.keys(config.autonomia_limitada.acoes),
      ...config.aprovacao_humana_obrigatoria.acoes,
    ];
    expect(new Set(todas).size).toBe(todas.length);
  });

  it('o silêncio nunca aprova', () => {
    const config = loadConfig<{ regra_do_silencio: { silencio_aprova: boolean } }>(CONFIG_FILES.humanApproval);
    expect(config.regra_do_silencio.silencio_aprova).toBe(false);
  });
});
