# COM-05-Qualificacao-Lead — Qualificação de Lead

| Campo | Valor |
|---|---|
| Fase | 2 |
| Status | Especificado — não implementado |
| Gatilho | Sub-workflow, chamado pelo COM-03 ou por `lead_created` |
| Responsável | Proprietário |

## Finalidade

Descobre quem é a pessoa e se ela é do público do produto: já é MEI? há quanto tempo? o que faz? qual a dor?

Usa modelo econômico para extrair informação da conversa. O cálculo de score é **determinístico**, sobre os pesos de `config/commercial-rules/lead-scoring.json` — nunca a IA decidindo o número.

## Entrada

Contato e histórico da conversa.

## Saída

Perfil identificado, score de intenção atualizado, negócio criado ou movido no HubSpot.

## Credenciais necessárias

HubSpot.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`

## Tratamento de erro

Falha da IA → cai para classificação por palavra-chave. Falha do HubSpot → enfileira.

## Idempotência

Requalificar o mesmo contato atualiza; não cria negócio duplicado.

## Testes

Lead qualificado e não qualificado; informação insuficiente; contato já cliente; contato com opt-out.

## Rollback

Reverter o workflow. Classificações já gravadas podem ser corrigidas em lote.
