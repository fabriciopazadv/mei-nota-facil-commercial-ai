# ADR-001 — Repositório separado para o sistema comercial

| Status | Data | Decisor |
|---|---|---|
| **Aceito** | 24/07/2026 | Proprietário, sob recomendação técnica |

## Contexto

O SaaS vive em `fabriciopazadv/mei-facil` (Next.js 16, Prisma, PostgreSQL, Vercel). Não é
monorepositório: não há `apps/`, `packages/` nem workspaces. O repositório
`mei-nota-facil-commercial-ai` já existia, vazio.

## Problema

Onde construir o sistema comercial: dentro do repositório do produto ou separado?

## Opções

1. **Repositório separado** — dois repositórios, comunicação por evento assinado.
2. **Monorepositório** — reestruturar `mei-facil` em `apps/` + `packages/`.
3. **Sem repositório** — tudo dentro do n8n.

## Decisão

**Opção 1 — repositório separado.**

## Justificativa

O argumento decisivo é **superfície de comprometimento**, não organização de código.

O sistema comercial manipula tokens da Meta, do HubSpot e do n8n, além de dados de contato
e conversas. O SaaS manipula certificado digital A1, emissão fiscal e a base de clientes de
cada MEI — perímetro regulado.

Unir os repositórios daria a quem ajusta um texto de WhatsApp o mesmo acesso de quem mexe no
manuseio de certificado digital. Nenhuma conveniência de tipagem compensa isso.

Segundo argumento: a Opção 2 exigiria reestruturar um SaaS em produção, com risco real e
zero ganho para o produto. A Opção 3 elimina versionamento, revisão, teste e rollback.

## Consequências

**Positivas** — perímetros isolados; permissões granulares; CI rápido; políticas comerciais
versionadas; mudança comercial não põe o produto em risco.

**Negativas** — schema de eventos em dois lugares; mudanças atravessadas exigem dois pull
requests; sem tipos compartilhados por import.

**Mitigação** — `integration-contract.md` como contrato normativo, JSON Schema publicado e
testes de contrato sobre fixtures compartilhadas.

## Riscos

| Risco | Mitigação |
|---|---|
| Contratos divergirem | Testes de contrato dos dois lados |
| Duplicação de lógica | Só o schema é duplicado; regra fica de um lado só |
| Coordenação de releases | Versionamento com compatibilidade de 30 dias |

## Reversibilidade

**Alta.** Mover para `apps/commercial-ai/` no `mei-facil` é trabalho de horas, sem perda de
histórico. A decisão contrária (extrair de um monorepo enraizado) é que seria cara.
Começamos pela opção reversível.
