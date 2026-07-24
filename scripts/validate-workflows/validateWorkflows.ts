#!/usr/bin/env tsx
/**
 * Validação dos workflows do n8n antes do commit.
 *
 * Um workflow que não passa aqui NÃO entra no repositório. Ver
 * docs/commercial-ai/06-n8n.md §6.
 *
 * Uso: npm run validate:workflows
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const WORKFLOWS_DIR = join(process.cwd(), 'automation/n8n/workflows');
const DOCS_DIR = join(process.cwd(), 'automation/n8n/documentation');

const NAME_PATTERN = /^COM-\d{2}-[A-Za-zÀ-ÿ0-9-]+\.json$/;

/** Campos que jamais podem sobreviver à sanitização. */
const FORBIDDEN_KEYS = [
  'credentials', 'accessToken', 'access_token', 'apiKey', 'api_key',
  'authorization', 'password', 'privateKey', 'clientSecret', 'appSecret',
  'pinData', 'sessionId', 'cookie',
];

const SECRET_VALUE_PATTERNS = [
  /sk-ant-[A-Za-z0-9_-]{20,}/,
  /\bpat-[a-z0-9]{2,4}-[A-Za-z0-9-]{20,}/,
  /\bEAA[A-Za-z0-9]{40,}\b/,
  /\bAIza[A-Za-z0-9_-]{30,}\b/,
  /(postgres|postgresql|mysql|mongodb|redis):\/\/[^\s:'"]+:[^\s@'"]+@/,
];

/** Dados pessoais que podem ter sobrado num nó de teste. */
const PERSONAL_DATA_PATTERNS = [
  { name: 'CPF', re: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/ },
  { name: 'CNPJ', re: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/ },
  { name: 'telefone', re: /\+55\s?\d{2}\s?9?\d{4}[\s-]?\d{4}/ },
  { name: 'e-mail', re: /\b[A-Za-z0-9._%+-]+@(?!example\.(com|org))[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
];

const ALLOWED_SAMPLES = ['+5511900000000', '000.000.000-00', '00.000.000/0001-00'];

interface Issue {
  file: string;
  severity: 'erro' | 'aviso';
  message: string;
}

function findForbiddenKeys(value: unknown, path = '', found: string[] = []): string[] {
  if (value === null || typeof value !== 'object') return found;
  if (Array.isArray(value)) {
    value.forEach((v, i) => findForbiddenKeys(v, `${path}[${i}]`, found));
    return found;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.some((f) => f.toLowerCase() === key.toLowerCase())) {
      found.push(path ? `${path}.${key}` : key);
    }
    findForbiddenKeys(child, path ? `${path}.${key}` : key, found);
  }
  return found;
}

function validateFile(file: string): Issue[] {
  const issues: Issue[] = [];
  const name = basename(file);
  const raw = readFileSync(file, 'utf8');

  if (!NAME_PATTERN.test(name)) {
    issues.push({ file: name, severity: 'erro', message: 'nome fora do padrão COM-NN-Nome.json' });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    return [...issues, { file: name, severity: 'erro', message: `JSON inválido: ${String(err)}` }];
  }

  if (!parsed.name) issues.push({ file: name, severity: 'erro', message: 'sem campo "name"' });
  if (!Array.isArray(parsed.nodes)) {
    issues.push({ file: name, severity: 'erro', message: 'sem array "nodes"' });
  }

  for (const key of findForbiddenKeys(parsed)) {
    issues.push({ file: name, severity: 'erro', message: `campo proibido não sanitizado: ${key}` });
  }

  for (const pattern of SECRET_VALUE_PATTERNS) {
    if (pattern.test(raw)) {
      issues.push({ file: name, severity: 'erro', message: 'valor com aparência de segredo' });
    }
  }

  for (const { name: label, re } of PERSONAL_DATA_PATTERNS) {
    const match = re.exec(raw);
    if (match && !ALLOWED_SAMPLES.some((s) => match[0].includes(s))) {
      issues.push({ file: name, severity: 'erro', message: `possível dado pessoal (${label})` });
    }
  }

  const docPath = join(DOCS_DIR, name.replace('.json', '.md'));
  if (!existsSync(docPath)) {
    issues.push({ file: name, severity: 'erro', message: 'sem documentação correspondente' });
  }

  return issues;
}

function main(): void {
  console.log('🔍 Validando workflows do n8n…\n');

  if (!existsSync(WORKFLOWS_DIR)) {
    console.log('ℹ️  Nenhum workflow exportado ainda (automation/n8n/workflows/ ausente).');
    console.log('   Esperado na Fase 1. Ver docs/commercial-ai/15-roadmap.md.');
    return;
  }

  const files = readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('ℹ️  Nenhum workflow exportado ainda. Esperado na Fase 1.');
    return;
  }

  const issues = files.flatMap((f) => validateFile(join(WORKFLOWS_DIR, f)));
  for (const issue of issues) {
    console.log(`${issue.severity === 'erro' ? '❌' : '⚠️ '} ${issue.file}: ${issue.message}`);
  }

  const errors = issues.filter((i) => i.severity === 'erro');
  console.log(`\n${files.length} workflow(s), ${errors.length} erro(s).`);

  if (errors.length > 0) {
    console.error('\n❌ Workflow reprovado. Não commite antes de sanitizar.');
    process.exit(1);
  }
  console.log('✅ Workflows válidos.');
}

main();
