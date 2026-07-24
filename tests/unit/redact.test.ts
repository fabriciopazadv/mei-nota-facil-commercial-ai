import { describe, it, expect } from 'vitest';
import { redact, redactText, redactEmail, redactPhone, redactDocuments } from '@/security/redact.js';

describe('mascaramento de dados pessoais', () => {
  it('mascara e-mail preservando a forma', () => {
    const out = redactEmail('teste@example.com');
    expect(out).not.toContain('teste@example.com');
    expect(out).toContain('***');
  });

  it('mascara telefone mantendo só as pontas', () => {
    const out = redactPhone('+55 11 90000-0000');
    expect(out).toContain('****');
    expect(out).not.toContain('90000-0000');
  });

  it('mascara CPF e CNPJ', () => {
    expect(redactDocuments('000.000.000-00')).toBe('***.***.***-**');
    expect(redactDocuments('00.000.000/0001-00')).toBe('**.***.***/****-**');
  });

  it('aplica todas as regras juntas', () => {
    const out = redactText('Contato: teste@example.com, (11) 90000-0000, CPF 000.000.000-00');
    expect(out).not.toContain('teste@example.com');
    expect(out).not.toContain('000.000.000-00');
  });
});

describe('redação de objeto para log', () => {
  it('substitui valores de chaves secretas', () => {
    const out = redact({ access_token: 'abc123', api_key: 'xyz', senha: 'segredo' }) as Record<string, unknown>;
    expect(out.access_token).toBe('[redigido]');
    expect(out.api_key).toBe('[redigido]');
    expect(out.senha).toBe('[redigido]');
  });

  // Conteúdo de conversa nunca vai íntegro para log — só o tamanho.
  it('reduz conteúdo de mensagem ao tamanho', () => {
    const out = redact({ mensagem: 'oi, quero saber o preço' }) as Record<string, unknown>;
    expect(out.mensagem).toBe('[mensagem: 23 caracteres]');
  });

  it('percorre estruturas aninhadas', () => {
    const out = redact({ contato: { email: 'teste@example.com', dados: { token: 'x' } } });
    const json = JSON.stringify(out);
    expect(json).not.toContain('teste@example.com');
    expect(json).toContain('[redigido]');
  });

  it('percorre arrays', () => {
    const out = redact([{ email: 'teste@example.com' }, { email: 'outro@example.com' }]);
    expect(JSON.stringify(out)).not.toContain('teste@example.com');
  });

  it('preserva números e booleanos', () => {
    const out = redact({ trial_day: 7, ativo: true }) as Record<string, unknown>;
    expect(out.trial_day).toBe(7);
    expect(out.ativo).toBe(true);
  });

  it('limita a profundidade em vez de travar', () => {
    let deep: Record<string, unknown> = { fim: 'ok' };
    for (let i = 0; i < 20; i += 1) deep = { nivel: deep };
    expect(() => redact(deep)).not.toThrow();
  });

  it('não altera o objeto original', () => {
    const original = { email: 'teste@example.com' };
    redact(original);
    expect(original.email).toBe('teste@example.com');
  });
});
