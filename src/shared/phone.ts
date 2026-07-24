/**
 * Normalização de telefone brasileiro para E.164.
 *
 * Todo telefone que circula no sistema comercial está em E.164 (`+5511900000000`).
 * Formato local só existe na fronteira de entrada, e é convertido aqui.
 */

export type PhoneResult =
  | { ok: true; e164: string }
  | { ok: false; reason: 'vazio' | 'digitos_insuficientes' | 'ddd_invalido' | 'formato_invalido' };

/** DDDs válidos no Brasil. */
const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/**
 * Aceita as formas que aparecem na prática: `(11) 90000-0000`, `11900000000`,
 * `5511900000000`, `+55 11 90000-0000`. Devolve sempre `+55DDNNNNNNNNN`.
 */
export function normalizePhoneBR(input: string | null | undefined): PhoneResult {
  if (!input) return { ok: false, reason: 'vazio' };

  let digits = input.replace(/\D/g, '');
  if (digits.length === 0) return { ok: false, reason: 'vazio' };

  // Remove zeros de discagem nacional (ex.: 011 → 11).
  if (digits.length > 11 && digits.startsWith('0')) digits = digits.replace(/^0+/, '');

  // Com código do país.
  if (digits.length >= 12 && digits.startsWith('55')) digits = digits.slice(2);

  if (digits.length < 10) return { ok: false, reason: 'digitos_insuficientes' };
  if (digits.length > 11) return { ok: false, reason: 'formato_invalido' };

  const ddd = Number(digits.slice(0, 2));
  if (!VALID_DDD.has(ddd)) return { ok: false, reason: 'ddd_invalido' };

  let subscriber = digits.slice(2);

  // Celular sem o nono dígito: 8 dígitos começando por 6-9 recebe o 9 na frente.
  if (subscriber.length === 8 && /^[6-9]/.test(subscriber)) {
    subscriber = `9${subscriber}`;
  }

  if (subscriber.length !== 8 && subscriber.length !== 9) {
    return { ok: false, reason: 'formato_invalido' };
  }

  return { ok: true, e164: `+55${ddd.toString().padStart(2, '0')}${subscriber}` };
}

/** Verifica se um valor já está em E.164 (formato exigido no envelope de eventos). */
export function isE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

/** Exibição amigável a partir do E.164. Uso em interface, nunca em log. */
export function formatBR(e164: string): string {
  const m = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
