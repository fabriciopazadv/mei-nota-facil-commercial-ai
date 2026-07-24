# ADR-002 — n8n como orquestrador único

| Status | Data |
|---|---|
| **Aceito** | 24/07/2026 |

## Contexto

O n8n já está contratado. O HubSpot também, mas a auditoria mostrou que o portal 51640620
**não tem Workflows** (exige Professional), nem o objeto Leads, nem Campaigns.

## Problema

Onde vive a automação: no HubSpot, no n8n, em código próprio ou distribuída?

## Opções

1. **n8n como orquestrador único.**
2. **HubSpot Workflows** — indisponível no plano atual.
3. **Serviço próprio** — construir um orquestrador em TypeScript.
4. **Distribuído** — parte no n8n, parte em código.

## Decisão

**Opção 1 — n8n como orquestrador único.** As regras de negócio ficam em arquivos
versionados (`config/`, `prompts/`), lidos pelos workflows.

## Justificativa

A Opção 2 exigiria upgrade — custo recorrente sem necessidade comprovada. A Opção 3 seria
reconstruir do zero o que o n8n já faz (agendamento, retentativa, fila, webhook,
human-in-the-loop), com custo de manutenção e hospedagem. A Opção 4 espalha a lógica em dois
lugares, e a pergunta "onde está essa regra?" passa a ter duas respostas possíveis.

O n8n já está pago, cobre todas as necessidades e permite exportar os workflows como JSON
versionável.

## Consequências

**Positivas** — sem custo adicional; visual e auditável; retentativa, agendamento e
aprovação nativos; workflows versionados no Git.

**Negativas** — dependência de uma ferramenta; lógica complexa fica desconfortável em nós;
testar workflow é mais difícil que testar função; risco de a regra vazar para dentro do nó.

**Mitigação** — regras em `config/` e não em nós; workflows pequenos; lógica complexa em
código chamado pelo workflow; documentação obrigatória por workflow.

## Riscos

| Risco | Mitigação |
|---|---|
| Limite de execuções do plano | COM-20 monitora; workflows enxutos |
| n8n indisponível | Fila do SaaS retém e reprocessa |
| Regra escondida dentro de um nó | Revisão de pull request; regra pertence a `config/` |
| Aprisionamento | Regras e prompts são arquivos portáveis; só a orquestração é do n8n |

## Reversibilidade

**Média.** Migrar orquestração é trabalhoso, mas as regras, prompts e políticas — a parte
valiosa — são arquivos independentes da ferramenta.
