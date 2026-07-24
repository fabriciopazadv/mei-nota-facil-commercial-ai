import { describe, it, expect } from 'vitest';
import { parseEvent } from '@/events/schema.js';
import { isKnownEvent, EVENT_NAMES } from '@/events/catalog.js';
import { InMemoryIdempotencyStore, DEDUPLICATION_WINDOW_MS } from '@/events/idempotency.js';
import { makeEvent, FAKE } from '../fixtures/events.js';

describe('catálogo de eventos', () => {
  it('cobre os 38 eventos do contrato', () => {
    expect(EVENT_NAMES).toHaveLength(38);
  });

  it('não tem nome duplicado', () => {
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
  });

  it('reconhece evento conhecido e rejeita desconhecido', () => {
    expect(isKnownEvent('trial_started')).toBe(true);
    expect(isKnownEvent('evento_inventado')).toBe(false);
  });
});

describe('validação do envelope', () => {
  it('aceita evento válido', () => {
    const result = parseEvent(makeEvent());
    expect(result.ok).toBe(true);
  });

  it('rejeita evento desconhecido com 422', () => {
    const result = parseEvent(makeEvent({ event_name: 'evento_inventado' }));
    expect(result).toMatchObject({ ok: false, status: 422, error: 'unknown_event' });
  });

  it('rejeita schema inválido com 400', () => {
    const result = parseEvent(makeEvent({ event_id: 'nao-e-uuid' }));
    expect(result).toMatchObject({ ok: false, status: 400, error: 'invalid_schema' });
  });

  it('rejeita telefone em formato local — E.164 é obrigatório', () => {
    const result = parseEvent(makeEvent({ phone: FAKE.telefoneLocal }));
    expect(result.ok).toBe(false);
  });

  it('exige user_id, tenant_id e email nos eventos de conta', () => {
    const result = parseEvent(makeEvent({ user_id: null, tenant_id: null, email: null }));
    expect(result.ok).toBe(false);
  });

  it('dispensa dados de conta em lead_created', () => {
    const result = parseEvent(
      makeEvent({ event_name: 'lead_created', user_id: null, tenant_id: null, email: null })
    );
    expect(result.ok).toBe(true);
  });

  it('normaliza e-mail para minúsculo', () => {
    const result = parseEvent(makeEvent({ email: 'TESTE@EXAMPLE.COM' }));
    expect(result.ok && result.event.email).toBe('teste@example.com');
  });

  // Regra central de LGPD: o sistema comercial recebe o SINAL, nunca o CONTEÚDO.
  it.each([
    ['cliente_nome', 'Cliente do MEI'],
    ['cliente_cpf', '000.000.000-00'],
    ['nfse_xml', '<xml/>'],
    ['contract_text', 'texto do contrato'],
    ['valor_centavos', 15000],
    ['token', 'abc'],
  ])('rejeita metadata com chave proibida: %s', (key, value) => {
    const result = parseEvent(makeEvent({ metadata: { [key]: value } }));
    expect(result.ok).toBe(false);
  });

  it('aceita metadata legítimo', () => {
    const result = parseEvent(makeEvent({ metadata: { correlation_id: 'abc-123', tentativa: 2 } }));
    expect(result.ok).toBe(true);
  });
});

describe('idempotência', () => {
  it('aceita o primeiro e rejeita a repetição', () => {
    const store = new InMemoryIdempotencyStore();
    const id = 'evento-1';
    expect(store.register(id, 1000)).toBe(true);
    expect(store.register(id, 2000)).toBe(false);
  });

  it('aceita novamente depois da janela de deduplicação', () => {
    const store = new InMemoryIdempotencyStore();
    const id = 'evento-1';
    expect(store.register(id, 0)).toBe(true);
    expect(store.register(id, DEDUPLICATION_WINDOW_MS + 1)).toBe(true);
  });

  it('purga entradas expiradas', () => {
    const store = new InMemoryIdempotencyStore();
    store.register('a', 0);
    store.register('b', 0);
    expect(store.size).toBe(2);
    expect(store.purge(DEDUPLICATION_WINDOW_MS + 1)).toBe(2);
    expect(store.size).toBe(0);
  });

  it('não confunde eventos diferentes', () => {
    const store = new InMemoryIdempotencyStore();
    expect(store.register('a', 0)).toBe(true);
    expect(store.register('b', 0)).toBe(true);
  });
});
