# COM-01-Ingestao-Eventos — Ingestão de Eventos

| Campo | Valor |
|---|---|
| Fase | 1 |
| Status | Especificado — não implementado |
| Gatilho | Webhook `POST /webhook/commercial-events` |
| Responsável | Proprietário |

## Finalidade

Porta de entrada de todo o sistema. Valida a assinatura HMAC **antes** de qualquer processamento, deduplica por `event_id`, valida o schema, normaliza telefone para E.164 e encaminha.

Responde rápido e processa em segundo plano: processamento síncrono demorado faz o produtor considerar falha e reenviar.

**Ponto de atenção:** ao receber `registration_completed` sem `trial_started` correspondente em 30 minutos, marca o contato como `sem_trial` — o maior gargalo conhecido do funil (`docs/commercial-ai/04-eventos.md` §4).

## Entrada

Envelope de evento assinado pelo SaaS. Schema em `automation/n8n/schemas/event-envelope.schema.json`.

## Saída

Evento normalizado, encaminhado ao Diretor Comercial. Resposta HTTP ao produtor em menos de 2s.

## Credenciais necessárias

Nenhuma — só valida assinatura.

## Variáveis

`WEBHOOK_SIGNING_SECRET`

## Tratamento de erro

Assinatura inválida → `401`, registra, não reprocessa. Schema inválido → `400`. Evento desconhecido → `422`. Falha interna → `5xx`, o produtor reenvia com recuo. Erros vão para COM-17.

## Idempotência

Trava por `event_id`, janela de 7 dias. Duplicata responde `200 {"duplicate":true}` sem efeito.

## Testes

Assinatura válida e inválida; timestamp expirado; `event_id` repetido; schema inválido; evento desconhecido; telefone em formato local; `metadata` com chave proibida.

## Rollback

Desativar o webhook. Os eventos ficam na fila do SaaS e reprocessam quando voltar — nada se perde.
