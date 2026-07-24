# 01 — Auditoria Inicial (Fase 0)

| Campo | Valor |
|---|---|
| Data da auditoria | 24/07/2026 |
| Executor | Agente construtor (Claude), sob revisão humana |
| Escopo | Repositório `mei-facil`, portal HubSpot 51640620, documentação oficial da WhatsApp Cloud API |
| Status | Concluída |
| Alterações feitas no SaaS | **Nenhuma** — auditoria somente leitura |

---

## 1. Resumo executivo

O MEI Nota Fácil é um SaaS **maduro no produto e inexistente no comercial**. O aplicativo
tem multi-tenancy, autenticação própria, cobrança recorrente pelo Asaas, emissão de NFS-e,
recibos, orçamentos com aceite eletrônico, mini-CRM do MEI e três serviços de IA já em
produção — tudo com testes e trilha de auditoria.

Do lado comercial, não existe **nada**: nenhum evento sai do aplicativo, nenhum e-mail é
enviado, não há CRM conectado, não há canal de mensagem, não há métrica de funil. O
HubSpot está criado mas vazio e em plano **gratuito/Starter** — não no plano pago
pressuposto no comando mestre.

Três achados mudam o plano de construção:

1. **O trial de 31 dias só começa quando a pessoa vincula o pagamento no checkout.** Quem
   se cadastra e não passa pelo checkout fica com a assinatura travada e sem acesso às
   funções premium. Esse é o maior gargalo do funil e nenhum sistema hoje o observa.
2. **O HubSpot atual não tem Workflows nem o objeto Leads nem Campaigns.** A automação
   precisa viver inteiramente no n8n. O HubSpot fica como registro, não como motor.
3. **O aplicativo não emite nenhum evento e não coleta telefone do assinante de forma
   obrigatória.** Sem isso não há WhatsApp, não há acompanhamento de trial e não há
   recuperação de checkout. É a primeira coisa a construir.

Nenhuma contratação nova é necessária para as Fases 0 a 5. Os custos inevitáveis se
resumem a mensagens do WhatsApp iniciadas pelo negócio e ao consumo de IA — ambos com teto
configurável.

---

## 2. Arquitetura encontrada — SaaS `mei-facil`

### 2.1 Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | Next.js 16.2.10 (App Router), React 19.2.4 | Full-stack, PWA, mobile-first |
| Linguagem | TypeScript 5, strict | |
| UI | Tailwind CSS 4 | |
| ORM / Banco | Prisma 7.8 + PostgreSQL (`@prisma/adapter-pg`) | Multi-tenant por `tenantId` em toda query |
| Autenticação | JWT (`jose`) em cookie httpOnly + bcryptjs | Própria, sem provedor externo |
| Validação | Zod 4 | Em todas as rotas |
| Testes | Vitest 4 | `npm test` |
| Hospedagem | Vercel, CI via GitHub | Conforme README do projeto |
| PDF | `pdfjs-dist` + gerador próprio | Recibos e DANFSE |

### 2.2 Modelo de dados (24 modelos/enums em `prisma/schema.prisma`)

`Tenant`, `User`, `MeiProfile`, `Customer`, `ServiceCatalogItem`, `Quote`, `QuoteItem`,
`QuoteEvent`, `NfseDocument`, `Payment`, `ContractOrientationReport`, `Subscription`,
`SupportTicket`, `AuditLog`.

Pontos relevantes para o sistema comercial:

- **Valores sempre em centavos (`Int`).** A camada comercial deve seguir a mesma convenção.
- **`Subscription`** tem `plano` (TRIAL/MENSAL/SEMESTRAL), `status`
  (TRIAL/ATIVA/CANCELADA/INADIMPLENTE), `trialEndsAt` e os ids do Asaas. É a fonte da
  verdade do ciclo de vida comercial.
- **`AuditLog`** já existe com `acao`, `objeto`, `objetoId`, `resultado`, `ip` — pode ser
  reaproveitado como origem de alguns eventos, mas **não substitui** um emissor de eventos:
  não tem entrega garantida, nem assinatura, nem idempotência externa.
- **`QuoteEvent`** já registra o ciclo do orçamento (criado, enviado, visualizado, aprovado,
  recusado, alteração solicitada). É o único fluxo do produto que já tem eventos — mas
  internos, não publicados.
- **`Customer`** é o CRM *do MEI* (os clientes dele). **Não confundir** com o CRM
  *do negócio* (os assinantes). O HubSpot cuida do segundo; nunca do primeiro.
- **`MeiProfile.telefone` é opcional** (`String?`). Ver risco R-03.

### 2.3 Superfície de API (28 rotas)

| Grupo | Rotas | Relevância comercial |
|---|---|---|
| Auth | `register`, `login`, `logout` | **Alta** — origem de `account_created` |
| Billing | `checkout`, `webhook` | **Crítica** — trial, pagamento, inadimplência |
| Quotes | CRUD, `send`, `convert`, público `/o/[token]` | Alta — sinal forte de ativação |
| Fiscal | `nfse`, `receipts` | Alta — ativação e valor percebido |
| IA | `contract-review`, `contract-review/ask`, `fiscal-assistant`, `insights` | Alta — uso de função premium |
| Customers / Catalog / Payments / Documents / Dashboard | CRUD | Média — sinal de uso |
| Support | `support` | Alta — ticket vira atendimento |
| Admin | `admin/login`, `admin/users` | Área do desenvolvedor |

### 2.4 Pagamento — Asaas

`src/lib/payment/AsaasBillingProvider.ts` + `src/app/api/billing/webhook/route.ts`.

- Checkout hospedado do Asaas; assinatura recorrente com `billingType: UNDEFINED`.
- `TRIAL_DIAS = 31`; primeira cobrança vence ao fim do trial.
- Modo simulado quando `ASAAS_API_KEY` está vazia.
- Preços em `.env`: **R$ 14,99 mensal** e **R$ 69,99 semestral** (R$ 11,66/mês equivalente).
- Webhook trata `CHECKOUT_PAID`, `SUBSCRIPTION_CREATED`, `PAYMENT_CONFIRMED`,
  `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`, `SUBSCRIPTION_INACTIVATED`.
- **Valida o header `asaas-access-token` com `timingSafeEqual`** — comparação em tempo
  constante, correta. Bom padrão, replicar no sistema comercial.
- `iniciarTrial` é idempotente: não estende trial já em andamento.

> **Achado A-01 (crítico para o funil).** Em `src/app/api/auth/register/route.ts` a
> assinatura nasce com `trialEndsAt = new Date()` — isto é, **já vencido**. O comentário no
> código é explícito: *"O trial de 31 dias só começa quando a pessoa vincula o pagamento
> (checkout)."* Consequência comercial: existe um estado
> `cadastrado mas sem trial` invisível para todo mundo. É onde mais gente deve estar
> parando, e hoje ninguém sabe quantas. **Esse estado precisa de evento próprio e de um
> fluxo de recuperação dedicado** (ver `registration_completed` sem `trial_started`).

### 2.5 Inteligência artificial já existente

`src/lib/ai/` — **já implementa a abstração de provedor que o comando mestre pede**:

- `providerConfig.ts` lê `AI_PROVIDER` (`gemini` padrão, free tier; `anthropic` alternativo).
- `structuredCompletion.ts` roteia para `providers/geminiStructuredCompletion.ts` ou
  `providers/anthropicStructuredCompletion.ts`.
- Saída **sempre validada por schema Zod** (`AIResponseValidator` e validadores por serviço).
- `PromptRegistry.ts` versiona prompts; `ContractOrientationReport.promptVersion` grava a
  versão usada em cada execução.
- Fallback determinístico quando não há chave.
- Serviços: `ContractReaderService`, `ContractChatService`, `FinancialInsightsService`,
  `FiscalAssistantService`.

**Consequência:** o padrão de IA do sistema comercial deve **copiar** este, não inventar
outro. Prompt versionado + saída validada + fallback determinístico já é a cultura da casa.

### 2.6 Segurança observada

Positivo:

- Rotas envolvidas por `withApi` com tratamento de erro padronizado e sem stack trace cru.
- Erros de domínio tipados (`UnauthorizedError`, `AssinaturaInativaError`, `ForbiddenError`,
  `CertificadoAusenteError`, `DevAreaLockedError`).
- `registrarAuditoria` disponível e usado nas ações sensíveis.
- Isolamento multi-tenant por `tenantId` declarado como invariante.
- `timingSafeEqual` no webhook do Asaas.
- Segredos apenas em variáveis de ambiente; `.env.example` sem valores reais.

A observar:

- `console.log('[asaas-webhook]', evento, JSON.stringify(body).slice(0, 2000))` grava
  **payload bruto do Asaas nos logs da Vercel** — pode conter dado pessoal do pagador.
  Recomendação R-07.
- `DEV_AREA_PASSWORD` tem **padrão embutido `666999`** quando a variável está vazia.
  Recomendação R-08.

---

## 3. O que **não** existe no SaaS

Verificado por varredura no repositório — ausências confirmadas, não presumidas:

| Ausente | Verificação | Impacto comercial |
|---|---|---|
| **Sistema de e-mail** | Nenhuma dependência de `nodemailer`, `resend`, `sendgrid`, SMTP ou `sendEmail` | Sem canal gratuito de onboarding e recuperação. Bloqueia Fases 3–5 se não resolvido |
| **Eventos de saída / webhooks para terceiros** | Só existe webhook **de entrada** (Asaas) | Sem isso o sistema comercial é cego |
| **Telefone obrigatório do assinante** | `MeiProfile.telefone String?`, não pedido no cadastro | Sem WhatsApp não há canal principal |
| **Consentimento / opt-in / opt-out** | Nenhum campo no schema | Bloqueio de LGPD e da política da Meta |
| **Origem do lead (UTM, campanha, referrer)** | Nenhum campo | Impossível calcular CAC ou avaliar campanha |
| **Integração com HubSpot** | Nenhuma referência | — |
| **Integração com WhatsApp** | Nenhuma referência | — |
| **Métrica de funil / analytics** | Nenhuma | Sem observabilidade comercial |
| **NPS, indicação, motivo de cancelamento** | Nenhum campo | Fases 5–6 |

---

## 4. Auditoria do HubSpot — portal 51640620

Levantado por acesso autenticado ao portal em 24/07/2026.

### 4.1 Conta

| Item | Valor |
|---|---|
| Portal ID | 51640620 |
| Tipo de conta | `STANDARD` (produção, não sandbox) |
| Assentos | **apenas `core`** |
| Usuário | Fabricio Paz — criado em 21/06/2026 |
| Fuso horário | **`US/Eastern`** ❌ |
| Moeda | **`USD`** ❌ |

### 4.2 Disponibilidade real de objetos

| Objeto | Leitura | Escrita | Leitura do resultado |
|---|---|---|---|
| CONTACT | ✅ | ✅ | Base do CRM — disponível |
| COMPANY | ✅ | ✅ | Disponível |
| DEAL | ✅ | ✅ | Pipeline comercial — disponível |
| TASK | ✅ | ✅ | Tarefas humanas — disponível |
| TICKET | ✅ | ✅ | Atendimento — disponível |
| NOTE / CALL / EMAIL / MEETING_EVENT | ✅ | ✅ | Registro de atividade — disponível |
| **LEAD** | ⚠️ `REQUIRES_ACCOUNT_MODIFICATION` | ❌ | **Exige upgrade** |
| **CAMPAIGN** | ⚠️ `REQUIRES_ACCOUNT_MODIFICATION` | ⚠️ | **Exige upgrade** |
| **MARKETING_EMAIL** | ⚠️ `REQUIRES_REAUTHORIZATION` | ⚠️ | Escopo/plano |
| QUOTE / INVOICE / SUBSCRIPTION / FORM | ✅ | ❌ | Somente leitura |

### 4.3 Conclusão sobre o plano

O conjunto **assento `core` isolado + objeto Leads indisponível + Campaigns indisponível +
Marketing Email restrito** é a assinatura de uma conta **gratuita ou Starter**, não de um
plano Professional.

> **Achado A-02 (estrutural).** O comando mestre parte de "HubSpot pago". O portal auditado
> **não tem os recursos que normalmente se assume num plano pago** — em especial
> **Workflows**, que exigem Professional. Toda a automação precisa viver no n8n. O HubSpot
> entra como **sistema de registro** (contatos, negócios, atividades, tarefas), não como
> motor de automação.

**Isso não é um problema — é uma economia.** A arquitetura proposta já colocava o n8n como
orquestrador. A auditoria apenas confirma que não há redundância a eliminar nem upgrade a
contratar.

> **Achado A-03 (corrigir antes de qualquer sincronização).** Fuso `US/Eastern` e moeda
> `USD` em uma operação 100% brasileira que fatura em reais. Se contatos entrarem antes da
> correção, todo relatório de data e todo valor de negócio nascerão errados — e negócio
> já criado **não** se recalcula sozinho na troca de moeda.

### 4.4 Propriedades padrão aproveitáveis (não duplicar)

Confirmadas como existentes no portal:

| Propriedade | Tipo | Uso no sistema comercial |
|---|---|---|
| `lifecyclestage` | enum | Estágio macro. Mapear: `lead` → `opportunity` → `customer` |
| `hs_lead_status` | enum | Sub-status de prospecção (`NEW`, `OPEN`, `IN_PROGRESS`, `CONNECTED`, `UNQUALIFIED`, `BAD_TIMING`…) |
| `hubspotscore` | number | **Não usar.** É gerenciado pelo app de Lead Scoring; nossos três scores serão propriedades próprias e transparentes |
| `phone` | string | Telefone principal — gravar em E.164 |
| `hs_whatsapp_phone_number` | string | Já existe nativamente. **Usar esta**, não criar propriedade de WhatsApp |
| `hs_marketable_status` | enum | Contato de marketing sim/não — respeitar o limite do plano |

---

## 5. Auditoria do n8n

> **Bloqueio B-01.** Não houve acesso à instância do n8n nesta sessão (sem `N8N_BASE_URL`
> nem `N8N_API_KEY`). Os itens abaixo **não** foram verificados e estão registrados como
> pendência, não como conclusão.

A confirmar pelo proprietário — instruções em `docs/commercial-ai/06-n8n.md` §9:

| Item | Por que importa |
|---|---|
| Versão e tipo de hospedagem (Cloud ou self-hosted) | Define limites de execução e se há fila |
| Limite de execuções do plano | Dimensiona a granularidade dos workflows |
| Política de retenção de execuções | **LGPD** — execuções guardam telefone e conteúdo de mensagem |
| Credenciais já configuradas | Evita recriar integração existente |
| Workflows existentes | Evita duplicação |
| Nós de IA disponíveis | Define se o roteamento de modelo fica no n8n ou fora |
| Suporte a `Wait` / aprovação humana | Necessário para COM-16 |
| Error Workflow global configurado | Necessário para COM-17 |
| Política de backup | Necessário antes de qualquer importação |

Isso **não bloqueia** o restante do projeto: a especificação dos 20 workflows está pronta e
independe da versão. Ver `automation/n8n/documentation/`.

---

## 6. WhatsApp — pesquisa da documentação oficial (24/07/2026)

Fontes: documentação da Meta for Developers. Rate card específico do Brasil **não foi
obtido** (a página de preços retornou 403 ao acesso automatizado) — a tabela em
`config/costs/whatsapp-costs.json` nasce com valores **nulos e status `nao_confirmado`**,
para ser preenchida com o rate card real do painel antes de qualquer envio pago.

### 6.1 Modelo de cobrança vigente

- Cobrança **por mensagem** (o modelo antigo por conversa de 24h está **descontinuado**).
- A tarifa varia por **categoria do template**, **país** e **faixa de volume**.
- Quatro categorias: **marketing**, **utility**, **authentication**, **service**.
- **Mensagens de serviço não são cobradas.**
- **Desde 01/07/2025, templates de `utility` enviados dentro da janela de atendimento são
  gratuitos.**
- Atualizações de tarifa entraram em vigor em **01/07/2026** para vários países (Brasil não
  aparece na lista de alterações dessa rodada).

### 6.2 Janela de atendimento

- Toda vez que o usuário envia mensagem (ou liga), abre-se — ou renova-se — uma janela de
  **24 horas**.
- Com a janela **aberta**: pode-se enviar **qualquer tipo** de mensagem.
- Com a janela **fechada**: **somente template aprovado**.

### 6.3 Consentimento e limites

- Só é permitido enviar para quem deu **opt-in**.
- **Limite inicial de 250 destinatários únicos** por 24 horas fora da janela de atendimento,
  para número novo. Sobe para 1.000 e além pelos caminhos de escalonamento da Meta.
- **Qualidade** medida pelos últimos 7 dias, ponderada por recência, a partir de bloqueios,
  denúncias, silenciamentos e arquivamentos. Qualidade baixa derruba o limite de envio.
- Número banido só volta pelo processo formal de recurso.

### 6.4 Consequências diretas para a arquitetura

1. **O dinheiro está em fazer o usuário escrever primeiro.** Toda comunicação que puder
   esperar deve esperar a janela abrir. Isso é regra de arquitetura, não de estilo.
2. **Nunca usar template de `marketing` para comunicação operacional.** Aviso de fim de
   trial, cobrança falha e onboarding são `utility` — e saem de graça dentro da janela.
3. **250 destinatários/24h é pouco.** Qualquer noção de disparo em massa está descartada
   desde o primeiro dia, tecnicamente e não só por política.
4. **Qualidade é ativo operacional.** Frequência de contato, opt-out honrado e parada de
   sequência após resposta protegem o número de ser derrubado.

⚠️ **Não usar** bibliotecas não oficiais, sessão por QR Code ou automação de navegador em
produção. Violam os termos e derrubam o número. Ver `ADR-004`.

---

## 7. Riscos identificados

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-01 | Trial não inicia sem checkout; usuários cadastrados ficam invisíveis e travados | **Alta** | **Alto** | Evento `registration_completed` sem `trial_started` dispara fluxo dedicado de recuperação (COM-06) |
| R-02 | HubSpot sem Workflows/Leads/Campaigns; arquitetura presume plano pago | **Confirmado** | Médio | Automação inteiramente no n8n; HubSpot como registro |
| R-03 | Telefone do assinante é opcional e não é pedido no cadastro | **Alta** | **Alto** | Coletar com finalidade declarada + opt-in explícito antes da Fase 2 |
| R-04 | Número de WhatsApp derrubado por qualidade baixa | Média | **Alto** | Limite de frequência, opt-out imediato, parada de sequência, priorizar janela aberta |
| R-05 | Portal HubSpot em `USD`/`US/Eastern` | **Confirmado** | Médio | Corrigir **antes** de criar qualquer contato ou negócio |
| R-06 | Custo de IA sem teto | Média | Médio | `AI_MAX_COST_DAILY`/`MONTHLY` + fallback determinístico + cache |
| R-07 | Payload bruto do Asaas em log da Vercel pode conter dado pessoal | Média | Médio | Reduzir para campos necessários e mascarar (issue no repo do SaaS) |
| R-08 | `DEV_AREA_PASSWORD` com padrão embutido `666999` | Média | **Alto** | Exigir variável definida; sem padrão em produção (issue no repo do SaaS) |
| R-09 | Contato duplicado no HubSpot por corrida entre eventos | Média | Médio | Upsert por e-mail normalizado + trava de idempotência por `event_id` |
| R-10 | Prompt injection via mensagem de WhatsApp | Média | **Alto** | Conteúdo do usuário sempre como dado; allowlist de ferramentas; política fora do prompt |
| R-11 | Retenção de execuções no n8n guardando conversa indefinidamente | **A confirmar** | Médio | Definir retenção curta; documentar em `lgpd-retencao.md` |
| R-12 | Repositório comercial estava **público** no início da auditoria | **Confirmado** | **Alto** | Proprietário notificado; alteração para privado em curso |

---

## 8. Custos identificados

### 8.1 Já pagos (aproveitar — Nível 1)

n8n, HubSpot (plano atual), Vercel, PostgreSQL, domínio, Asaas (por transação).

### 8.2 Inevitáveis se o sistema operar

| Item | Natureza | Controle |
|---|---|---|
| Mensagens de WhatsApp iniciadas pelo negócio | Por mensagem, por categoria e país | Priorizar janela aberta; `utility` na janela é gratuito; teto por campanha |
| Consumo de IA | Por token | Teto diário/mensal, cache, modelo econômico por padrão, fallback determinístico |

### 8.3 Custo zero nesta fase

Meta Cloud API não cobra pela plataforma (só pela mensagem). Gemini tem free tier já em uso
no SaaS. Nenhum serviço novo foi contratado.

### 8.4 Contratações **não** recomendadas agora

ManyChat, WATI, Zenvia, Take Blip, Twilio, Gupshup, respond.io, ChatGuru — todos
intermediários evitáveis pela Cloud API direta. Banco vetorial dedicado — desnecessário
enquanto a base de conhecimento couber em busca por arquivo e palavra-chave. Upgrade do
HubSpot — desnecessário enquanto o n8n fizer a automação. Ferramenta de BI — o n8n gera os
relatórios.

---

## 9. Duplicidades a evitar

| Risco de duplicação | Decisão |
|---|---|
| `Customer` (SaaS) × Contact (HubSpot) | São coisas diferentes. `Customer` = cliente **do MEI**; Contact = **assinante**. Nunca sincronizar `Customer` para o HubSpot — seria vazar a base de clientes dos usuários |
| `hubspotscore` × nossos scores | Não usar o nativo; três propriedades próprias e auditáveis |
| `AuditLog` × trilha comercial | O `AuditLog` continua no SaaS; a trilha comercial é separada |
| Prompt no SaaS × prompt comercial | `PromptRegistry` do SaaS é para funções do produto; os prompts comerciais vivem aqui |
| Retenção como pipeline × como propriedade | Plano atual: **propriedades e listas** no pipeline único |

---

## 10. Recomendações

**Antes de qualquer código**

1. Tornar o repositório comercial privado (R-12). *(em curso pelo proprietário)*
2. Corrigir fuso e moeda do HubSpot para `America/Sao_Paulo` e `BRL` (R-05).
3. Confirmar plano, versão e retenção do n8n (B-01).

**Fase 1 — Fundação**

4. Criar o emissor de eventos no SaaS: fila com retentativa, assinatura HMAC, `event_id`.
5. Adicionar ao schema do SaaS: telefone do assinante em E.164, consentimento de WhatsApp e
   de marketing com data e origem, e campos de origem do lead (UTM).
6. Criar as propriedades do HubSpot e o pipeline comercial.
7. Instrumentar primeiro os eventos de maior valor: `registration_completed`,
   `trial_started`, `checkout_started`, `checkout_abandoned`, `payment_failed`,
   `first_receipt_created`, `nfse_completed`.

**Fase 2 em diante**

8. Resolver o canal de e-mail antes de depender de WhatsApp para tudo (ver `08-email.md`).
9. Instrumentar o estado `cadastrado sem trial` como métrica de primeira classe (A-01).

**Melhorias no repositório do SaaS (issues separadas, fora do escopo deste repositório)**

10. Reduzir e mascarar o log do webhook do Asaas (R-07).
11. Remover o padrão embutido de `DEV_AREA_PASSWORD` (R-08).

---

## 11. Dependências e bloqueios

| ID | Bloqueio | Necessário | Bloqueia |
|---|---|---|---|
| B-01 | Sem acesso ao n8n | `N8N_BASE_URL` + `N8N_API_KEY` (leitura) | Export/import de workflows |
| B-02 | Sem número na WhatsApp Cloud API | Número comercial + WABA + Business verificado | Fase 2 |
| B-03 | Sem Private App do HubSpot | Token com os escopos de `05-hubspot.md` | Fase 1 (sincronização) |
| B-04 | Fuso/moeda do HubSpot errados | Ajuste no painel | Fase 1 |
| B-05 | Canal de e-mail indefinido | Decisão do proprietário | Fases 3–5 |
| B-06 | Rate card do WhatsApp para o Brasil | Cópia do painel da Meta | Estimativa de custo real |
| B-07 | Responsável jurídico pela LGPD | Definição do proprietário | Publicação dos documentos de LGPD |

Nenhum desses bloqueios impede o trabalho já entregue nesta fase.

---

## 12. Perguntas que realmente precisam de resposta humana

Restritas ao que não se descobre por inspeção:

1. **n8n** — Cloud ou self-hosted? Qual plano e qual limite de execuções? (B-01)
2. **HubSpot** — confirma que o plano é gratuito/Starter, sem intenção de upgrade agora?
3. **WhatsApp** — o número comercial já existe? Está no app WhatsApp Business (o que exige
   migração para a Cloud API) ou é número novo?
4. **E-mail** — existe algum domínio/SMTP já contratado que possamos usar? (B-05)
5. **Descontos** — que desconto máximo a IA pode oferecer sem aprovação? A política nasce
   em **R$ 0,00** até você definir.
6. **Extensão de trial** — quantos dias a IA pode conceder sozinha? Nasce em **0 dias**.
7. **Jurídico** — quem valida os documentos de LGPD? (B-07)

---

## 13. Conclusão

O produto está pronto para vender; a operação de vendas é que não existe. A fundação a
construir não é "colocar IA" — é **fazer o aplicativo falar**: emitir eventos confiáveis,
coletar telefone com consentimento e registrar origem do lead. Sem esses três, nenhum
agente tem o que decidir.

A arquitetura proposta (`02-arquitetura.md`) não pressupõe nenhuma contratação nova e usa o
n8n como único motor, o HubSpot como registro e a IA apenas onde regra determinística não
resolve.
