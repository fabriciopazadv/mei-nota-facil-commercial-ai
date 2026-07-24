# 02 — Arquitetura

## 1. Visão geral

Orquestração **centralizada**. Não existem agentes autônomos conversando entre si sem
controle: existe um Diretor Comercial que recebe eventos, decide e delega ações
delimitadas a especialistas.

```mermaid
flowchart TD
    subgraph SaaS["SaaS MEI Nota Fácil — repo mei-facil"]
        APP[Aplicação Next.js]
        DB[(PostgreSQL operacional)]
        OUT[Emissor de eventos<br/>fila + HMAC + retentativa]
        APP --> DB
        APP --> OUT
    end

    OUT -->|HTTPS + X-Signature| ING["COM-01 Ingestão<br/>valida · deduplica · normaliza"]

    subgraph N8N["n8n — orquestrador"]
        ING --> DIR{{"Agente Diretor Comercial<br/>estágio · próxima ação · limites"}}
        DIR --> SDR[COM-05 SDR]
        DIR --> ONB[COM-06/07 Onboarding e Ativação]
        DIR --> CNV[COM-08/09/10 Conversão]
        DIR --> RET[COM-11/12/13 Retenção]
        DIR --> APR[COM-16 Aprovação Humana]
        GUARD["Guardas transversais<br/>COM-18 consentimento · COM-20 custos<br/>COM-17 erros"]
    end

    SDR & ONB & CNV & RET --> SYNC[COM-02 Sincronização HubSpot]
    SYNC --> HS[(HubSpot<br/>contatos · negócios · atividades)]

    SDR & ONB & CNV & RET --> OUTB[COM-04 WhatsApp Outbound]
    OUTB --> WA[WhatsApp Cloud API]
    WA --> INB[COM-03 WhatsApp Inbound]
    INB --> DIR

    APR -->|aprovado| OUTB
    DIR --> REP[COM-14/15 Relatórios]
    REP --> DASH[Painel e alertas]
```

## 2. Responsabilidades

| Componente | Faz | Não faz |
|---|---|---|
| **Aplicativo** | Emite eventos comportamentais assinados | Não decide nada comercial |
| **Banco do SaaS** | Fonte primária dos dados do produto | Não é acessado por este sistema |
| **n8n** | Orquestra, agenda, integra, controla aprovação e custo | Não guarda regra de negócio no nó |
| **HubSpot** | Registro comercial e histórico | Não automatiza (plano atual não tem Workflows) |
| **Agentes de IA** | Interpretam, classificam, redigem, recomendam | Não executam ação sensível nem alteram política |
| **`config/`** | Guarda as regras | — |

## 3. Por que o n8n é o motor

A auditoria confirmou que o HubSpot do portal 51640620 **não tem Workflows, objeto Leads
nem Campaigns** (`01-auditoria-inicial.md` §4). Concentrar automação no n8n não é
preferência: é a única opção que não exige upgrade. Ver `ADR-002`.

Vantagem colateral: as regras ficam versionadas neste repositório, auditáveis por diff, e
não presas à interface de um CRM.

## 4. Camada de decisão

O Diretor Comercial **não é um prompt gigante**. É uma sequência determinística com um
ponto de IA:

```mermaid
flowchart TD
    E[Evento normalizado] --> S1{Kill switch ativo?}
    S1 -->|sim| STOP[Descarta e registra]
    S1 -->|não| S2{Consentimento válido<br/>para o canal?}
    S2 -->|não| CH[Troca de canal ou nada]
    S2 -->|sim| S3{Já houve contato<br/>na janela de frequência?}
    S3 -->|sim| SUP[Suprime e reagenda]
    S3 -->|não| S4[Calcula estágio e scores<br/><i>determinístico</i>]
    S4 --> S5{Ação exige<br/>linguagem natural?}
    S5 -->|não| T[Template aprovado<br/><i>custo zero de IA</i>]
    S5 -->|sim| S6{Complexidade}
    S6 -->|baixa| M1[Modelo econômico]
    S6 -->|alta| M2[Modelo avançado]
    T & M1 & M2 --> S7{Ação está na<br/>matriz de autonomia?}
    S7 -->|autonomia total| EXEC[Executa]
    S7 -->|limitada| LIM{Dentro do limite<br/>configurado?}
    S7 -->|proibida| APR[COM-16 Aprovação humana]
    LIM -->|sim| EXEC
    LIM -->|não| APR
    EXEC --> LOG[Registra na trilha + HubSpot]
    APR --> LOG
```

Os passos S1 a S4 são código, não IA. A IA entra em S5 apenas quando a resposta precisa de
linguagem natural. **A maioria dos eventos nunca chega em S5.**

## 5. Estados do contato

```mermaid
stateDiagram-v2
    [*] --> Lead: lead_created
    Lead --> Cadastrado: account_created
    Cadastrado --> SemTrial: registration_completed<br/>sem checkout
    SemTrial --> EmTrial: trial_started
    Cadastrado --> EmTrial: trial_started
    EmTrial --> Ativado: primeiro recibo/orçamento/NFS-e
    Ativado --> Oportunidade: intenção de compra
    Oportunidade --> Checkout: checkout_started
    Checkout --> Cliente: payment_approved
    Checkout --> Recuperacao: checkout_abandoned
    Recuperacao --> Checkout
    Cliente --> Risco: inatividade ou falha de pagamento
    Risco --> Cliente: recuperado
    Risco --> Cancelado: subscription_cancelled
    Cancelado --> Reativacao
    Reativacao --> Cliente
    SemTrial --> Perdido: sem resposta após política
    EmTrial --> Perdido: trial_expired sem conversão
```

O estado **`SemTrial`** é específico deste produto e é o mais importante a instrumentar:
no SaaS atual a pessoa se cadastra, mas o trial de 31 dias só começa no checkout.

## 6. Onde a IA entra — e onde não entra

| Tarefa | Solução | Custo |
|---|---|---|
| Detectar `trial_day_26` | Agendamento | Zero |
| Decidir se contata | Regra + `config/commercial-rules/contact-frequency.json` | Zero |
| Calcular scores | Aritmética sobre `config/commercial-rules/lead-scoring.json` | Zero |
| Escolher template para estado conhecido | Tabela de correspondência | Zero |
| Classificar intenção de mensagem livre | Modelo econômico | Baixo |
| Extrair dados de uma frase | Modelo econômico | Baixo |
| Resumir conversa longa | Modelo econômico | Baixo |
| Responder objeção complexa | Modelo avançado | Alto |
| Analisar conflito de informação | Modelo avançado | Alto |
| Elaborar campanha | Modelo avançado + aprovação humana | Alto |

Regra prática: **se a pergunta tem resposta única e conhecida, não é trabalho de IA.**

## 7. Isolamento de dados

```mermaid
flowchart LR
    subgraph P["Domínio do produto — não sai do SaaS"]
        D1[Clientes do MEI]
        D2[Notas, recibos, orçamentos]
        D3[Contratos analisados]
        D4[Certificado digital]
    end
    subgraph C["Domínio comercial — este sistema"]
        C1[Assinante: nome, e-mail, telefone]
        C2[Consentimentos]
        C3[Estágio, scores, origem]
        C4[Conversas comerciais]
    end
    P -->|apenas sinais agregados<br/>ex.: primeiro_recibo_criado=true| C
```

O sistema comercial **nunca** recebe o conteúdo de um documento fiscal, o nome de um cliente
do MEI, o texto de um contrato analisado ou dado de certificado. Recebe apenas o **sinal de
que a ação ocorreu**. Ver `lgpd-mapa-de-dados.md` e `ADR-005`.

## 8. Resiliência

| Falha | Comportamento |
|---|---|
| SaaS não entrega evento | Fila com retentativa exponencial; após o limite, fila de falhas |
| Evento duplicado | Trava por `event_id`; segunda vez é sem efeito |
| HubSpot fora do ar | Enfileira; reprocessa; alerta após limite |
| WhatsApp fora do ar | Enfileira dentro do prazo válido; se a janela expirar, cai para template ou e-mail |
| IA fora do ar ou teto de custo atingido | Fallback determinístico por template; nunca fica mudo |
| n8n fora do ar | Eventos se acumulam na fila do SaaS; reprocessam ao voltar |
| Baixa confiança da IA | Encaminha para humano; não improvisa |

## 9. Convenções

- Dinheiro em **centavos (`Int`)**, como no SaaS.
- Telefone em **E.164** (`+5511900000000`).
- Data/hora em **ISO 8601 UTC**; exibição em `America/Sao_Paulo`.
- Idempotência por `event_id` (UUID v4) gerado na origem.
- Nome de workflow: `COM-NN-Nome-Em-Kebab`.
- Todo log passa pelo redator de dados pessoais.
