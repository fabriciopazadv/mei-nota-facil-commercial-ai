# 05 — HubSpot

## 1. Conta auditada

| Item | Valor | Ação |
|---|---|---|
| Portal ID | 51640620 | — |
| Tipo | `STANDARD` (produção) | — |
| Assentos | apenas `core` | Indica plano gratuito/Starter |
| Fuso | `US/Eastern` | ❌ **corrigir para `America/Sao_Paulo`** |
| Moeda | `USD` | ❌ **corrigir para `BRL`** |

> **Corrigir fuso e moeda antes de criar qualquer contato ou negócio.** Negócio criado em
> USD não se converte sozinho depois, e todo relatório de data nasce deslocado.
> `Configurações → Padrões da conta → Moeda / Fuso horário`.

## 2. O que o plano atual permite

Verificado por acesso autenticado, não presumido:

| Objeto | Ler | Escrever |
|---|---|---|
| Contatos | ✅ | ✅ |
| Empresas | ✅ | ✅ |
| Negócios | ✅ | ✅ |
| Tarefas | ✅ | ✅ |
| Tickets | ✅ | ✅ |
| Notas, chamadas, e-mails, reuniões | ✅ | ✅ |
| Produtos, itens de linha | ✅ | ✅ |
| **Leads (objeto)** | ⚠️ exige upgrade | ❌ |
| **Campanhas** | ⚠️ exige upgrade | ⚠️ |
| **E-mail de marketing** | ⚠️ restrito | ⚠️ |
| Orçamentos, faturas, assinaturas, formulários | ✅ | ❌ |

## 3. O que o plano atual **não** permite

- **Workflows** (automação nativa) — exige Professional.
- **Sequências** — exige Sales Hub Starter/Pro.
- **Objeto Leads** e **Campanhas**.
- **Objetos personalizados** — exige Enterprise.
- **Lead scoring nativo avançado** — não usaremos de todo jeito.

### Consequência arquitetural

**Toda automação vive no n8n.** O HubSpot é sistema de registro, não motor. Isso é
deliberado e não requer upgrade. Ver `ADR-003`.

Vantagem: as regras ficam versionadas em `config/`, revisáveis por diff, testáveis — e não
presas à interface de um CRM.

## 4. Propriedades nativas a reaproveitar

**Não duplicar.** Confirmadas como existentes no portal:

| Propriedade | Uso |
|---|---|
| `email` | Chave natural de deduplicação |
| `phone` | Telefone em E.164 |
| `hs_whatsapp_phone_number` | **Nativa** — usar esta, não criar outra |
| `lifecyclestage` | Estágio macro (`lead` → `opportunity` → `customer`) |
| `hs_lead_status` | Sub-status (`NEW`, `OPEN`, `IN_PROGRESS`, `CONNECTED`, `UNQUALIFIED`, `BAD_TIMING`) |
| `hs_marketable_status` | Contato de marketing sim/não |
| `hubspotscore` | ❌ **não usar** — gerenciado pelo app nativo; nossos scores são próprios |

## 5. Propriedades a criar

Grupo: **MEI Nota Fácil — Comercial**. Prefixo `mnf_` para não colidir com nativas.

### Identificação
| Nome | Tipo | Observação |
|---|---|---|
| `mnf_saas_user_id` | string | `User.id`. Chave de junção |
| `mnf_saas_tenant_id` | string | `Tenant.id` |
| `mnf_perfil_usuario` | enum | `mei_novo` · `mei_estabelecido` · `pretende_abrir` · `contador` · `outro` |
| `mnf_atividade_profissional` | string | Texto livre |
| `mnf_cidade` / `mnf_estado` | string / enum | |

### Origem
| Nome | Tipo |
|---|---|
| `mnf_origem_lead` | enum: `organico` · `google_ads` · `meta_ads` · `indicacao` · `whatsapp` · `conteudo` · `parceria` · `outro` |
| `mnf_campanha` | string |
| `mnf_principal_interesse` | enum: `nfse` · `recibo` · `orcamento` · `financeiro` · `contrato` · `organizacao` · `indefinido` |
| `mnf_principal_objecao` | enum: `preco` · `complexidade` · `certificado_digital` · `desconfianca` · `sem_urgencia` · `usa_concorrente` · `nao_precisa` · `nenhuma` |

### Ciclo de vida
| Nome | Tipo | Observação |
|---|---|---|
| `mnf_estagio_ativacao` | enum | `cadastrado` · `sem_trial` · `trial_iniciado` · `explorando` · `ativado` · `engajado` |
| `mnf_trial_inicio` / `mnf_trial_fim` | date | |
| `mnf_trial_dia_atual` | number | 0–31, atualizado diariamente |
| `mnf_ultima_atividade_saas` | datetime | |
| `mnf_funcionalidades_utilizadas` | multi-check | `cliente` · `orcamento` · `recibo` · `nfse` · `contrato` · `financeiro` |
| `mnf_status_assinatura` | enum | `sem_trial` · `trial` · `ativa` · `inadimplente` · `cancelada` |
| `mnf_plano` | enum | `nenhum` · `mensal` · `semestral` |
| `mnf_motivo_cancelamento` | enum | `preco` · `nao_usou` · `faltou_recurso` · `problema_tecnico` · `fechou_mei` · `mudou_solucao` · `outro` |

> `mnf_estagio_ativacao = sem_trial` é o estado descrito em `04-eventos.md` §4 — a pessoa se
> cadastrou mas não vinculou pagamento, então os 31 dias nunca começaram. Vale um relatório
> próprio.

### Scores (três, separados e transparentes)
| Nome | Tipo | Faixa |
|---|---|---|
| `mnf_score_intencao` | number | 0–100 |
| `mnf_score_ativacao` | number | 0–100 |
| `mnf_score_risco` | number | 0–100 |
| `mnf_score_versao` | string | Versão de `lead-scoring.json` usada |

`mnf_score_versao` permite auditar por que um contato tinha determinado score em
determinada data. Sem isso, mudança de peso reescreve o passado.

### Consentimento (LGPD)
| Nome | Tipo |
|---|---|
| `mnf_consent_whatsapp` | bool |
| `mnf_consent_whatsapp_data` | datetime |
| `mnf_consent_whatsapp_origem` | string (onde e como foi coletado) |
| `mnf_consent_marketing` | bool |
| `mnf_consent_marketing_data` | datetime |
| `mnf_optout_data` | datetime |
| `mnf_optout_canal` | enum: `whatsapp` · `email` · `todos` |

Opt-out **nunca** é apagado — é a prova de que o pedido foi respeitado.

### Operacional
| Nome | Tipo |
|---|---|
| `mnf_ultimo_contato` | datetime |
| `mnf_ultimo_contato_canal` | enum |
| `mnf_proxima_acao` | string |
| `mnf_proxima_acao_data` | datetime |
| `mnf_contatos_7d` | number (controle de frequência) |
| `mnf_sequencia_ativa` | string |
| `mnf_atendimento_humano` | bool |

## 6. Pipeline comercial

Objeto **Deal**, pipeline `MEI Nota Fácil — Comercial`:

| # | Etapa | Probabilidade | Entrada |
|---|---|---|---|
| 1 | Lead capturado | 5% | `lead_created` |
| 2 | Contato iniciado | 10% | Primeira interação |
| 3 | Lead qualificado | 20% | SDR confirma perfil MEI |
| 4 | Cadastro iniciado | 30% | `registration_started` |
| 5 | **Teste ativado** | 40% | `trial_started` |
| 6 | Usuário ativado | 55% | 1º recibo/orçamento/NFS-e |
| 7 | Oportunidade de assinatura | 65% | Intenção detectada |
| 8 | Checkout iniciado | 80% | `checkout_started` |
| 9 | Pagamento pendente | 90% | `payment_pending` |
| 10 | **Cliente convertido** | 100% (ganho) | `payment_approved` |
| 11 | Perdido | 0% (perdido) | Política de perda |
| 12 | Reativação | 15% | Retomada de contato |

Valor do negócio em **BRL**: mensal R$ 14,99 · semestral R$ 69,99 (confirmados no `.env` do
SaaS).

## 7. Retenção sem segundo pipeline

O comando mestre admite usar propriedades e listas quando o plano não comporta dois
pipelines. **É o caso aqui.**

O ciclo de retenção vive em `mnf_status_assinatura` + `mnf_score_risco` + listas:

| Lista | Critério |
|---|---|
| Clientes ativos | `status = ativa` |
| Baixa utilização | `ativa` E `ultima_atividade > 7 dias` |
| Risco identificado | `score_risco >= 50` |
| Em contato de retenção | `sequencia_ativa = retencao` |
| Cancelamento solicitado | `status = cancelada` E `motivo` preenchido |
| Elegíveis a reativação | `cancelada` E cancelamento > 60 dias |
| **Cadastrados sem trial** | `estagio_ativacao = sem_trial` |
| Inadimplentes | `status = inadimplente` |

Reavaliar se o volume passar de ~500 clientes ativos.

## 8. Deduplicação

Ordem: `email` normalizado (minúsculo, sem espaço) → `mnf_saas_user_id` →
`phone` em E.164.

Sempre **upsert**, nunca `create` cego. Corrida entre eventos simultâneos é resolvida por
trava de idempotência no `event_id` antes da chamada (risco R-09).

## 9. Escopos do Private App

Mínimo necessário — não pedir mais:

```
crm.objects.contacts.read      crm.objects.contacts.write
crm.objects.companies.read     crm.objects.companies.write
crm.objects.deals.read         crm.objects.deals.write
crm.objects.owners.read
crm.schemas.contacts.read      crm.schemas.deals.read
tickets                        (leitura e escrita)
```

Token guardado **apenas** nas credenciais do n8n. Rotação a cada 6 meses.

## 10. Limites da API

10 requisições/segundo por portal no plano gratuito, com cota diária. Mitigação: agrupar
atualizações em lote (`/batch/upsert`), evitar sincronização por campo, escalonar cargas e
tratar `429` com recuo exponencial no COM-02.

## 11. Ordem de implantação

1. Corrigir fuso e moeda.
2. Criar o grupo de propriedades e as propriedades.
3. Criar o pipeline e as etapas.
4. Criar as listas.
5. Criar o Private App e guardar o token no n8n.
6. Testar upsert com contato **fictício** em staging.
7. Só então ligar o COM-02.

Passos 2 a 4 podem ser automatizados por `scripts/migrate-hubspot/` — que **não** roda
sozinho: exige `--confirm` e recusa produção sem aprovação.
