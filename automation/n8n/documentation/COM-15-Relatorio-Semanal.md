# COM-15-Relatorio-Semanal — Relatório Semanal

| Campo | Valor |
|---|---|
| Fase | 6 |
| Status | Especificado — não implementado |
| Gatilho | Cron semanal |
| Responsável | Proprietário |

## Finalidade

Desempenho do funil comparado à semana anterior, principais origens, principais objeções, campanhas, conversão, retenção, churn, custos, aprendizados, recomendações e o que precisa de aprovação.

Uma única chamada de modelo avançado, sobre dados já agregados — não sobre registros brutos.

Quando a amostra for pequena demais para concluir, o relatório **diz isso** em vez de inferir sobre ruído.

## Entrada

Dados da semana e da semana anterior.

## Saída

Relatório analítico enviado ao proprietário.

## Credenciais necessárias

HubSpot, e-mail, IA (modelo avançado, uma única chamada).

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`, `AI_MODEL_ADVANCED`

## Tratamento de erro

Falha da IA → envia a parte quantitativa sem a análise. O número é mais importante que o comentário.

## Idempotência

Um relatório por semana.

## Testes

Semana com e sem dados suficientes; comparação com semana anterior; teto de custo de IA atingido.

## Rollback

Nenhum — somente leitura.
