# COM-13-Reativacao — Reativação

| Campo | Valor |
|---|---|
| Fase | 5 |
| Status | Especificado — não implementado |
| Gatilho | Agenda mensal |
| Responsável | Proprietário |

## Finalidade

Ex-cliente merece mais cuidado que lead novo: ele já disse não uma vez.

Só aborda depois do prazo mínimo da política, e **só se houver algo novo de verdade** — não apenas porque o prazo passou.

Nunca reativa quem deu opt-out, encerrou o MEI ou registrou reclamação grave.

⚖️ Reativação após período longo pode exigir consentimento novo. **Pendente de validação jurídica** (`lgpd-base-legal.md` §2.6).

## Entrada

Ex-clientes elegíveis.

## Saída

Contato de reativação, quando houver motivo real.

## Credenciais necessárias

HubSpot, e-mail.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`

## Tratamento de erro

Falha → tenta no ciclo seguinte, respeitando o limite de tentativas.

## Idempotência

Máximo de duas tentativas por ex-cliente, com intervalo longo.

## Testes

Elegível e não elegível; opt-out; MEI encerrado; reclamação registrada; reativação bem-sucedida.

## Rollback

Desativar. Nenhuma reativação sai.
