# COM-07-Ativacao-Usuario — Ativação de Usuário

| Campo | Valor |
|---|---|
| Fase | 3 |
| Status | Especificado — não implementado |
| Gatilho | Eventos de primeira utilização |
| Responsável | Proprietário |

## Finalidade

Mede o quanto a pessoa realmente usa o produto e sugere o próximo passo útil.

Marcos: cadastrado → explorando → ativado → engajado. Emitir o primeiro recibo é o sinal mais forte de valor percebido; tentar emitir NFS-e é o sinal mais forte de intenção de compra.

Cálculo inteiramente determinístico. **Custo de IA: zero.**

## Entrada

Evento de ativação (`first_receipt_created`, `nfse_completed` etc.).

## Saída

Score de ativação atualizado; estágio movido; próxima função sugerida.

## Credenciais necessárias

HubSpot.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`

## Tratamento de erro

Falha do HubSpot → enfileira e tenta de novo.

## Idempotência

Score recalculado é idempotente: o mesmo conjunto de sinais produz sempre o mesmo valor.

## Testes

Primeira ativação; ativação repetida; sinal desconhecido; score no teto.

## Rollback

Recalcular scores a partir do histórico de eventos.
