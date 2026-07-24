import { z } from 'zod';
import { EVENT_NAMES, EVENTS_WITHOUT_ACCOUNT, type EventName } from './catalog.js';

/**
 * Envelope dos eventos vindos do SaaS. Contrato normativo em
 * docs/commercial-ai/integration-contract.md §4.
 */

/** Telefone em E.164. Formato local é rejeitado — normalizar na origem. */
const e164 = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'telefone deve estar em E.164, ex.: +5511900000000');

/**
 * Chaves proibidas no metadata. Carregar qualquer uma delas significa levar
 * dado do cliente do MEI ou conteúdo de documento fiscal para o domínio
 * comercial — o que é incidente de dados pessoais, não erro de formatação.
 * Ver docs/commercial-ai/lgpd-mapa-de-dados.md §3.
 */
export const FORBIDDEN_METADATA_KEYS = [
  'cpf',
  'cnpj',
  'customer_name',
  'customer_cpf',
  'customer_cnpj',
  'customer_email',
  'customer_phone',
  'cliente_nome',
  'cliente_cpf',
  'cliente_cnpj',
  'nfse_xml',
  'xml_content',
  'receipt_content',
  'contract_text',
  'contrato_texto',
  'valor_nota',
  'valor_centavos',
  'certificate',
  'certificado',
  'password',
  'senha',
  'token',
  'access_token',
  'api_key',
] as const;

const metadataSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (meta) =>
      !Object.keys(meta).some((k) =>
        (FORBIDDEN_METADATA_KEYS as readonly string[]).includes(k.toLowerCase())
      ),
    { message: 'metadata contém chave proibida (dado de cliente do MEI ou conteúdo sensível)' }
  );

export const eventEnvelopeSchema = z
  .object({
    event_id: z.string().uuid(),
    event_name: z.enum(EVENT_NAMES),
    event_version: z.number().int().positive(),
    occurred_at: z.string().datetime({ offset: true }),
    user_id: z.string().min(1).nullish(),
    tenant_id: z.string().min(1).nullish(),
    contact_id: z.string().min(1).nullish(),
    email: z.string().email().toLowerCase().nullish(),
    phone: e164.nullish(),
    source: z.string().max(100).nullish(),
    campaign: z.string().max(200).nullish(),
    plan: z.enum(['TRIAL', 'MENSAL', 'SEMESTRAL']).nullish(),
    trial_day: z.number().int().min(0).max(31).nullish(),
    metadata: metadataSchema.default({}),
  })
  .superRefine((event, ctx) => {
    if (EVENTS_WITHOUT_ACCOUNT.includes(event.event_name as EventName)) return;
    for (const field of ['user_id', 'tenant_id', 'email'] as const) {
      if (!event[field]) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `${field} é obrigatório para o evento ${event.event_name}`,
        });
      }
    }
  });

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export type ParseResult =
  | { ok: true; event: EventEnvelope }
  | { ok: false; status: 400 | 422; error: string; details?: unknown };

/**
 * Valida um payload recebido. Distingue evento desconhecido (422) de schema
 * inválido (400) porque a origem trata os dois casos de forma diferente.
 */
export function parseEvent(payload: unknown): ParseResult {
  const name =
    typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>).event_name
      : undefined;

  if (typeof name === 'string' && !(EVENT_NAMES as readonly string[]).includes(name)) {
    return { ok: false, status: 422, error: 'unknown_event' };
  }

  const result = eventEnvelopeSchema.safeParse(payload);
  if (!result.success) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_schema',
      details: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }
  return { ok: true, event: result.data };
}
