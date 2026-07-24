# COM-03-WhatsApp-Inbound — WhatsApp Inbound

| Campo | Valor |
|---|---|
| Fase | 2 |
| Status | Especificado — não implementado |
| Gatilho | Webhook da Meta (GET de verificação + POST de mensagem) |
| Responsável | Proprietário |

## Finalidade

Recebe mensagens do WhatsApp. Valida `X-Hub-Signature-256` sobre o corpo bruto.

**A detecção de opt-out roda antes de qualquer IA** — é regra, não interpretação. Um modelo pode ser convencido a ignorar um pedido de descadastramento; uma comparação de texto não pode.

Depois: abre ou renova a janela de 24h, busca o contato, evita resposta duplicada, classifica a intenção com modelo econômico e seleciona o agente. Confiança abaixo do limiar → humano.

## Entrada

Payload da WhatsApp Cloud API.

## Saída

Mensagem classificada e respondida, ou encaminhada a humano. Atividade registrada no HubSpot.

## Credenciais necessárias

WhatsApp Cloud API (token de sistema).

## Variáveis

`WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`

## Tratamento de erro

Assinatura inválida → `401`. Sempre responde `200` rápido e processa depois: processamento lento gera reentrega pela Meta e resposta duplicada.

## Idempotência

Trava por id da mensagem. A Meta reenvia em caso de falha.

## Testes

Assinatura válida e inválida; handshake de verificação; opt-out; mensagem duplicada; áudio/imagem; contato desconhecido; intenção ambígua; mais de 20 mensagens/hora do mesmo número.

## Rollback

Desativar o webhook na Meta. Mensagens ficam sem resposta — avisar por outro canal se prolongado.
