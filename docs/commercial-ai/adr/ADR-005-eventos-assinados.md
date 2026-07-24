# ADR-005 — Eventos assinados como única integração com o SaaS

| Status | Data |
|---|---|
| **Aceito** | 24/07/2026 |

## Contexto

O sistema comercial precisa saber o que acontece no aplicativo: quem se cadastrou, quem
iniciou o teste, quem abandonou o checkout, quem parou de usar.

O SaaS hoje **não emite nenhum evento**. Tem `AuditLog` (interno) e `QuoteEvent` (interno),
nenhum publicado.

## Problema

Como o sistema comercial obtém informação do SaaS?

## Opções

1. **Eventos assinados por HTTP** — o SaaS publica; o comercial consome.
2. **Acesso direto ao banco** — réplica de leitura ou usuário somente-leitura.
3. **Polling na API** — o comercial consulta periodicamente.
4. **Banco compartilhado** — os dois escrevem na mesma base.

## Decisão

**Opção 1 — eventos assinados por HMAC-SHA256, sentido único, com idempotência e fila.**

O acesso ao banco de produção do SaaS fica **proibido**, inclusive leitura.

## Justificativa

A Opção 2 acopla os dois sistemas ao schema do Prisma: qualquer migração no produto pode
quebrar o comercial silenciosamente. Pior, dá ao sistema comercial acesso a dados que ele
**não pode** tratar — clientes do MEI, documentos fiscais, contratos analisados — violando a
separação de finalidade da LGPD.

A Opção 3 é ineficiente, atrasada e não captura transição (não dá para saber que houve
abandono de checkout olhando um retrato do estado). A Opção 4 é a Opção 2 elevada ao
quadrado.

A Opção 1 é a única em que **o SaaS decide o que expor**. O comercial não pode ver o que
não lhe foi enviado — não por política, por impossibilidade técnica.

## Consequências

**Positivas** — acoplamento mínimo; o SaaS controla a exposição; a LGPD fica satisfeita por
arquitetura; captura transições, não só estados; o SaaS evolui sem quebrar o comercial;
auditável (todo evento tem id, hora e assinatura).

**Negativas** — exige construir emissor, fila e retentativa no SaaS; exige disciplina de
contrato; eventual atraso entre o fato e a reação; evento perdido é informação perdida.

**Mitigação** — fila com retentativa exponencial e fila de falhas; idempotência por
`event_id`; contrato versionado; consulta de leitura autenticada, restrita a dados
comerciais, para reconciliar quando necessário.

## Riscos

| Risco | Mitigação |
|---|---|
| Evento perdido | Fila persistente + retentativa + alerta na fila de falhas |
| Evento duplicado | Idempotência por `event_id`, janela de 7 dias |
| Segredo divergente após rotação | Aceitação dupla por 24h |
| Dado proibido vazando no payload | Validação de schema no consumidor + teste automatizado |
| Repetição de requisição capturada | Timestamp com tolerância de ±5 min |

## Reversibilidade

**Alta** para trocar o transporte (fila, mensageria) mantendo o mesmo envelope.
**Deliberadamente baixa** para o acesso direto ao banco: essa porta não deve ser aberta.
