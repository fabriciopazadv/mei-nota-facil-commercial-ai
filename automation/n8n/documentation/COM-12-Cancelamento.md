# COM-12-Cancelamento — Cancelamento

| Campo | Valor |
|---|---|
| Fase | 5 |
| Status | Especificado — não implementado |
| Gatilho | `cancellation_requested`, `subscription_cancelled` |
| Responsável | Proprietário |

## Finalidade

**Cancelamento pedido é cancelamento respeitado.**

Reconhece o pedido de imediato, pergunta o motivo **uma vez** com interesse genuíno, oferece no máximo **uma** alternativa autorizada, e encerra se a pessoa reafirmar.

Proibido: dificultar, insistir, sumir, exigir atendente, oferecer desconto fora da política, usar culpa.

Reclamação grave, pedido de reembolso ou ameaça judicial → **humano imediatamente**, sem responder ao mérito.

A primeira ação do workflow é **parar todas as sequências ativas**. Cliente que pediu cancelamento recebendo mensagem de venda é a forma mais rápida de virar reclamação pública.

## Entrada

Evento de cancelamento.

## Saída

Motivo registrado; sequências encerradas; contato movido para reativação futura.

## Credenciais necessárias

HubSpot.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`

## Tratamento de erro

Falha do HubSpot → enfileira. O encerramento das sequências acontece de qualquer forma.

## Idempotência

Um registro por cancelamento.

## Testes

Cancelamento com e sem motivo; cancelamento com reclamação (vai para humano); cancelamento após alternativa oferecida; reativação posterior.

## Rollback

Não há rollback do cancelamento em si — é decisão do cliente.
