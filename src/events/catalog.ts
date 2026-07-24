/**
 * Catálogo dos eventos que o SaaS MEI Nota Fácil publica para o sistema comercial.
 * Evento fora desta lista é rejeitado com HTTP 422 (ver integration-contract.md §6).
 */

export const EVENT_NAMES = [
  // Aquisição e cadastro
  'lead_created',
  'account_created',
  'registration_started',
  'registration_completed',
  'email_verified',
  'business_profile_completed',
  // Ativação no produto
  'first_client_created',
  'first_budget_created',
  'first_receipt_created',
  'first_expense_created',
  'first_revenue_created',
  'contract_analysis_started',
  'contract_analysis_completed',
  'nfse_started',
  'nfse_completed',
  'premium_feature_viewed',
  // Teste gratuito
  'trial_started',
  'trial_day_3',
  'trial_day_7',
  'trial_day_14',
  'trial_day_21',
  'trial_day_26',
  'trial_day_29',
  'trial_expired',
  // Conversão e pagamento
  'checkout_started',
  'checkout_abandoned',
  'payment_pending',
  'payment_approved',
  'payment_failed',
  'subscription_activated',
  // Retenção e saída
  'user_inactive_3_days',
  'user_inactive_7_days',
  'user_inactive_15_days',
  'cancellation_requested',
  'subscription_cancelled',
  'support_requested',
  'nps_received',
  'referral_created',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/**
 * `lead_created` pode chegar antes de existir conta no SaaS — é o único evento
 * em que `user_id`, `tenant_id` e `email` são dispensáveis.
 */
export const EVENTS_WITHOUT_ACCOUNT: readonly EventName[] = ['lead_created'];

/**
 * Eventos que encerram qualquer sequência automatizada em andamento.
 * Ver config/commercial-rules/contact-frequency.json → parada_imediata_de_sequencia.
 */
export const SEQUENCE_STOPPING_EVENTS: readonly EventName[] = [
  'payment_approved',
  'subscription_activated',
  'cancellation_requested',
  'subscription_cancelled',
];

export function isKnownEvent(name: string): name is EventName {
  return (EVENT_NAMES as readonly string[]).includes(name);
}
