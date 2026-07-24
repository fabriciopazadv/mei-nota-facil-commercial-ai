#!/usr/bin/env tsx
/**
 * Validação dos prompts versionados.
 *
 * Verifica os metadados obrigatórios (ADR-006) e, sobretudo, que nenhuma REGRA
 * COMERCIAL tenha vazado para dentro do prompt: limite de desconto, dias de
 * extensão e frequência vivem em config/, onde podem ser verificados por código.
 *
 * Uso: npm run validate:prompts
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const PROMPTS_DIR = join(process.cwd(), 'prompts');

const REQUIRED_FIELDS = [
  'name', 'agent', 'version', 'status', 'created_at', 'updated_at',
  'owner', 'approved_by', 'model', 'purpose', 'risk_level',
];

const VALID_STATUS = ['rascunho', 'em_revisao', 'aprovado', 'descontinuado'];
const VALID_RISK = ['baixo', 'medio', 'alto'];

/**
 * Padrões que indicam regra numérica dentro do prompt. Regra em texto não é
 * verificável nem auditável — e pode ser contornada por prompt injection.
 */
const POLICY_LEAK_PATTERNS = [
  { re: /\b\d{1,2}\s?%\s*(de\s+)?desconto/i, message: 'percentual de desconto embutido' },
  { re: /desconto\s+(de\s+)?(até\s+)?\d/i, message: 'valor de desconto embutido' },
  { re: /estender?\s+(o\s+)?(teste|trial)\s+(por\s+)?\d+\s*dias?/i, message: 'dias de extensão embutidos' },
  { re: /no\s+máximo\s+\d+\s+mensagens?/i, message: 'limite de frequência embutido' },
  { re: /R\$\s?\d+[.,]\d{2}/, message: 'valor em reais embutido' },
];

interface Issue {
  file: string;
  severity: 'erro' | 'aviso';
  message: string;
}

/** Leitor mínimo de front-matter YAML — evita dependência só para isto. */
function parseFrontMatter(content: string): Record<string, string> | null {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;

  const meta: Record<string, string> = {};
  for (const line of content.slice(4, end).split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) meta[key] = value;
  }
  return meta;
}

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith('.md') && entry !== 'README.md') files.push(full);
  }
  return files;
}

function validate(file: string): Issue[] {
  const rel = relative(process.cwd(), file);
  const content = readFileSync(file, 'utf8');
  const issues: Issue[] = [];

  const meta = parseFrontMatter(content);
  if (!meta) {
    return [{ file: rel, severity: 'erro', message: 'sem front-matter YAML' }];
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in meta)) {
      issues.push({ file: rel, severity: 'erro', message: `metadado ausente: ${field}` });
    }
  }

  if (meta.status && !VALID_STATUS.includes(meta.status)) {
    issues.push({ file: rel, severity: 'erro', message: `status inválido: ${meta.status}` });
  }
  if (meta.risk_level && !VALID_RISK.includes(meta.risk_level)) {
    issues.push({ file: rel, severity: 'erro', message: `risk_level inválido: ${meta.risk_level}` });
  }
  if (meta.version && !/^\d+\.\d+\.\d+$/.test(meta.version)) {
    issues.push({ file: rel, severity: 'erro', message: `version deve ser semântica: ${meta.version}` });
  }

  const body = content.slice(content.indexOf('\n---', 3) + 4);
  for (const { re, message } of POLICY_LEAK_PATTERNS) {
    if (re.test(body)) {
      issues.push({
        file: rel,
        severity: 'erro',
        message: `${message} — regra comercial pertence a config/, não ao prompt (ADR-006)`,
      });
    }
  }

  if (meta.status === 'aprovado' && (!meta.approved_by || meta.approved_by === 'null')) {
    issues.push({ file: rel, severity: 'erro', message: 'status "aprovado" sem approved_by' });
  }

  return issues;
}

function main(): void {
  console.log('🔍 Validando prompts…\n');

  const files = walk(PROMPTS_DIR);
  if (files.length === 0) {
    console.log('ℹ️  Nenhum prompt encontrado.');
    return;
  }

  const issues = files.flatMap(validate);
  for (const issue of issues) {
    console.log(`${issue.severity === 'erro' ? '❌' : '⚠️ '} ${issue.file}: ${issue.message}`);
  }

  const errors = issues.filter((i) => i.severity === 'erro');
  console.log(`\n${files.length} prompt(s), ${errors.length} erro(s).`);

  if (errors.length > 0) {
    console.error('\n❌ Prompt reprovado.');
    process.exit(1);
  }
  console.log('✅ Prompts válidos.');
}

main();
