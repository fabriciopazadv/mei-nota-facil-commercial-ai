/**
 * Mascaramento de dados pessoais antes de qualquer log.
 *
 * Regra da casa: nada que identifique uma pessoa entra em log íntegro. Isso vale
 * inclusive para corpo de webhook — ver docs/commercial-ai/09-seguranca.md §3 e o
 * risco R-07 registrado na auditoria.
 */

const EMAIL_RE = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9-])[A-Za-z0-9.-]*\.([A-Za-z]{2,})/g;
const PHONE_RE = /\+?\d{2}[\s.-]?\(?\d{2,3}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g;
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const CNPJ_RE = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;

/** Chaves cujo VALOR é sempre substituído, qualquer que seja o conteúdo. */
const SECRET_KEYS = [
  'password',
  'senha',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apikey',
  'secret',
  'authorization',
  'cookie',
  'session',
  'passwordhash',
  'encryption_key',
  'private_key',
];

/** Chaves cujo VALOR é tratado como conteúdo de mensagem (só o tamanho é logado). */
const MESSAGE_KEYS = ['message', 'mensagem', 'body', 'text', 'texto', 'content', 'conteudo'];

export function redactEmail(value: string): string {
  return value.replace(EMAIL_RE, (_m, u: string, d: string, tld: string) => `${u}***@${d}***.${tld}`);
}

export function redactPhone(value: string): string {
  return value.replace(PHONE_RE, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length < 8) return match;
    return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
  });
}

export function redactDocuments(value: string): string {
  return value.replace(CNPJ_RE, '**.***.***/****-**').replace(CPF_RE, '***.***.***-**');
}

/** Aplica todas as regras a uma string solta. */
export function redactText(value: string): string {
  return redactPhone(redactDocuments(redactEmail(value)));
}

/**
 * Redige recursivamente um objeto para log. Não altera o original.
 * Profundidade limitada para não travar em estrutura cíclica ou muito aninhada.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[profundidade excedida]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      const k = key.toLowerCase();
      if (SECRET_KEYS.includes(k)) {
        out[key] = '[redigido]';
      } else if (MESSAGE_KEYS.includes(k) && typeof raw === 'string') {
        out[key] = `[mensagem: ${raw.length} caracteres]`;
      } else {
        out[key] = redact(raw, depth + 1);
      }
    }
    return out;
  }
  return '[tipo não serializável]';
}

/** Único ponto de saída de log do sistema comercial. */
export function safeLog(label: string, payload: unknown): void {
  // eslint-disable-next-line no-console
  console.log(label, JSON.stringify(redact(payload)));
}
