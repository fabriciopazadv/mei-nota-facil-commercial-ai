# COM-08-Conversao-Trial — Conversão de Trial

| Campo | Valor |
|---|---|
| Fase | 4 |
| Status | Especificado — não implementado |
| Gatilho | Agenda diária + `trial_day_*` |
| Responsável | Proprietário |

## Finalidade

Acompanha os 31 dias e aborda no momento certo.

Quem ativou e usa recebe abordagem direta. Quem não ativou recebe ajuda com o produto — não venda. Insistir com quem não viu valor não converte e ainda desgasta o canal.

**Sem condição comercial autorizada, não há o que oferecer além do preço vigente.** Nesse caso, registra a objeção e cria tarefa humana.

## Entrada

Contatos em teste, com scores e dias restantes.

## Saída

Contato de conversão pelo canal adequado, ou nada.

## Credenciais necessárias

HubSpot, WhatsApp, e-mail.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `EMAIL_PROVIDER`

## Tratamento de erro

Falha de canal → tenta o alternativo. Sem sucesso → tarefa humana.

## Idempotência

Um contato de conversão por marco de trial, por pessoa.

## Testes

Trial com alta e baixa ativação; conversão no meio da sequência; opt-out; trial expirado; contato sem consentimento de WhatsApp.

## Rollback

Desativar. Nenhuma nova abordagem sai.
