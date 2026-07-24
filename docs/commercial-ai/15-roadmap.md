# 15 — Roadmap

## Estado

| Fase | Descrição | Status |
|---|---|---|
| **0** | Auditoria e estrutura | ✅ **Concluída** |
| 1 | Fundação: eventos, HubSpot, segurança | ⏳ Próxima |
| 2 | WhatsApp e atendimento | ⏸ |
| 3 | Trial e ativação | ⏸ |
| 4 | Conversão | ⏸ |
| 5 | Retenção | ⏸ |
| 6 | Inteligência comercial | ⏸ |
| 7 | Autonomia ampliada | ⏸ |

---

## Fase 0 — Auditoria ✅

**Entregue:** diagnóstico do SaaS, do HubSpot e da documentação do WhatsApp; decisão de
repositório; arquitetura; catálogo de eventos; estrutura do HubSpot; especificação dos 20
workflows; políticas em `config/`; prompts dos cinco agentes; base de conhecimento;
documentos de LGPD; scripts de validação; testes; CI e templates.

**Achados que mudaram o plano:** o trial só começa no checkout; o HubSpot não tem Workflows;
o SaaS não emite eventos, não envia e-mail e não coleta telefone.

---

## Fase 1 — Fundação ⏳

**Objetivo:** fazer o aplicativo falar e o CRM ouvir. Nenhuma mensagem é enviada nesta fase.

| # | Entrega | Onde | Bloqueio |
|---|---|---|---|
| 1.1 | Corrigir fuso e moeda do HubSpot | HubSpot | — |
| 1.2 | Criar propriedades e pipeline | HubSpot | B-03 |
| 1.3 | Emissor de eventos: fila, HMAC, retentativa | `mei-facil` | — |
| 1.4 | Instrumentar o lote 1 de eventos | `mei-facil` | 1.3 |
| 1.5 | Telefone + opt-in de WhatsApp no cadastro | `mei-facil` | ⚖️ texto |
| 1.6 | Captura de origem do lead (UTM) | `mei-facil` | — |
| 1.7 | COM-17 (erros) e COM-18 (consentimento) | n8n | B-01 |
| 1.8 | COM-20 (custos) e COM-16 (aprovação) | n8n | B-01 |
| 1.9 | COM-01 (ingestão) e COM-02 (HubSpot) | n8n | B-01, B-03 |
| 1.10 | **Modo sombra por 48h** | Tudo | 1.9 |

**Aceite:** evento sai do SaaS, chega assinado, é deduplicado e cria/atualiza contato no
HubSpot sem duplicar. Nenhuma mensagem enviada. Erros tratados. Custo zero.

**Marco:** pela primeira vez será possível responder *quantas pessoas se cadastraram e não
iniciaram o trial*.

---

## Fase 2 — WhatsApp e atendimento

**Objetivo:** responder quem procura. Só inbound.

| # | Entrega | Bloqueio |
|---|---|---|
| 2.1 | Número + WABA + verificação do negócio | B-02 |
| 2.2 | Templates iniciais aprovados na Meta | 2.1 |
| 2.3 | COM-03 (inbound) com validação de assinatura | 2.1 |
| 2.4 | Classificação de intenção (modelo econômico) | 2.3 |
| 2.5 | COM-05 (qualificação) + agente SDR | 2.4 |
| 2.6 | COM-19 (base de conhecimento) | — |
| 2.7 | COM-04 (outbound) com todas as guardas | 2.3 |
| 2.8 | Encaminhamento humano funcionando | 2.5 |
| 2.9 | Ajustar retenção de execuções do n8n | B-01 |

**Aceite:** mensagem recebida é respondida corretamente ou encaminhada; opt-out respeitado
na hora; nada enviado sem consentimento; conversa registrada no HubSpot; baixa confiança vai
para humano.

**Só responder, não iniciar.** Conversa iniciada pelo usuário é gratuita e é onde se aprende
o que o público pergunta de verdade.

---

## Fase 3 — Trial e ativação

**Objetivo:** fazer quem entrou usar o produto.

| # | Entrega |
|---|---|
| 3.1 | Instrumentar o lote 2 de eventos |
| 3.2 | Camada de e-mail (`08-email.md`) — **bloqueio B-05** |
| 3.3 | COM-06: onboarding + **fluxo do estado "cadastrado sem trial"** |
| 3.4 | COM-07: ativação por comportamento |
| 3.5 | Cálculo dos três scores |
| 3.6 | Acompanhamento dos 31 dias (`trial_day_*`) |
| 3.7 | Agente de Sucesso conduzindo onboarding |

**Aceite:** quem se cadastra e não inicia o trial recebe um fluxo próprio; quem inicia
recebe onboarding; scores calculados e auditáveis; sequência para na conversão.

**A entrega 3.3 é a de maior retorno esperado de todo o projeto.**

---

## Fase 4 — Conversão

| # | Entrega |
|---|---|
| 4.1 | COM-08: conversão de trial |
| 4.2 | COM-09: checkout abandonado |
| 4.3 | COM-10: pagamento falhou |
| 4.4 | Agente de Conversão com condições autorizadas |
| 4.5 | Tratamento de objeções a partir de `knowledge/objections/` |
| 4.6 | Atualização do pipeline em tempo real |

**Aceite:** checkout abandonado gera recuperação dentro da política; falha de pagamento
notifica pelo canal certo; nenhuma condição fora do autorizado; sequência para na conversão.

⚠️ **Bloqueio comercial:** `discount-policy.json` e `trial-extension-policy.json` estão em
**zero**. Sem decisão do proprietário, o agente não tem nada a oferecer além do preço cheio.

---

## Fase 5 — Retenção

| # | Entrega |
|---|---|
| 5.1 | Instrumentar o lote 3 de eventos |
| 5.2 | Detecção de inatividade |
| 5.3 | COM-11: retenção por risco |
| 5.4 | COM-12: cancelamento com registro de motivo |
| 5.5 | COM-13: reativação |
| 5.6 | Score de risco em produção |

**Aceite:** risco detectado antes do pedido de cancelamento; cancelamento **respeitado**, com
no máximo uma alternativa autorizada; motivo registrado; reativação só com base legal
adequada.

---

## Fase 6 — Inteligência comercial

| # | Entrega |
|---|---|
| 6.1 | COM-14: relatório diário |
| 6.2 | COM-15: relatório semanal |
| 6.3 | Painel de métricas |
| 6.4 | Análise de objeções |
| 6.5 | Análise de campanhas e CAC |
| 6.6 | Rotina de retenção de dados (LGPD) |
| 6.7 | Detecção de anomalias |

**Aceite:** relatório diário chega todo dia; distingue fato, métrica, inferência e
recomendação; CAC calculado; anomalia alerta antes de virar problema.

---

## Fase 7 — Autonomia ampliada

**Só depois de métricas estáveis e revisão humana comprovando qualidade.**

| # | Entrega | Pré-requisito |
|---|---|---|
| 7.1 | Desconto autorizado sem aprovação caso a caso | Política definida + 3 meses de histórico |
| 7.2 | Extensão de trial autônoma | Idem |
| 7.3 | Testes A/B de mensagem | Volume suficiente |
| 7.4 | Otimização de horário de contato | Dados de resposta |
| 7.5 | Decisão automática de priorização | Scores validados |

**Nunca nesta fase:** alterar preço, publicar campanha paga, conceder reembolso, disparar em
massa, alterar política de privacidade.

---

## Dependências críticas

| ID | Bloqueio | Trava |
|---|---|---|
| B-01 | Acesso e plano do n8n | Fases 1+ |
| B-02 | Número na WhatsApp Cloud API | Fase 2 |
| B-03 | Private App do HubSpot | Fase 1 |
| B-04 | Fuso e moeda do HubSpot | Fase 1 |
| B-05 | Canal de e-mail | Fase 3 |
| B-06 | Rate card do WhatsApp | Estimativa de custo |
| B-07 | Responsável jurídico | Publicação dos documentos de LGPD |
| B-08 | Política de desconto e de extensão de trial | Fase 4 |

## Decisões pendentes do proprietário

1. Plano e retenção do n8n
2. Número de WhatsApp: existe? está no app WhatsApp Business?
3. SMTP/domínio já contratado?
4. Desconto máximo sem aprovação
5. Extensão de trial máxima sem aprovação
6. Quem valida os documentos de LGPD
7. Confirmação do plano do HubSpot

## Princípio de sequenciamento

Fundação antes de agente. Inbound antes de outbound. Gratuito antes de pago. Medir antes de
otimizar. Modo sombra antes de ação real.

**Não se constrói agente de IA sobre dado que não existe.**
