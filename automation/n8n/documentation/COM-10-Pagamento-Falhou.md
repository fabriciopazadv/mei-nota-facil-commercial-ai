# COM-10-Pagamento-Falhou — Pagamento Falhou

| Campo | Valor |
|---|---|
| Fase | 4 |
| Status | Especificado — não implementado |
| Gatilho | `payment_failed` |
| Responsável | Proprietário |

## Finalidade

Falha de pagamento **não é cobrança: é serviço**. A pessoa provavelmente não sabe que o cartão falhou e vai perder acesso sem entender por quê.

Três tentativas escalonadas (2h, 48h, 120h), com tom informativo e solução concreta. Depois disso, tarefa humana. Sem ameaça, sem "regularize imediatamente".

Como tem consequência concreta para o usuário, é comunicação de utilidade — usa `utility`, nunca `marketing`.

## Entrada

Evento de falha de pagamento.

## Saída

Sequência de aviso pelos canais adequados; risco atualizado.

## Credenciais necessárias

HubSpot, WhatsApp, e-mail.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`

## Tratamento de erro

Verificar o status antes de cada tentativa — pode ter sido regularizado.

## Idempotência

Uma sequência por ciclo de cobrança falho.

## Testes

Primeira falha; falha repetida; regularização no meio da sequência; cancelamento durante a sequência.

## Rollback

Desativar. Avisos param.
