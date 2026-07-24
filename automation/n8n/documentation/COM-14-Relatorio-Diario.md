# COM-14-Relatorio-Diario — Relatório Diário

| Campo | Valor |
|---|---|
| Fase | 6 |
| Status | Especificado — não implementado |
| Gatilho | Cron diário |
| Responsável | Proprietário |

## Finalidade

Informa: novos leads, novos testes, **cadastrados sem trial**, usuários ativados, conversões, pagamentos falhos, cancelamentos, contatos que exigem atenção, falhas técnicas, custos do dia e anomalias.

Separa explicitamente **fato**, **métrica**, **inferência** e **recomendação**. Misturar os quatro é a forma mais comum de relatório enganar quem o lê.

Processamento em lote, sem IA no caminho principal — o custo precisa ser desprezível.

## Entrada

Dados do dia no HubSpot e nos registros de execução.

## Saída

Relatório enviado ao proprietário.

## Credenciais necessárias

HubSpot, e-mail.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`

## Tratamento de erro

Falha → tenta de novo em 1 hora. Duas falhas → alerta: relatório que não chega é sinal de problema maior.

## Idempotência

Um relatório por dia. Reexecução substitui, não duplica.

## Testes

Dia com e sem movimento; falha de fonte de dados; anomalia detectada.

## Rollback

Nenhum — relatório é somente leitura.
