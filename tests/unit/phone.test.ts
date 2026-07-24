import { describe, it, expect } from 'vitest';
import { normalizePhoneBR, isE164, formatBR } from '@/shared/phone.js';

describe('normalização de telefone', () => {
  it.each([
    ['(11) 90000-0000', '+5511900000000'],
    ['11900000000', '+5511900000000'],
    ['5511900000000', '+5511900000000'],
    ['+55 11 90000-0000', '+5511900000000'],
    ['+5511900000000', '+5511900000000'],
    ['011 90000-0000', '+5511900000000'],
    ['11 9 0000-0000', '+5511900000000'],
  ])('normaliza %s', (input, expected) => {
    const r = normalizePhoneBR(input);
    expect(r.ok && r.e164).toBe(expected);
  });

  // Números antigos de celular sem o nono dígito ainda aparecem em cadastro.
  it('acrescenta o nono dígito a celular de 8 dígitos', () => {
    const r = normalizePhoneBR('(11) 9000-0000');
    expect(r.ok && r.e164).toBe('+5511990000000');
  });

  it('preserva telefone fixo de 8 dígitos', () => {
    const r = normalizePhoneBR('(11) 3000-0000');
    expect(r.ok && r.e164).toBe('+551130000000');
  });

  it.each([
    ['', 'vazio'],
    [null, 'vazio'],
    ['abc', 'vazio'],
    ['123', 'digitos_insuficientes'],
    ['(00) 90000-0000', 'ddd_invalido'],
    ['119000000000000', 'formato_invalido'],
  ])('rejeita %s', (input, reason) => {
    const r = normalizePhoneBR(input as string | null);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toBe(reason);
  });
});

describe('E.164', () => {
  it('valida formato', () => {
    expect(isE164('+5511900000000')).toBe(true);
    expect(isE164('11900000000')).toBe(false);
    expect(isE164('(11) 90000-0000')).toBe(false);
  });

  it('formata para exibição', () => {
    expect(formatBR('+5511900000000')).toBe('(11) 90000-0000');
    expect(formatBR('+551130000000')).toBe('(11) 3000-0000');
  });
});
