import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verificação de assinatura HMAC-SHA256 dos webhooks.
 *
 * Dois produtores, mesmo algoritmo, payloads assinados diferentes:
 *  - SaaS mei-facil  → `X-Event-Signature`,     assina `timestamp + "." + corpo`
 *  - Meta / WhatsApp → `X-Hub-Signature-256`,   assina o corpo puro
 *
 * Regras que valem para os dois (docs/commercial-ai/09-seguranca.md §2):
 *  - comparação em TEMPO CONSTANTE;
 *  - validação sobre o corpo BRUTO, antes de qualquer parsing;
 *  - assinatura inválida devolve 401 e não é reprocessada.
 */

/** Tolerância do timestamp, em segundos. Protege contra repetição de requisição. */
export const TIMESTAMP_TOLERANCE_SECONDS = 300;

export type VerificationResult =
  | { valid: true }
  | { valid: false; reason: 'missing_signature' | 'invalid_signature' | 'timestamp_expired' };

function safeEqualHex(a: string, b: string): boolean {
  // Comparar comprimento primeiro evita a exceção de timingSafeEqual com
  // buffers de tamanhos diferentes. O comprimento não é segredo.
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

/** Remove o prefixo `sha256=` quando presente. */
function stripPrefix(signature: string): string {
  return signature.startsWith('sha256=') ? signature.slice(7) : signature;
}

export function computeSignature(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/**
 * Verifica eventos vindos do SaaS: assina `timestamp + "." + corpo bruto`.
 */
export function verifyEventSignature(params: {
  secret: string;
  rawBody: string;
  signatureHeader: string | null | undefined;
  timestampHeader: string | null | undefined;
  nowSeconds?: number;
}): VerificationResult {
  const { secret, rawBody, signatureHeader, timestampHeader } = params;
  if (!signatureHeader || !timestampHeader) return { valid: false, reason: 'missing_signature' };

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return { valid: false, reason: 'timestamp_expired' };

  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TIMESTAMP_TOLERANCE_SECONDS) {
    return { valid: false, reason: 'timestamp_expired' };
  }

  const expected = computeSignature(secret, `${timestampHeader}.${rawBody}`);
  return safeEqualHex(expected, stripPrefix(signatureHeader))
    ? { valid: true }
    : { valid: false, reason: 'invalid_signature' };
}

/**
 * Verifica o `X-Hub-Signature-256` da Meta: assina o corpo bruto, sem timestamp.
 */
export function verifyMetaSignature(params: {
  appSecret: string;
  rawBody: string;
  signatureHeader: string | null | undefined;
}): VerificationResult {
  const { appSecret, rawBody, signatureHeader } = params;
  if (!signatureHeader) return { valid: false, reason: 'missing_signature' };

  const expected = computeSignature(appSecret, rawBody);
  return safeEqualHex(expected, stripPrefix(signatureHeader))
    ? { valid: true }
    : { valid: false, reason: 'invalid_signature' };
}

/**
 * Handshake GET de verificação do webhook da Meta. Devolve o `hub.challenge`
 * em texto puro quando o token confere, ou `null` para responder 403.
 */
export function verifyMetaWebhookHandshake(params: {
  verifyToken: string;
  mode: string | null | undefined;
  token: string | null | undefined;
  challenge: string | null | undefined;
}): string | null {
  const { verifyToken, mode, token, challenge } = params;
  if (mode !== 'subscribe' || !token || !challenge) return null;
  if (token.length !== verifyToken.length) return null;
  return timingSafeEqual(Buffer.from(token), Buffer.from(verifyToken)) ? challenge : null;
}
