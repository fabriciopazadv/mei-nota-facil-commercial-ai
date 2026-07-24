# 11 — Custos

## 1. Princípio

Ordem de preferência obrigatória, do comando mestre:

```
1. Recurso já pago        → n8n, HubSpot, Vercel, PostgreSQL, domínio
2. API oficial sem mensalidade → WhatsApp Cloud API (paga-se só a mensagem)
3. Plano gratuito oficial → free tier de IA
4. Open source            → quando estável e sem aumentar custo de infra
5. Serviço pago           → último recurso, com aprovação humana
```

**Nada é contratado sem autorização expressa do proprietário.**

## 2. Situação atual

| Item | Status | Custo adicional |
|---|---|---|
| n8n | Já pago | R$ 0 |
| HubSpot | Já pago (plano gratuito/Starter) | R$ 0 |
| Vercel + PostgreSQL | Já pagos | R$ 0 |
| WhatsApp Cloud API | Plataforma gratuita | R$ 0 (paga-se a mensagem) |
| IA | Free tier do Gemini já em uso no SaaS | R$ 0 até o limite |
| **Total de contratações novas** | — | **R$ 0** |

## 3. Custos inevitáveis quando operar

### 3.1 Mensagens de WhatsApp

Cobrança **por mensagem**, por categoria e país.

| Situação | Custo |
|---|---|
| Mensagem de serviço | **Zero** |
| Template `utility` **dentro** da janela de 24h | **Zero** (desde 01/07/2025) |
| Resposta em texto livre dentro da janela | **Zero** |
| Template `utility` fora da janela | Pago |
| Template `marketing` fora da janela | Pago (mais caro) |

> ⚠️ O rate card do Brasil **não foi confirmado** (a página da Meta recusou acesso
> automatizado). `config/costs/whatsapp-costs.json` está com valores `null` e
> `status: "nao_confirmado"`. **Preencher com os números do painel antes de qualquer envio
> pago.** Nenhum valor aparece embutido em código.

**Como reduzir:**

1. Fazer o usuário escrever primeiro — cada conversa iniciada por ele é 24h gratuitas.
2. Usar `utility`, nunca `marketing`, para comunicação operacional.
3. Uma mensagem que resolve em vez de três que informam.
4. E-mail como padrão; WhatsApp como exceção justificada.
5. Parar a sequência assim que houver resposta, conversão, cancelamento ou opt-out.
6. Agrupar notificações.
7. Limitar tentativas.

### 3.2 Inteligência artificial

| Uso | Modelo | Custo relativo |
|---|---|---|
| Estado conhecido → template | **Nenhum** | **Zero** |
| Cálculo de score | **Nenhum** | **Zero** |
| Decisão por regra | **Nenhum** | **Zero** |
| Classificar intenção, extrair, resumir | Econômico | Baixo |
| Objeção complexa, análise estratégica | Avançado | Alto |

**A maior economia é não chamar IA.** A maioria dos eventos tem resposta determinística.

**Controles:**

- Teto diário e mensal (`AI_MAX_COST_DAILY` / `AI_MAX_COST_MONTHLY`).
- Cache de respostas para perguntas repetidas.
- Contexto resumido em vez de histórico integral.
- Limite de tokens por chamada.
- Deduplicação de perguntas idênticas.
- Processamento em lote nos relatórios.
- Alerta em 50%, 80% e 100% do teto.
- **Ao atingir o teto:** cai para template determinístico; o que não tem template vira tarefa
  humana. O sistema nunca fica mudo nem improvisa.

## 4. Tabela de custos versionada

Nenhum valor monetário fica espalhado pelo código. Tudo em:

| Arquivo | Conteúdo |
|---|---|
| `config/costs/whatsapp-costs.json` | Tarifas por categoria, com data e fonte |
| `config/costs/ai-cost-limits.json` | Tetos, alertas e custo por modelo |
| `config/limits/message-limits.json` | Limites de volume |

Cada arquivo traz `atualizado_em`, `fonte` e `status` (`confirmado` / `nao_confirmado`).
Valor não confirmado **não** é usado para decidir gasto — apenas para estimar, com aviso.

## 5. Custo por lead e CAC

Fórmulas, calculadas por COM-14/COM-15:

```
custo_mensagens   = Σ (mensagens pagas × tarifa da categoria)
custo_ia          = Σ (tokens × preço do modelo)
custo_operacional = custo_mensagens + custo_ia
custo_por_lead    = custo_operacional / leads do período
CAC               = (custo_operacional + mídia paga) / clientes convertidos
```

### Referência de viabilidade

Plano mensal: **R$ 14,99**. Semestral: **R$ 69,99** (R$ 11,66/mês).

Com ticket desse tamanho, o CAC precisa ser **muito** baixo. Um punhado de mensagens de
marketing pagas por lead já compromete meses de receita.

**Consequência direta:** a operação precisa ser predominantemente **inbound** e
predominantemente **gratuita** — conversa iniciada pelo usuário, e-mail, conteúdo, indicação.
Não é preferência estética: é o que o preço do produto comporta.

Alerta automático quando o CAC ultrapassar o valor definido em
`config/costs/ai-cost-limits.json → alerta_cac_reais`.

## 6. Monitoramento (COM-20)

Diário: custo de mensagens, custo de IA, custo por lead, execuções do n8n, uso do free tier.

Alertas: teto de IA em 50%/80%/100%; custo diário acima da média histórica; volume de
mensagens acima do teto; execuções do n8n perto do limite do plano; CAC acima do alerta.

## 7. Contratações não recomendadas agora

| Item | Por quê |
|---|---|
| BSP de WhatsApp (ManyChat, WATI, Twilio, Zenvia, Take Blip, Gupshup, respond.io, ChatGuru) | Mensalidade sobre uma API já acessível direto |
| Upgrade do HubSpot | O n8n faz a automação |
| Banco vetorial dedicado | Busca por arquivo e palavra-chave basta neste volume |
| Ferramenta de BI | O n8n gera os relatórios |
| Plataforma de e-mail paga | Avaliar só quando o volume justificar (`08-email.md`) |
| Ferramenta de observabilidade paga | n8n + HubSpot + banco atendem |

## 8. Quando reavaliar

| Gatilho | Reavaliar |
|---|---|
| > 1.000 conversas/mês | Se o free tier de IA ainda comporta |
| > 500 clientes ativos | Segundo pipeline no HubSpot |
| > 2.000 e-mails/mês | Provedor de e-mail dedicado |
| Base de conhecimento > 100 documentos | Busca semântica (via extensão vetorial do banco já existente) |
| CAC acima do alerta por 2 meses | Estratégia de aquisição |

## 9. Regra final

Antes de propor qualquer contratação, responder em `27-formato-de-decisao` (ver comando
mestre §27): necessidade, três alternativas, custo inicial, custo recorrente, limite
gratuito, vantagens, desvantagens, riscos, dependência, conformidade e recomendação.

**Nenhuma contratação, ativação de plano pago ou geração de cobrança sem autorização humana
expressa.**
