#!/usr/bin/env tsx
/**
 * Validação das políticas comerciais de `config/`.
 *
 * Estes arquivos governam dinheiro, frequência de contato e autonomia da IA.
 * Um JSON malformado ou um limite fora de faixa vira comportamento errado em
 * produção — por isso é verificado no CI.
 *
 * Uso: npm run validate:config
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const CONFIG_ROOT = join(process.cwd(), 'config');

const percentual = z.number().min(0).max(100);

const schemas: Record<string, z.ZodType> = {
  'commercial-rules/lead-scoring.json': z.object({
    versao: z.string().regex(/^\d+\.\d+\.\d+$/),
    escala: z.object({ minimo: z.number(), maximo: z.number() }),
    scores: z.object({
      intencao_compra: z.object({ inicial: z.number(), pesos: z.record(z.string(), z.number()) }),
      ativacao: z.object({ inicial: z.number(), pesos: z.record(z.string(), z.number()) }),
      risco_cancelamento: z.object({ inicial: z.number(), pesos: z.record(z.string(), z.number()) }),
    }),
    decaimento: z.object({ meia_vida_dias: z.number().positive(), aplica_a: z.array(z.string()) }),
  }),

  'commercial-rules/discount-policy.json': z.object({
    versao: z.string(),
    status: z.string(),
    autonomia_ia: z.object({
      desconto_maximo_percentual: percentual,
      desconto_maximo_centavos: z.number().int().min(0),
      pode_oferecer_sem_aprovacao: z.boolean(),
    }),
    condicoes_pre_aprovadas: z.array(z.unknown()),
    sempre_exige_aprovacao_humana: z.array(z.string()).min(1),
  }),

  'commercial-rules/trial-extension-policy.json': z.object({
    versao: z.string(),
    trial_padrao_dias: z.number().int().positive(),
    autonomia_ia: z.object({
      extensao_maxima_dias: z.number().int().min(0),
      pode_estender_sem_aprovacao: z.boolean(),
    }),
  }),

  'commercial-rules/contact-frequency.json': z.object({
    versao: z.string(),
    fuso_horario: z.string(),
    limites_por_contato: z.object({
      whatsapp: z.object({
        mensagens_iniciadas_por_semana: z.number().int().min(0),
        intervalo_minimo_horas: z.number().min(0),
      }),
      email: z.object({ mensagens_por_semana: z.number().int().min(0) }),
    }),
    parada_imediata_de_sequencia: z.object({ gatilhos: z.array(z.string()).min(1) }),
  }),

  'commercial-rules/retention-rules.json': z.object({
    versao: z.string(),
    cancelamento: z.object({
      maximo_de_alternativas_oferecidas: z.number().int().min(0).max(1),
      exige_registro_de_motivo: z.boolean(),
      proibicoes: z.array(z.string()).min(1),
    }),
  }),

  'autonomy/human-approval-rules.json': z.object({
    versao: z.string(),
    regra_do_silencio: z.object({ silencio_aprova: z.literal(false) }),
    autonomia_total: z.object({ acoes: z.array(z.string()) }),
    autonomia_limitada: z.object({ acoes: z.record(z.string(), z.unknown()) }),
    aprovacao_humana_obrigatoria: z.object({ acoes: z.array(z.string()).min(1) }),
  }),

  'costs/ai-cost-limits.json': z.object({
    versao: z.string(),
    tetos: z.object({
      diario_usd: z.number().positive(),
      mensal_usd: z.number().positive(),
      por_conversa_usd: z.number().positive(),
    }),
    comportamento_ao_atingir_teto: z.object({ acao: z.literal('fallback_deterministico') }),
  }),

  'costs/whatsapp-costs.json': z.object({
    versao: z.string(),
    status: z.enum(['confirmado', 'nao_confirmado']),
    fonte: z.string().url().nullable(),
    categorias: z.record(z.string(), z.unknown()),
  }),

  'limits/message-limits.json': z.object({
    versao: z.string(),
    globais_diarios: z.object({ whatsapp_iniciadas_pelo_negocio: z.number().int().positive() }),
    tecnicos: z.object({
      timeout_chamada_externa_segundos: z.number().positive(),
      tentativas_maximas: z.number().int().positive(),
      janela_deduplicacao_eventos_dias: z.number().int().positive(),
    }),
  }),
};

let errors = 0;

console.log('🔍 Validando políticas comerciais…\n');

for (const [relativePath, schema] of Object.entries(schemas)) {
  const fullPath = join(CONFIG_ROOT, relativePath);

  if (!existsSync(fullPath)) {
    console.log(`❌ ${relativePath}: arquivo ausente`);
    errors += 1;
    continue;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(fullPath, 'utf8'));
  } catch (err) {
    console.log(`❌ ${relativePath}: JSON inválido — ${String(err)}`);
    errors += 1;
    continue;
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    for (const issue of result.error.issues) {
      console.log(`❌ ${relativePath} → ${issue.path.join('.')}: ${issue.message}`);
      errors += 1;
    }
    continue;
  }

  console.log(`✅ ${relativePath}`);
}

// Coerência entre arquivos: o teto diário do WhatsApp precisa caber no limite da Meta.
const messageLimits = JSON.parse(
  readFileSync(join(CONFIG_ROOT, 'limits/message-limits.json'), 'utf8')
) as { globais_diarios: { whatsapp_iniciadas_pelo_negocio: number } };

if (messageLimits.globais_diarios.whatsapp_iniciadas_pelo_negocio > 250) {
  console.log(
    '❌ limites: teto diário do WhatsApp acima de 250 — a Meta limita números novos a 250 destinatários únicos/24h'
  );
  errors += 1;
}

console.log(`\n${errors} erro(s).`);
if (errors > 0) {
  console.error('❌ Políticas inválidas.');
  process.exit(1);
}
console.log('✅ Políticas válidas.');
