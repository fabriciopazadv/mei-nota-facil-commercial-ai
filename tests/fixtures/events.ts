/**
 * Fixtures de teste. DADOS EXCLUSIVAMENTE FICTÍCIOS.
 *
 * Proibido usar telefone, e-mail, nome ou documento de cliente real — inclusive
 * mascarados, quando ainda permitirem reidentificação. Ver SECURITY.md §3.
 */

export const FAKE = {
  nome: 'João Teste',
  email: 'teste@example.com',
  emailAlt: 'maria.teste@example.com',
  telefone: '+5511900000000',
  telefoneLocal: '(11) 90000-0000',
  cnpj: '00.000.000/0001-00',
  userId: 'clxtest00000000000000000',
  tenantId: 'clxtenant000000000000000',
} as const;

export const SECRET = 'segredo-de-teste-nao-usar-em-producao-0123456789';

let counter = 0;
/** UUID v4 determinístico para teste — não usar fora de teste. */
export function fakeUuid(): string {
  counter += 1;
  const hex = counter.toString(16).padStart(12, '0');
  return `550e8400-e29b-41d4-a716-${hex}`;
}

export function makeEvent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    event_id: fakeUuid(),
    event_name: 'trial_started',
    event_version: 1,
    occurred_at: new Date('2026-07-24T18:30:00.000Z').toISOString(),
    user_id: FAKE.userId,
    tenant_id: FAKE.tenantId,
    contact_id: null,
    email: FAKE.email,
    phone: FAKE.telefone,
    source: 'organico',
    campaign: null,
    plan: 'MENSAL',
    trial_day: 0,
    metadata: {},
    ...overrides,
  };
}
