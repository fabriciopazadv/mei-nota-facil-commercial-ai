# ADR-003 — HubSpot como sistema de registro, não como motor

| Status | Data |
|---|---|
| **Aceito** | 24/07/2026 |

## Contexto

O HubSpot está contratado (portal 51640620). A auditoria mostrou: assento `core` apenas,
Leads e Campaigns indisponíveis, e-mail de marketing restrito, sem Workflows.

Contatos, empresas, negócios, tarefas, tickets e atividades estão disponíveis para leitura e
escrita.

## Problema

Qual o papel do HubSpot: motor da operação comercial ou registro do relacionamento?

## Opções

1. **Registro** — o n8n decide e age; o HubSpot guarda o histórico.
2. **Motor** — automação nativa do HubSpot. Exigiria upgrade.
3. **Substituir** — outro CRM ou CRM próprio.

## Decisão

**Opção 1 — sistema de registro.**

O HubSpot é a fonte da verdade de **relacionamento comercial**: contatos, empresas,
negócios, etapas, atividades, tarefas, origem, interesse, objeções e histórico. Não executa
automação.

## Justificativa

A Opção 2 custa mensalidade para ter o que o n8n já faz. A Opção 3 descarta uma ferramenta
já paga e conhecida, para resolver um problema que não existe.

Vantagem colateral da Opção 1: as regras ficam versionadas em `config/`, revisáveis por
diff e testáveis — em vez de presas à interface de um CRM, onde ninguém consegue auditar o
que mudou e quando.

## Consequências

**Positivas** — sem custo adicional; interface conhecida para o proprietário; regras
versionadas; API robusta; nativamente pronto para receber contato e negócio.

**Negativas** — toda automação depende do n8n; sem sequências nativas; sem objetos
personalizados; limite de contatos de marketing; API com limite de 10 req/s.

**Mitigação** — retenção só de propriedades e listas para o ciclo de retenção (em vez de
segundo pipeline); atualização em lote; recuo exponencial em `429`.

## Riscos

| Risco | Mitigação |
|---|---|
| Portal em USD/US-Eastern | Corrigir **antes** de criar qualquer registro |
| Limite de API | Lote + recuo |
| Contato duplicado | Upsert por e-mail normalizado + idempotência |
| Crescimento exigir upgrade | Reavaliar em ~500 clientes ativos |

## Reversibilidade

**Alta.** O sistema fala com o HubSpot por uma camada de integração isolada (COM-02). Trocar
de CRM significa reescrever um workflow, não o sistema.
