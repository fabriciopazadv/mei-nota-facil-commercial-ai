# COM-09-Checkout-Abandonado — Checkout Abandonado

| Campo | Valor |
|---|---|
| Fase | 4 |
| Status | Especificado — não implementado |
| Gatilho | `checkout_started` + espera + verificação |
| Responsável | Proprietário |

## Finalidade

Quem iniciou o checkout e parou é o contato de maior intenção do funil — e o mais fácil de perder por insistência.

Aborda **uma vez**, com tom de ajuda: "vi que algo travou, posso ajudar?", nunca "você esqueceu de pagar". Frequentemente é problema técnico, não desistência — e perguntar descobre isso.

Dentro da primeira hora, WhatsApp se a janela estiver aberta (gratuito). Depois disso, e-mail — a janela provavelmente fechou, e template pago não se justifica.

⚖️ A base legal desta recuperação é legítimo interesse e **está pendente de validação jurídica** (`lgpd-base-legal.md` §2.5).

## Entrada

Evento de checkout iniciado.

## Saída

Contato de recuperação, se o checkout não se concluiu no prazo.

## Credenciais necessárias

HubSpot, WhatsApp, e-mail.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`

## Tratamento de erro

Verificar o status antes de abordar — o pagamento pode ter sido concluído nesse meio-tempo.

## Idempotência

Uma recuperação por sessão de checkout. Nunca duas.

## Testes

Checkout concluído dentro do prazo (não aborda); abandonado; abandonado duas vezes; conversão logo após a abordagem; opt-out.

## Rollback

Desativar. Nenhuma recuperação sai.
