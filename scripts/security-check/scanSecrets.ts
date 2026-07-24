#!/usr/bin/env tsx
/**
 * Varredura de segredos e dados pessoais.
 *
 * Roda no CI em todo pull request. Falha bloqueia o merge — ver SECURITY.md §7.
 *
 * Uso: npm run security:check
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'logs', 'backups',
]);

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.ico', '.woff', '.woff2', '.ttf',
]);

/**
 * Domínios e valores reconhecidos como exemplo — não são achado.
 * Comparação em minúsculo (ver `isAllowed`).
 */
const ALLOWED_SAMPLES = [
  'example.com', 'example.org', 'localhost', 'seu-dominio', 'meinotafacil.com.br',
  'git@github.com', 'noreply@', 'user:password@host',
  '000.000.000-00', '00.000.000/0001-00', '00000000000000',
  'gere-um-segredo-forte', 'segredo-de-teste', 'nao-usar-em-producao',
];

/** Marcas de valor claramente fictício em atribuição de segredo. */
const FAKE_VALUE_MARKERS = ['teste', 'test', 'exemplo', 'example', 'fake', 'dummy', 'fixture'];

/**
 * Telefone brasileiro cuja parte do assinante é uma sequência de zeros é
 * fictício por construção (`+5511900000000`, `+551130000000`). Reconhecer o
 * padrão evita manter uma lista que cresce a cada fixture nova.
 */
const FAKE_PHONE = /^\+?55?\s?\(?\d{2}\)?\s?9?0{4}[\s-]?0{4}$/;

interface Rule {
  name: string;
  regex: RegExp;
  severity: 'erro' | 'aviso';
}

const RULES: Rule[] = [
  { name: 'Chave da Anthropic', regex: /sk-ant-[A-Za-z0-9_-]{20,}/g, severity: 'erro' },
  { name: 'Chave da OpenAI', regex: /\bsk-[A-Za-z0-9]{32,}\b/g, severity: 'erro' },
  { name: 'Token do HubSpot', regex: /\bpat-[a-z0-9]{2,4}-[A-Za-z0-9-]{20,}/g, severity: 'erro' },
  { name: 'Token do Google/Gemini', regex: /\bAIza[A-Za-z0-9_-]{30,}\b/g, severity: 'erro' },
  { name: 'Token de acesso da Meta', regex: /\bEAA[A-Za-z0-9]{40,}\b/g, severity: 'erro' },
  { name: 'Chave da AWS', regex: /\bAKIA[0-9A-Z]{16}\b/g, severity: 'erro' },
  { name: 'JWT', regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: 'erro' },
  { name: 'Chave privada', regex: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g, severity: 'erro' },
  { name: 'URL de banco com senha', regex: /(postgres|postgresql|mysql|mongodb|redis):\/\/[^\s:'"]+:[^\s@'"]+@/g, severity: 'erro' },
  { name: 'Atribuição de segredo com valor', regex: /\b(api[_-]?key|access[_-]?token|secret|passwd|password|senha)\s*[:=]\s*['"][^'"\s]{12,}['"]/gi, severity: 'aviso' },
  { name: 'CPF', regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, severity: 'aviso' },
  { name: 'CNPJ', regex: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, severity: 'aviso' },
  { name: 'Telefone brasileiro', regex: /\+55\s?\d{2}\s?9?\d{4}[\s-]?\d{4}/g, severity: 'aviso' },
  { name: 'E-mail', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, severity: 'aviso' },
];

interface Finding {
  file: string;
  line: number;
  rule: string;
  severity: 'erro' | 'aviso';
  excerpt: string;
}

function isAllowed(match: string, ruleName: string): boolean {
  const value = match.toLowerCase();

  if (ALLOWED_SAMPLES.some((sample) => value.includes(sample.toLowerCase()))) return true;

  if (ruleName === 'Telefone brasileiro') {
    // Aceita tanto o número fictício quanto sua forma já mascarada (+55119****0000).
    if (FAKE_PHONE.test(match.trim()) || match.includes('*')) return true;
    const digits = match.replace(/\D/g, '');
    if (/0{6,}/.test(digits)) return true;
  }

  if (ruleName === 'Atribuição de segredo com valor') {
    if (FAKE_VALUE_MARKERS.some((marker) => value.includes(marker))) return true;
  }

  return false;
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (!BINARY_EXT.has(extname(entry))) files.push(full);
  }
  return files;
}

function scanFile(path: string): Finding[] {
  const rel = relative(ROOT, path);
  // O próprio scanner contém os padrões que procura.
  if (rel.includes('scripts/security-check')) return [];

  const findings: Finding[] = [];
  const lines = readFileSync(path, 'utf8').split('\n');

  lines.forEach((line, index) => {
    for (const rule of RULES) {
      rule.regex.lastIndex = 0;
      for (const match of line.matchAll(rule.regex)) {
        if (isAllowed(match[0], rule.name)) continue;
        findings.push({
          file: rel,
          line: index + 1,
          rule: rule.name,
          severity: rule.severity,
          // Nunca imprimir o valor encontrado: o log do CI é público na organização.
          excerpt: `${match[0].slice(0, 4)}…${match[0].length} caracteres`,
        });
      }
    }
  });
  return findings;
}

function main(): void {
  console.log('🔍 Varredura de segredos e dados pessoais…\n');

  const findings = walk(ROOT).flatMap(scanFile);
  const errors = findings.filter((f) => f.severity === 'erro');
  const warnings = findings.filter((f) => f.severity === 'aviso');

  for (const f of [...errors, ...warnings]) {
    const icon = f.severity === 'erro' ? '❌' : '⚠️ ';
    console.log(`${icon} ${f.file}:${f.line} — ${f.rule} (${f.excerpt})`);
  }

  console.log(`\n${errors.length} erro(s), ${warnings.length} aviso(s).`);

  if (errors.length > 0) {
    console.error('\n❌ Segredo detectado. O merge está bloqueado.');
    console.error('   Revogue a credencial ANTES de remover do código — considere-a comprometida.');
    process.exit(1);
  }
  if (warnings.length > 0) {
    console.warn('\n⚠️  Avisos encontrados. Confirme que são dados fictícios (SECURITY.md §3).');
    process.exit(1);
  }
  console.log('✅ Nada encontrado.');
}

main();
