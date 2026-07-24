# COM-16-Aprovacao-Humana — Aprovação Humana

| Campo | Valor |
|---|---|
| Fase | 1 |
| Status | Especificado — não implementado |
| Gatilho | Sub-workflow, chamado por qualquer ação que exija aprovação |
| Responsável | Proprietário |

## Finalidade

Guarda de tudo que é irreversível.

Cada solicitação informa: o que se pretende fazer, para quem, por quê, qual regra disparou, custo estimado, o que acontece se ninguém responder, e o prazo.

**Silêncio nunca aprova.** Sem resposta no prazo, a ação não executa e fica registrada como não aprovada. O contrário transformaria a aprovação em teatro.

A verificação da matriz acontece em **código**, antes de chegar aqui — nunca é confiada ao prompt (ADR-007).

## Entrada

Ação pretendida, contexto, custo estimado, regra que disparou.

## Saída

Ação executada após aprovação, ou registrada como não aprovada.

## Credenciais necessárias

E-mail ou canal de notificação.

## Variáveis

`EMAIL_PROVIDER`, `OPS_CONTACT`

## Tratamento de erro

Falha na notificação → tenta canal alternativo. Sem conseguir notificar, a ação **não** executa.

## Idempotência

Uma solicitação por ação. Aprovar duas vezes não executa duas vezes.

## Testes

Aprovação concedida; negada; **sem resposta** (não executa); ação fora da matriz; falha de notificação.

## Rollback

Ação não executada não precisa de rollback — é a vantagem de pedir antes.
