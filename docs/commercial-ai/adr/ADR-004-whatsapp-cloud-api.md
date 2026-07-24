# ADR-004 — WhatsApp Business Cloud API oficial, sem intermediário

| Status | Data |
|---|---|
| **Aceito** | 24/07/2026 |

## Contexto

O WhatsApp é o canal principal do público-alvo (microempreendedores brasileiros). Existem
três caminhos: API oficial da Meta direto, um BSP intermediário, ou bibliotecas não oficiais.

## Problema

Como conectar o WhatsApp ao sistema comercial com o menor custo recorrente e o menor risco.

## Opções

### 1. Cloud API oficial, direto no n8n
- Custo de plataforma: **zero**. Paga-se apenas a mensagem, à Meta.
- Vantagens: sem mensalidade; sem intermediário; suporte oficial; controle total do dado.
- Desvantagens: configuração inicial mais trabalhosa (WABA, verificação do negócio,
  templates); é preciso implementar validação de assinatura e janela por conta própria.

### 2. BSP (ManyChat, WATI, Zenvia, Take Blip, Twilio, Gupshup, respond.io, ChatGuru)
- Custo: mensalidade **mais** o custo da mensagem.
- Vantagens: configuração assistida; interface pronta; suporte comercial.
- Desvantagens: mensalidade recorrente sobre uma API acessível de graça; dados de conversa
  trafegam por terceiro; dependência comercial; a maioria já embute automação que
  duplicaria o n8n.

### 3. Bibliotecas não oficiais (WhatsApp Web, QR Code, automação de navegador)
- Custo: zero.
- Vantagens: nenhuma que sobreviva à análise.
- Desvantagens: **viola os Termos**; número banido sem recurso; quebra a cada atualização;
  sem suporte; risco jurídico e reputacional.

## Decisão

**Opção 1 — Cloud API oficial da Meta, conectada diretamente ao n8n.**

A Opção 3 fica **proibida em produção**. Admitida apenas como protótipo descartável, com
risco documentado — nunca como arquitetura.

## Justificativa

Com plano de R$ 14,99/mês, uma mensalidade de BSP consome a receita de dezenas de assinantes
antes de qualquer mensagem ser enviada. Não há nada que um BSP entregue aqui que justifique
esse custo: o n8n já faz a orquestração, e a integração direta é bem documentada.

A Opção 3 troca risco financeiro por risco existencial: perder o número comercial paralisa o
canal principal, sem recurso rápido.

## Consequências

**Positivas** — sem mensalidade; controle total do dado de conversa; sem risco de mudança
unilateral de preço de intermediário; templates `utility` na janela saem de graça.

**Negativas** — configuração inicial mais lenta; validação de assinatura, janela de 24h,
categorização de template e limites são responsabilidade nossa; aprovação de template é
processo da Meta, com prazo próprio.

## Riscos

| Risco | Mitigação |
|---|---|
| Número banido por qualidade baixa | Limite de frequência; opt-out imediato; parada de sequência; priorizar janela aberta |
| Limite de 250 destinatários/24h | Operação inbound por desenho; sem disparo em massa |
| Mudança de política ou de preço da Meta | Documentação revisada a cada fase; tabela de custos versionada |
| Complexidade da janela de 24h | Controle explícito de janela por contato |

## Reversibilidade

**Média.** Migrar para um BSP depois é possível — o número é portável — mas exige refazer a
integração. Migrar de BSP para direto é igualmente trabalhoso. Começamos pela opção sem
custo recorrente.
