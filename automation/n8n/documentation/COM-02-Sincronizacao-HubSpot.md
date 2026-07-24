# COM-02-Sincronizacao-HubSpot — Sincronização HubSpot

| Campo | Valor |
|---|---|
| Fase | 1 |
| Status | Especificado — não implementado |
| Gatilho | Sub-workflow, chamado pelo COM-01 |
| Responsável | Proprietário |

## Finalidade

Mantém o HubSpot como espelho do estado comercial. Ordem de deduplicação: e-mail normalizado → `mnf_saas_user_id` → telefone em E.164.

Atualiza em lote sempre que possível, para não estourar o limite de API.

⚠️ **Nunca sincroniza `Customer` do SaaS** — aqueles são os clientes *do MEI*, e levá-los ao nosso CRM violaria a finalidade do tratamento (`lgpd-mapa-de-dados.md` §3).

## Entrada

Evento normalizado + dados do contato.

## Saída

Contato criado ou atualizado no HubSpot; negócio movido de etapa; atividade registrada.

## Credenciais necessárias

HubSpot Private App (escopos em `docs/commercial-ai/05-hubspot.md` §9).

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_PORTAL_ID`

## Tratamento de erro

`429` → recuo exponencial (limite de 10 req/s por portal). `5xx` → enfileira e tenta de novo. Falha persistente → fila de falhas e alerta.

## Idempotência

Sempre **upsert** por e-mail normalizado, nunca `create` cego. A trava do COM-01 impede corrida entre eventos simultâneos.

## Testes

Contato novo; contato existente (não duplica); e-mail com maiúscula e espaço; HubSpot fora do ar; `429`; corrida entre dois eventos do mesmo usuário.

## Rollback

Reverter para a versão anterior do workflow. Dados já gravados no CRM podem exigir correção manual.
