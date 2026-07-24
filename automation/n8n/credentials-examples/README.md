# credentials-examples

Estrutura das credenciais que o n8n precisa. **Somente nomes de campo — nunca valores.**

Os valores reais são digitados diretamente na interface de credenciais do n8n e nunca saem
de lá.

## HubSpot — Private App

| Campo | Origem do valor |
|---|---|
| Access Token | HubSpot → Configurações → Integrações → Aplicativos privados |

Escopos mínimos em `docs/commercial-ai/05-hubspot.md` §9. Não conceda mais do que isso.

## WhatsApp Cloud API

| Campo | Origem do valor |
|---|---|
| Access Token | Meta for Developers → seu app → WhatsApp → Configuração da API |
| Phone Number ID | Mesma tela |
| Business Account ID | Mesma tela |
| App Secret | Meta for Developers → Configurações do app → Básico |

O **App Secret** é usado para validar o `X-Hub-Signature-256` de cada requisição recebida.
Sem ele, qualquer um pode forjar uma mensagem.

## Provedor de IA

| Campo | Origem do valor |
|---|---|
| API Key | Painel do provedor escolhido (`AI_PROVIDER`) |

## Webhook do SaaS

| Campo | Origem do valor |
|---|---|
| Signing Secret | Gerado uma vez; o **mesmo** valor no SaaS e no n8n |

Gerar com no mínimo 32 bytes aleatórios. Na rotação, aceitar o segredo antigo e o novo por
24 horas — senão os eventos em trânsito são rejeitados.

## Regras

- Credencial separada por ambiente. **Nunca** a mesma em staging e produção.
- Rotação a cada 6 meses (ver `SECURITY.md` §5).
- Suspeita de vazamento: **revogar primeiro, investigar depois**.
- Nenhum valor real chega a este repositório, em nenhum arquivo, commit ou issue.
