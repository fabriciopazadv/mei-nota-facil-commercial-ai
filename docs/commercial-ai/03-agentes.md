# 03 — Agentes

Cinco agentes lógicos. Cada um é um prompt versionado em `prompts/system/` + um conjunto de
ferramentas declaradas + um limite de autonomia em `config/autonomy/`.

**Nenhum agente executa ação por conta própria.** O agente propõe; o n8n valida contra a
matriz de autonomia; a ação executa, é suprimida ou vai para aprovação humana.

---

## 1. Agente Diretor Comercial

**Arquivo:** `prompts/system/commercial-director.md` · **Risco:** alto

Recebe o evento normalizado, avalia o estágio, escolhe o especialista e determina a próxima
melhor ação. É o único que enxerga o contato inteiro.

| Faz | Não faz |
|---|---|
| Avalia estágio e scores | Não redige mensagem ao cliente |
| Seleciona o agente especialista | Não executa ação sensível |
| Determina a próxima ação | Não altera política nem peso de score |
| Impede mensagem duplicada | Não concede desconto |
| Aplica limites de autonomia | Não fala com o cliente |
| Solicita aprovação humana | |
| Consolida relatórios e detecta anomalia | |

**Ferramentas:** `buscar_contato_hubspot`, `ler_historico_recente`, `calcular_scores`,
`selecionar_agente`, `agendar_acao`, `suprimir_acao`, `solicitar_aprovacao_humana`,
`registrar_decisao`.

**Regra de ouro:** delega ações delimitadas. Se precisa fazer tudo sozinho, a delegação
está mal desenhada.

---

## 2. Agente de Aquisição e Marketing

**Arquivo:** `prompts/system/marketing.md` · **Risco:** médio (alto ao tocar em verba)

| Faz | Não faz |
|---|---|
| Identifica segmentos e analisa origem dos leads | **Não publica campanha paga** |
| Sugere conteúdo e produz calendário | Não aumenta orçamento |
| Cria textos de campanha (rascunho) | Não dispara envio em massa |
| Propõe testes A/B | Não altera preço |
| Avalia desempenho e estima CAC | Não contrata mídia |
| Sugere melhorias de página | |
| Prepara campanhas de reativação | |

> **Toda campanha paga exige aprovação humana**, sem exceção nesta fase. O agente entrega
> a peça pronta e um pedido de aprovação; a publicação é ato humano.

**Ferramentas:** `analisar_origem_leads`, `calcular_cac`, `gerar_rascunho_campanha`,
`propor_teste_ab`, `solicitar_aprovacao_humana`.

---

## 3. Agente SDR e Atendimento

**Arquivo:** `prompts/system/sdr.md` · **Risco:** alto (fala diretamente com o público)

| Faz | Não faz |
|---|---|
| Responde contatos e identifica perfil | **Nunca promete função que não existe** |
| Qualifica o lead e descobre a necessidade | Não dá orientação fiscal ou jurídica individual |
| Explica funcionalidades **existentes** | Não inventa prazo, preço ou condição |
| Apresenta o teste gratuito de 31 dias | Não insiste após pedido de encerramento |
| Envia o link oficial de cadastro | Não finge ser pessoa |
| Registra tudo no HubSpot | Não trata assunto sensível |
| Classifica urgência e identifica objeções | |
| Encaminha o que é complexo | |

**Fonte única de verdade sobre o produto:** `knowledge/`. Se a resposta não está lá, o
agente diz que vai confirmar e cria tarefa humana. **Não deduz.**

**Ferramentas:** `consultar_base_conhecimento`, `upsert_contato_hubspot`,
`criar_atualizar_negocio`, `registrar_atividade`, `enviar_mensagem_aprovada`,
`criar_tarefa_humana`, `encaminhar_humano`.

---

## 4. Agente de Conversão

**Arquivo:** `prompts/system/conversion.md` · **Risco:** alto (toca em dinheiro)

| Faz | Não faz |
|---|---|
| Acompanha usuários em teste | **Não cria condição comercial nova** |
| Identifica ativação e intenção de compra | Não concede desconto fora da política |
| Apresenta o plano e envia o link **oficial** de pagamento | Não estende trial além do limite |
| Recupera checkout abandonado | Não pressiona com urgência falsa |
| Esclarece objeções | Não usa escassez artificial |
| Oferece **apenas** condições autorizadas | Não processa pagamento |
| Registra resultado e cria tarefa humana | |

**Condições autorizadas** vêm exclusivamente de `config/commercial-rules/discount-policy.json`
e `trial-extension-policy.json`. Ambos nascem com valor **zero** até o proprietário definir.
Fora deles: aprovação humana.

**Ferramentas:** `consultar_status_assinatura`, `gerar_link_pagamento_oficial`,
`consultar_politica_desconto`, `aplicar_condicao_autorizada`, `registrar_objecao`,
`criar_tarefa_humana`, `solicitar_aprovacao_humana`.

---

## 5. Agente de Sucesso e Retenção

**Arquivo:** `prompts/system/retention.md` · **Risco:** alto (contato com cliente insatisfeito)

| Faz | Não faz |
|---|---|
| Conduz onboarding e estimula ativação | **Não dificulta cancelamento** |
| Detecta inatividade e ensina recursos relevantes | Não concede reembolso |
| Age preventivamente contra cancelamento | Não discute reclamação grave |
| Identifica falha de pagamento e acompanha renovação | Não responde ameaça judicial |
| Solicita avaliação e sugere upgrade | Não retém à força |
| Reativa clientes antigos | |
| Encaminha reclamação grave | |

> Cancelamento pedido é cancelamento respeitado. O agente pode oferecer **uma** alternativa
> autorizada e registrar o motivo. Se a pessoa reafirma, encerra e encaminha. Retenção
> abusiva destrói reputação e derruba o número do WhatsApp.

**Ferramentas:** `consultar_uso_recente`, `calcular_risco_cancelamento`,
`enviar_conteudo_educativo`, `registrar_motivo_cancelamento`, `criar_tarefa_humana`,
`encaminhar_humano`.

---

## 6. Encaminhamento humano obrigatório

Vale para **todos** os agentes. Ao detectar qualquer item abaixo, o agente para, não
responde ao mérito, informa que uma pessoa vai assumir e cria tarefa de prioridade alta:

- ameaça judicial ou menção a advogado, Procon, processo
- reclamação grave ou risco reputacional
- pedido de reembolso excepcional
- suspeita de vazamento de dados
- acusação de fraude
- erro fiscal relevante
- pedido de interpretação jurídica ou fiscal individual
- conflito contratual
- pessoa emocionalmente alterada
- falha reiterada do produto
- pedido explícito de atendente humano
- **baixa confiança da própria IA**
- **ausência de informação confirmada na base de conhecimento**

Os dois últimos são os mais importantes: **não saber é motivo suficiente para encaminhar.**

---

## 7. Política de resposta

Todos os agentes: português brasileiro, claro, objetivo, tom humano sem fingir ser pessoa,
informando tratar-se de atendimento automatizado quando pertinente. Sem inventar, sem
prometer, sem informação fiscal ou jurídica individual, apenas links oficiais, sem pressão,
sem urgência falsa, sem escassez artificial, respeitando pedido de encerramento.

Detalhamento em `prompts/policies/response-policy.md`.

---

## 8. Roteamento de modelo

| Agente | Tarefa típica | Modelo |
|---|---|---|
| Diretor | Decisão sobre estado conhecido | **Nenhum** (regra) |
| Diretor | Desempate ambíguo | Econômico |
| SDR | Classificar intenção | Econômico |
| SDR | Responder dúvida coberta pela base | Template ou econômico |
| SDR | Objeção complexa | Avançado |
| Conversão | Escolher template por estado | **Nenhum** |
| Conversão | Objeção de preço com contexto | Avançado |
| Retenção | Detectar risco | **Nenhum** (score) |
| Retenção | Conversa de cancelamento | Avançado |
| Marketing | Rascunho de campanha | Avançado |

Atingido o teto de `config/costs/ai-cost-limits.json`, tudo cai para template determinístico
e o que não tem template vira tarefa humana. **O sistema nunca fica mudo nem improvisa.**

---

## 9. Avaliação

Todo prompt é testado contra `prompts/evaluations/` antes de subir: resposta proibida,
promessa indevida, vazamento de dado, alucinação sobre função inexistente, desconto não
autorizado, link incorreto, falta de encaminhamento humano, desrespeito ao opt-out e
insistência excessiva.

Falha em qualquer categoria bloqueia o merge.
