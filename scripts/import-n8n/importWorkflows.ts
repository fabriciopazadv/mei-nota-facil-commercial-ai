#!/usr/bin/env tsx
/**
 * Importa workflows do repositório para o n8n.
 *
 * Operação potencialmente destrutiva: sobrescreve o que está executando.
 * Por isso exige `--confirm`, e em produção exige também backup e aprovação
 * registrada. Ver docs/commercial-ai/12-deploy.md.
 *
 * Uso:
 *   npm run n8n:import -- --env=staging --confirm
 *   npm run n8n:import -- --env=production --confirm --backup-feito --aprovacao=<url-do-PR>
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const WORKFLOWS_DIR = join(process.cwd(), 'automation/n8n/workflows');

interface Args {
  env: string;
  confirm: boolean;
  backupFeito: boolean;
  aprovacao: string | null;
  dryRun: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (prefix: string): string | null =>
    argv.find((a) => a.startsWith(prefix))?.split('=')[1] ?? null;

  return {
    env: get('--env=') ?? 'development',
    confirm: argv.includes('--confirm'),
    backupFeito: argv.includes('--backup-feito'),
    aprovacao: get('--aprovacao='),
    dryRun: argv.includes('--dry-run'),
  };
}

function abort(message: string, hint?: string): never {
  console.error(`\n❌ ${message}`);
  if (hint) console.error(`   ${hint}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (!['development', 'staging', 'production'].includes(args.env)) {
    abort(`ambiente inválido: ${args.env}`);
  }

  console.log(`📤 Importação de workflows — ambiente "${args.env}"\n`);

  // Guardas. Quanto mais perto de produção, mais exigente.
  if (!args.confirm && !args.dryRun) {
    abort(
      'importação exige --confirm.',
      'Isso sobrescreve workflows em execução. Use --dry-run para apenas listar.'
    );
  }

  if (args.env === 'production') {
    if (!args.backupFeito) {
      abort(
        'produção exige --backup-feito.',
        'Rode antes: npm run n8n:export -- --env=production'
      );
    }
    if (!args.aprovacao) {
      abort(
        'produção exige --aprovacao=<url do pull request aprovado>.',
        'Ver config/autonomy/human-approval-rules.json → importar_workflow_em_producao.'
      );
    }
    console.log(`🔐 Aprovação registrada: ${args.aprovacao}`);
    console.log('🔐 Backup confirmado pelo operador.\n');
  }

  if (!existsSync(WORKFLOWS_DIR)) {
    abort('nenhum workflow em automation/n8n/workflows/.');
  }

  const files = readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) abort('nenhum workflow para importar.');

  if (args.dryRun) {
    console.log('🧪 Simulação — nada será alterado.\n');
    files.forEach((f) => console.log(`   • ${f}`));
    console.log(`\n${files.length} workflow(s) seriam importados.`);
    return;
  }

  const baseUrl = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!baseUrl || !apiKey) {
    abort('N8N_BASE_URL e N8N_API_KEY são obrigatórios.', 'Ver .env.example.');
  }

  let imported = 0;
  for (const file of files) {
    const workflow = JSON.parse(readFileSync(join(WORKFLOWS_DIR, file), 'utf8')) as Record<string, unknown>;

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error(`❌ ${file}: n8n respondeu ${response.status}`);
      continue;
    }
    console.log(`✅ ${file}`);
    imported += 1;
  }

  console.log(`\n${imported}/${files.length} workflow(s) importado(s).`);
  console.log('\n👉 Verifique nos próximos 30 minutos (docs/commercial-ai/12-deploy.md §7).');
  console.log('   Em caso de anomalia: COMMERCIAL_AI_KILL_SWITCH=true');
}

main().catch((err) => {
  console.error('❌ Falha na importação:', err);
  process.exit(1);
});
