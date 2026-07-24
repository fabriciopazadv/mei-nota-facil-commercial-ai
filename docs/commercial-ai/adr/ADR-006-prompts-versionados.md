# ADR-006 — Prompts versionados e políticas fora do prompt

| Status | Data |
|---|---|
| **Aceito** | 24/07/2026 |

## Contexto

Os agentes precisam de instruções e de regras comerciais. Há a tentação natural de escrever
tudo num prompt: "você pode dar até 20% de desconto", "não contate mais de duas vezes por
semana".

O SaaS já resolveu esse problema do seu lado: tem `PromptRegistry` e grava `promptVersion`
em cada relatório gerado.

## Problema

Onde ficam as instruções dos agentes e onde ficam as regras comerciais?

## Opções

1. **Tudo no prompt** — instrução e regra juntas.
2. **Prompt versionado + política em arquivo** — o prompt lê a política.
3. **Tudo em código** — sem prompt, respostas fixas.

## Decisão

**Opção 2.**

- Prompts em `prompts/`, versionados, com metadados obrigatórios.
- Políticas em `config/`, versionadas, em JSON validado por schema.
- O prompt **recebe** a política como dado; nunca a contém.

## Justificativa

Regra dentro de prompt tem três defeitos graves:

1. **Não é confiável.** O modelo pode ignorá-la, e um texto de usuário bem construído pode
   contorná-la. Regra que trata de dinheiro não pode depender de persuasão.
2. **Não é auditável.** Descobrir qual desconto estava autorizado em março exige ler o
   histórico de um texto longo.
3. **Não é testável.** Não dá para escrever um teste unitário sobre um parágrafo.

Com a política em JSON: o código valida o limite antes de executar; o diff mostra
exatamente o que mudou e quando; o teste falha se alguém elevar um limite sem revisão.

A Opção 3 elimina a variância mas também a capacidade de conversar — e o produto precisa
atender gente escrevendo em linguagem livre.

## Consequências

**Positivas** — limites verificados por código, não por boa vontade do modelo; auditoria por
diff; teste automatizado; troca de modelo sem reescrever regra; prompt injection não alcança
a política; `mnf_score_versao` permite reconstruir decisões passadas.

**Negativas** — mais arquivos; é preciso injetar a política no contexto; disciplina para não
deixar regra vazar de volta para o prompt.

**Mitigação** — `validate:prompts` verifica metadados; revisão de pull request rejeita regra
numérica dentro de prompt; CODEOWNERS exige aprovação do proprietário em `config/`.

## Metadados obrigatórios

```yaml
name: · agent: · version: · status: · created_at: · updated_at:
owner: · approved_by: · model: · purpose: · risk_level:
```

## Regra de alteração

Prompt em produção não muda sem: versão anterior preservada no Git, descrição da alteração,
motivo, testes das avaliações executados, impacto avaliado e aprovação registrada.

## Riscos

| Risco | Mitigação |
|---|---|
| Regra voltar a vazar para o prompt | Revisão + validação automatizada |
| Política injetada mal formatada | Schema Zod valida na leitura |
| Prompt degradar sem ninguém notar | Avaliações rodam no CI |

## Reversibilidade

**Alta.** É organização de arquivos, não infraestrutura.
