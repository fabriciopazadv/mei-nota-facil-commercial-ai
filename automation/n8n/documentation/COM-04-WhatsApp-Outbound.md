# COM-04-WhatsApp-Outbound — WhatsApp Outbound

| Campo | Valor |
|---|---|
| Fase | 2 |
| Status | Especificado — não implementado |
| Gatilho | Sub-workflow, chamado por qualquer workflow que envie mensagem |
| Responsável | Proprietário |

## Finalidade

Único ponto de saída de mensagem no WhatsApp. Toda a economia e toda a conformidade do sistema passam por aqui.

Executa as guardas do COM-18 **antes** de qualquer envio, na ordem: kill switch → consentimento → opt-out → frequência → horário → duplicidade → teto de custo → aprovação.

Prefere sempre o caminho gratuito: responder dentro da janela aberta, e usar `utility` em vez de `marketing` para comunicação operacional. Ver `docs/commercial-ai/07-whatsapp.md` §3.

## Entrada

Contato, categoria da mensagem, template ou texto, contexto.

## Saída

Mensagem enviada e registrada, ou envio suprimido com o motivo.

## Credenciais necessárias

WhatsApp Cloud API.

## Variáveis

`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_GRAPH_VERSION`

## Tratamento de erro

Falha de envio → tenta de novo dentro do prazo válido. Janela expirada → cai para template ou e-mail. Número inválido → marca no CRM e para.

## Idempotência

Trava por `(contato, tipo de mensagem, janela de tempo)` para não enviar a mesma coisa duas vezes.

## Testes

Sem consentimento; com opt-out; acima do limite de frequência; fora do horário; janela aberta e fechada; kill switch ligado; teto de custo atingido.

## Rollback

`COMMERCIAL_AI_KILL_SWITCH=true` interrompe imediatamente, sem deploy.
