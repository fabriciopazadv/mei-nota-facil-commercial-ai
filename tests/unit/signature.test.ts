import { describe, it, expect } from 'vitest';
import {
  computeSignature,
  verifyEventSignature,
  verifyMetaSignature,
  verifyMetaWebhookHandshake,
  TIMESTAMP_TOLERANCE_SECONDS,
} from '@/security/signature.js';
import { SECRET } from '../fixtures/events.js';

const BODY = '{"event_id":"abc","event_name":"trial_started"}';

describe('assinatura de eventos do SaaS', () => {
  const now = 1_800_000_000;
  const ts = String(now);
  const valid = computeSignature(SECRET, `${ts}.${BODY}`);

  it('aceita assinatura correta', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${valid}`,
      timestampHeader: ts,
      nowSeconds: now,
    });
    expect(r.valid).toBe(true);
  });

  it('aceita assinatura sem o prefixo sha256=', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: valid,
      timestampHeader: ts,
      nowSeconds: now,
    });
    expect(r.valid).toBe(true);
  });

  it('rejeita assinatura incorreta', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${'0'.repeat(64)}`,
      timestampHeader: ts,
      nowSeconds: now,
    });
    expect(r).toMatchObject({ valid: false, reason: 'invalid_signature' });
  });

  it('rejeita corpo adulterado — a assinatura cobre o payload inteiro', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY.replace('trial_started', 'payment_approved'),
      signatureHeader: `sha256=${valid}`,
      timestampHeader: ts,
      nowSeconds: now,
    });
    expect(r).toMatchObject({ valid: false, reason: 'invalid_signature' });
  });

  it('rejeita segredo diferente', () => {
    const r = verifyEventSignature({
      secret: 'outro-segredo-de-teste-completamente-diferente',
      rawBody: BODY,
      signatureHeader: `sha256=${valid}`,
      timestampHeader: ts,
      nowSeconds: now,
    });
    expect(r.valid).toBe(false);
  });

  it('rejeita header ausente', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: null,
      timestampHeader: ts,
      nowSeconds: now,
    });
    expect(r).toMatchObject({ valid: false, reason: 'missing_signature' });
  });

  // Proteção contra repetição de requisição capturada.
  it('rejeita timestamp fora da tolerância', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${valid}`,
      timestampHeader: ts,
      nowSeconds: now + TIMESTAMP_TOLERANCE_SECONDS + 1,
    });
    expect(r).toMatchObject({ valid: false, reason: 'timestamp_expired' });
  });

  it('aceita dentro da tolerância', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${valid}`,
      timestampHeader: ts,
      nowSeconds: now + TIMESTAMP_TOLERANCE_SECONDS - 1,
    });
    expect(r.valid).toBe(true);
  });

  it('rejeita timestamp não numérico', () => {
    const r = verifyEventSignature({
      secret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${valid}`,
      timestampHeader: 'ontem',
      nowSeconds: now,
    });
    expect(r.valid).toBe(false);
  });
});

describe('assinatura da Meta', () => {
  it('aceita assinatura correta', () => {
    const sig = computeSignature(SECRET, BODY);
    const r = verifyMetaSignature({
      appSecret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${sig}`,
    });
    expect(r.valid).toBe(true);
  });

  it('rejeita assinatura incorreta', () => {
    const r = verifyMetaSignature({
      appSecret: SECRET,
      rawBody: BODY,
      signatureHeader: `sha256=${'f'.repeat(64)}`,
    });
    expect(r.valid).toBe(false);
  });

  it('rejeita header ausente', () => {
    const r = verifyMetaSignature({ appSecret: SECRET, rawBody: BODY, signatureHeader: null });
    expect(r).toMatchObject({ valid: false, reason: 'missing_signature' });
  });
});

describe('handshake de verificação do webhook da Meta', () => {
  it('devolve o challenge quando o token confere', () => {
    expect(
      verifyMetaWebhookHandshake({
        verifyToken: 'token-de-teste',
        mode: 'subscribe',
        token: 'token-de-teste',
        challenge: '12345',
      })
    ).toBe('12345');
  });

  it('recusa token errado', () => {
    expect(
      verifyMetaWebhookHandshake({
        verifyToken: 'token-de-teste',
        mode: 'subscribe',
        token: 'token-errado0',
        challenge: '12345',
      })
    ).toBeNull();
  });

  it('recusa modo diferente de subscribe', () => {
    expect(
      verifyMetaWebhookHandshake({
        verifyToken: 'token-de-teste',
        mode: 'unsubscribe',
        token: 'token-de-teste',
        challenge: '12345',
      })
    ).toBeNull();
  });
});
