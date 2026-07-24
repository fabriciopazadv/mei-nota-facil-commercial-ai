# COM-11-Retencao — Retenção

| Campo | Valor |
|---|---|
| Fase | 5 |
| Status | Especificado — não implementado |
| Gatilho | Agenda diária + eventos de inatividade |
| Responsável | Proprietário |

## Finalidade

Age antes do pedido de cancelamento.

Ação por faixa: baixo → nada; médio → conteúdo educativo por e-mail; alto → contato de retenção; crítico → tarefa humana em até 4 horas.

Antes de qualquer mensagem, a pergunta é: **eu tenho algo útil a dizer?** "Sentimos sua falta" não ajuda ninguém. Se não há nada útil, não manda nada.

## Entrada

Clientes ativos com scores de risco.

## Saída

Ação conforme a faixa de risco: nada, conteúdo, contato ou tarefa humana.

## Credenciais necessárias

HubSpot, e-mail, WhatsApp.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`

## Tratamento de erro

Falha de canal → alternativo. Risco crítico sempre gera tarefa humana, mesmo com falha de envio.

## Idempotência

Uma ação de retenção por faixa, por período.

## Testes

Risco baixo/médio/alto/crítico; risco caindo após ação; cancelamento durante a sequência; cliente sem consentimento.

## Rollback

Desativar. Ações de retenção param; tarefas humanas continuam.
