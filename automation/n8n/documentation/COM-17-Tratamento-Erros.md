# COM-17-Tratamento-Erros — Tratamento de Erros

| Campo | Valor |
|---|---|
| Fase | 1 |
| Status | Especificado — não implementado |
| Gatilho | Error Workflow global do n8n |
| Responsável | Proprietário |

## Finalidade

**Nenhum workflow falha em silêncio.**

Classifica entre temporário (API fora, timeout, `429`) e permanente (schema inválido, credencial revogada, defeito). Temporário reprocessa; permanente vai para a fila de falhas e alerta.

Alerta quando ultrapassa o limite de erros por hora definido em `config/limits/message-limits.json`.

Log **sempre mascarado** — erro costuma carregar payload, e payload costuma carregar dado pessoal.

## Entrada

Erro de qualquer workflow.

## Saída

Erro classificado, retentativa decidida, fila de falhas alimentada, alerta emitido.

## Credenciais necessárias

E-mail ou canal de notificação.

## Variáveis

`EMAIL_PROVIDER`, `OPS_CONTACT`

## Tratamento de erro

Este é o tratamento de erro. Se ele próprio falhar, registra localmente e alerta por canal alternativo.

## Idempotência

Erros idênticos em sequência são agrupados — não geram um alerta cada.

## Testes

Erro temporário; permanente; em cascata; fila de falhas cheia; falha do próprio alerta.

## Rollback

Não aplicável.
