# automation/n8n

Versionamento dos workflows do n8n. **O GitHub versiona; o n8n executa.**

## Pastas

| Pasta | Conteúdo |
|---|---|
| `workflows/` | JSON sanitizado dos workflows (criado na Fase 1) |
| `subworkflows/` | Sub-workflows reutilizáveis |
| `schemas/` | JSON Schema dos contratos de dados |
| `documentation/` | Um documento por workflow — **obrigatório** |
| `credentials-examples/` | Exemplos de configuração de credencial, **sem valores** |

## Estado

Nenhum workflow exportado ainda. Bloqueio **B-01**: a instância do n8n não foi
disponibilizada nesta fase (ver `docs/commercial-ai/06-n8n.md` §9).

A especificação dos 20 workflows já está pronta em `documentation/` e independe da versão
do n8n. Quando o acesso existir, a construção segue essa especificação.

## Fluxo

```bash
# 1. Editar no n8n de staging
# 2. Exportar e sanitizar
npm run n8n:export -- --env=staging

# 3. Validar (falha se sobrou credencial, token ou dado pessoal)
npm run validate:workflows

# 4. Revisar o diff ANTES de commitar
git diff

# 5. Commit + pull request + revisão humana

# 6. Importar em produção (exige backup e aprovação)
npm run n8n:import -- --env=production --confirm --backup-feito --aprovacao=<url-do-PR>
```

## Regras

- Nunca commitar JSON sem passar pelo `validate:workflows`.
- Nunca editar o JSON à mão para produção — edite no n8n e exporte.
- Todo workflow precisa do documento correspondente em `documentation/`.
- Nome no padrão `COM-NN-Nome-Em-Kebab`.
- Credencial nenhuma, em hipótese alguma.

## Ordem de construção

**Fundação primeiro:** COM-17 (erros), COM-18 (consentimento), COM-20 (custos),
COM-16 (aprovação), COM-01 (ingestão), COM-02 (HubSpot).

Nenhum workflow que envia mensagem sobe antes deles. Sem tratamento de erro, verificação de
consentimento, teto de custo e aprovação humana, um workflow de envio é um risco.
