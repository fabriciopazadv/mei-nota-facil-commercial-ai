#!/usr/bin/env tsx
/**
 * Exporta workflows do n8n e SANITIZA antes de gravar no repositório.
 *
 * O GitHub versiona; o n8n executa. A sanitização é obrigatória: credencial,
 * token, header sensível e dado de execução nunca podem chegar ao Git.
 * Ver docs/commercial-ai/06-n8n.md §6.
 *
 * Uso: npm run n8n:export -- --env=staging
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = join(process.cwd(), 'automation/n8n/workflows');

/** Chaves removidas por completo do JSON exportado. */
const STRIP_KEYS = [
  'credentials', 'accessToken', 'access_token', 'apiKey', 'api_key',
  'authorization', 'password', 'privateKey', 'clientSecret', 'appSecret',
  'pinData', 'sessionId', 'cookie', 'staticData',
];

/** Metadados de execução que não descrevem o workflow. */
const STRIP_META = ['createdAt', 'updatedAt', 'versionId', 'triggerCount', 'shared'];

function parseArgs(): { env: string } {
  const envArg = process.argv.find((a) => a.startsWith('--env='));
  const env = envArg?.split('=')[1] ?? 'development';
  if (!['development', 'staging', 'production'].includes(env)) {
    console.error(`❌ ambiente inválido: ${env}`);
    process.exit(1);
  }
  return { env };
}

/** Remove recursivamente tudo que não pode ser versionado. */
export function sanitize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitize);

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (STRIP_KEYS.some((k) => k.toLowerCase() === lower)) continue;
    if (STRIP_META.includes(key)) continue;
    // URL de webhook pode conter caminho secreto.
    if (lower === 'webhookid') {
      out[key] = '__REMOVIDO__';
      continue;
    }
    out[key] = sanitize(child);
  }
  return out;
}

async function main(): Promise<void> {
  const { env } = parseArgs();

  const baseUrl = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error('❌ N8N_BASE_URL e N8N_API_KEY são obrigatórios.');
    console.error('   Configure no .env local. Ver .env.example.');
    console.error('\n   Bloqueio B-01: a instância do n8n ainda não foi disponibilizada.');
    console.error('   Ver docs/commercial-ai/06-n8n.md §9.');
    process.exit(1);
  }

  console.log(`📥 Exportando workflows do ambiente "${env}"…\n`);

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': apiKey, Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    console.error(`❌ n8n respondeu ${response.status}`);
    process.exit(1);
  }

  const body = (await response.json()) as { data?: Array<Record<string, unknown>> };
  const workflows = body.data ?? [];

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  let exported = 0;
  for (const workflow of workflows) {
    const name = String(workflow.name ?? '');
    if (!/^COM-\d{2}-/.test(name)) {
      console.log(`⏭️  Ignorado (fora do padrão COM-NN): ${name}`);
      continue;
    }

    const clean = sanitize(workflow);
    const file = join(OUTPUT_DIR, `${name}.json`);
    writeFileSync(file, `${JSON.stringify(clean, null, 2)}\n`, 'utf8');
    console.log(`✅ ${name}.json`);
    exported += 1;
  }

  console.log(`\n${exported} workflow(s) exportado(s) e sanitizado(s).`);
  console.log('\n👉 Próximo passo obrigatório:');
  console.log('   npm run validate:workflows   (confirma que nada sensível sobreviveu)');
  console.log('   git diff                     (revise ANTES de commitar)');
}

main().catch((err) => {
  console.error('❌ Falha na exportação:', err);
  process.exit(1);
});
