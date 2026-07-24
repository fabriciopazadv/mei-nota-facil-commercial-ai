# Guia de contribuição

## 1. Regras que não se negociam

1. Nenhuma credencial, token ou dado pessoal entra no repositório. Ver [SECURITY.md](SECURITY.md).
2. `main` só recebe pull request revisado. Sem push direto.
3. Mudança que gera custo, altera preço, concede desconto, dispara campanha ou toca em
   produção exige **aprovação humana explícita** registrada no pull request.
4. Uma branch, um escopo. Não misture assuntos.
5. Se `npm run check` falha, o trabalho não está pronto.

## 2. Branches

```
main                              versões estáveis, protegida
develop                           integração das fases
feature/<escopo>                  nova funcionalidade
fix/<escopo>                      correção
security/<escopo>                 correção de segurança
docs/<escopo>                     documentação
refactor/<escopo>                 refatoração sem mudança de comportamento
```

Exemplos: `feature/whatsapp-cloud-api`, `fix/duplicate-hubspot-contact`,
`security/webhook-signature-validation`.

## 3. Commits

Formato: `tipo(escopo): descrição`

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `security`, `chore`, `ci`, `perf`.

```
feat(whatsapp): adiciona webhook de mensagens recebidas
fix(events): impede processamento duplicado
security(webhook): valida assinatura das requisições
docs(n8n): documenta importação dos workflows
```

Proibidos: `update`, `changes`, `fix`, `final`, `ajustes`.

## 4. Antes de abrir o pull request

```bash
npm run check
```

Cobre: typecheck, testes, validação das políticas comerciais, validação dos workflows do
n8n, validação de metadados dos prompts e varredura de segredos.

## 5. Pull request

Use o [template](.github/PULL_REQUEST_TEMPLATE.md). Ele exige objetivo, arquivos alterados,
testes executados, riscos, variáveis novas, plano de rollback e os checklists de segurança,
LGPD e custos.

Um pull request que toca em política comercial (`config/commercial-rules/`,
`config/autonomy/`, `config/costs/`) só é aprovado pelo proprietário.

## 6. Alterando prompts

Prompt em produção não muda sem registro. Todo arquivo em `prompts/` carrega metadados
YAML obrigatórios (`name`, `agent`, `version`, `status`, `owner`, `approved_by`, `model`,
`purpose`, `risk_level`). Ao alterar:

1. Incremente `version`.
2. Descreva o motivo no corpo do pull request.
3. Rode `npm run validate:prompts`.
4. Rode as avaliações de `prompts/evaluations/` — resposta proibida, promessa indevida,
   desconto não autorizado, link incorreto, falta de encaminhamento humano, desrespeito ao
   opt-out.

## 7. Alterando políticas comerciais

Os pesos de score, a política de desconto, os limites de contato e os tetos de custo vivem
em `config/`, **nunca** dentro de prompt ou de código. A IA não altera esses arquivos: quem
altera é uma pessoa, por pull request, com justificativa.

## 8. Workflows do n8n

Nunca edite o JSON à mão para produção. O caminho é: editar no n8n de staging →
`npm run n8n:export -- --env=staging` → revisar o diff sanitizado → commit → pull request.
Todo workflow precisa do documento correspondente em `automation/n8n/documentation/`.

## 9. Fases

O trabalho é organizado nas fases 0 a 7 descritas em
[docs/commercial-ai/15-roadmap.md](docs/commercial-ai/15-roadmap.md). Toda issue e todo
pull request declaram a qual fase pertencem.
