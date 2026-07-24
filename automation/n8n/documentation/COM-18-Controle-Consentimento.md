# COM-18-Controle-Consentimento — Controle de Consentimento

| Campo | Valor |
|---|---|
| Fase | 1 |
| Status | Especificado — não implementado |
| Gatilho | Sub-workflow, chamado antes de todo envio |
| Responsável | Proprietário |

## Finalidade

Guarda única, chamada por **todos** os workflows que enviam mensagem. Guarda duplicada é guarda que vai divergir.

Ordem fixa: kill switch → consentimento → opt-out → frequência → horário → duplicidade → teto de custo → aprovação.

Regra do comportamento em falha: se não consegue confirmar que pode enviar, **não envia**. O custo de não mandar uma mensagem é muito menor que o de mandar para quem pediu para parar.

Opt-out não bloqueia transacional nem suporte: confirmação de pagamento e resposta a ticket decorrem de ação da própria pessoa.

## Entrada

Contato, canal, categoria da mensagem.

## Saída

Permissão ou bloqueio, com o motivo.

## Credenciais necessárias

HubSpot.

## Variáveis

`HUBSPOT_ACCESS_TOKEN`, `COMMERCIAL_AI_KILL_SWITCH`

## Tratamento de erro

Falha ao consultar o consentimento → **bloqueia o envio**. Na dúvida, não manda.

## Idempotência

Consulta é somente leitura, naturalmente idempotente.

## Testes

Com e sem consentimento; opt-out total e por canal; acima da frequência; fora do horário; kill switch; transacional com opt-out (deve passar); marketing sem consentimento (deve bloquear).

## Rollback

Não aplicável — é uma guarda, não uma ação.
