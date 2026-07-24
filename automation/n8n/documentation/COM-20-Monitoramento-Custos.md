# COM-20-Monitoramento-Custos — Monitoramento de Custos

| Campo | Valor |
|---|---|
| Fase | 1 |
| Status | Especificado — não implementado |
| Gatilho | Cron horário + sub-workflow de registro |
| Responsável | Proprietário |

## Finalidade

Acompanha custo de IA, custo de mensagens, custo por lead e CAC.

Alerta em 50%, 80% e 100% do teto. **Atingido o teto, o sistema cai para template determinístico** — o que não tem template vira tarefa humana. Nunca fica mudo e nunca improvisa.

Também monitora as execuções do n8n contra o limite do plano.

Contexto que dá sentido ao teto: com o ticket do produto, um CAC alto compromete meses de receita. Ver `docs/commercial-ai/11-custos.md` §5.

## Entrada

Registros de uso de IA e de mensagens.

## Saída

Custo acumulado; alertas; bloqueio ao atingir o teto.

## Credenciais necessárias

E-mail ou canal de notificação.

## Variáveis

`AI_MAX_COST_DAILY`, `AI_MAX_COST_MONTHLY`, `EMAIL_PROVIDER`

## Tratamento de erro

Falha ao calcular → assume o pior caso e alerta. Nunca assume que está barato.

## Idempotência

Cálculo sobre registros; reexecução produz o mesmo resultado.

## Testes

50%, 80% e 100% do teto; custo acima da média; execuções do n8n perto do limite do plano; CAC acima do alerta.

## Rollback

Elevar o teto exige aprovação humana — é aumento de gasto.
