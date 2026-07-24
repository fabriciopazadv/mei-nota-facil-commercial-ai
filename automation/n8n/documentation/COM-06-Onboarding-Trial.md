# COM-06-Onboarding-Trial — Onboarding e Trial

| Campo | Valor |
|---|---|
| Fase | 3 |
| Status | Especificado — não implementado |
| Gatilho | `registration_completed`, `trial_started` + agenda |
| Responsável | Proprietário |

## Finalidade

Conduz os primeiros dias. **Contém o fluxo mais importante do projeto**: o caso `registration_completed` sem `trial_started`.

Essa pessoa se cadastrou e ficou travada — o teste de 31 dias só começa quando o pagamento é vinculado no checkout, e ela provavelmente não sabe disso. O fluxo explica o passo que falta, sem culpar e sem pressionar.

Para quem já iniciou o teste, a sequência se adapta: quem ativa cedo recebe menos mensagens; quem trava recebe ajuda com a função específica onde parou.

**Preferência por e-mail** — é gratuito. WhatsApp só quando houver motivo.

## Entrada

Evento de cadastro ou início de teste.

## Saída

Sequência de onboarding agendada, adaptada ao comportamento.

## Credenciais necessárias

HubSpot, provedor de e-mail.

## Variáveis

`EMAIL_PROVIDER`, `HUBSPOT_ACCESS_TOKEN`

## Tratamento de erro

Falha de envio → tenta o outro canal. Falha persistente → tarefa humana.

## Idempotência

Cada passo da sequência é enviado uma única vez por contato.

## Testes

Cadastro sem trial; trial iniciado; usuário que ativa cedo (sequência encurta); usuário inativo; conversão no meio da sequência (sequência para); opt-out.

## Rollback

Desativar o workflow. Sequências em andamento param no próximo passo.
