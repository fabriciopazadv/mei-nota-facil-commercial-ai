# scripts/migrate-hubspot

Criação das propriedades, do pipeline e das listas do HubSpot descritos em
[`docs/commercial-ai/05-hubspot.md`](../../docs/commercial-ai/05-hubspot.md).

## Estado

**Não implementado.** Bloqueado por **B-03** (Private App do HubSpot) e **B-04** (fuso e
moeda do portal ainda em `US/Eastern` e `USD`).

A implementação faz parte da Fase 1. A especificação completa do que será criado já está
escrita em `05-hubspot.md` §5 a §7 — o script apenas a executa.

## Ordem obrigatória quando for implementado

1. **Corrigir fuso e moeda do portal** — `America/Sao_Paulo` e `BRL`.
   Negócio criado em USD não se converte depois, e toda data nasce deslocada.
2. Criar o grupo de propriedades `MEI Nota Fácil — Comercial`.
3. Criar as propriedades com prefixo `mnf_`.
4. Criar o pipeline comercial e suas 12 etapas.
5. Criar as listas de segmentação.
6. Validar com um contato **fictício** em staging.

## Guardas exigidas

O script seguirá o mesmo padrão de `scripts/import-n8n/`:

- `--dry-run` como padrão: lista o que faria, sem alterar nada.
- `--confirm` obrigatório para executar.
- `--env=production` exige também backup e aprovação registrada.
- **Nunca** apaga propriedade existente — apenas cria o que falta.
- Verifica antes se a propriedade já existe, para não duplicar.

## Propriedades nativas que NÃO devem ser recriadas

`email`, `phone`, `hs_whatsapp_phone_number`, `lifecyclestage`, `hs_lead_status`,
`hs_marketable_status`.

`hubspotscore` existe mas **não será usado** — os três scores do sistema são propriedades
próprias, transparentes e versionadas.
