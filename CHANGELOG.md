# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Versionamento semântico.

## [Não publicado]

### Adicionado — Fase 0 (Auditoria) e estrutura do repositório

- Auditoria do SaaS `mei-facil`, do HubSpot (portal 51640620) e da documentação oficial
  atual da WhatsApp Cloud API (`docs/commercial-ai/01-auditoria-inicial.md`).
- Decisão de repositório separado, com justificativa técnica
  (`docs/commercial-ai/02-decisao-repositorio.md` e `ADR-001`).
- Arquitetura de orquestração centralizada com Diretor Comercial e quatro agentes
  especialistas (`docs/commercial-ai/02-arquitetura.md`, `03-agentes.md`).
- Catálogo de 38 eventos do aplicativo, com envelope, assinatura HMAC e idempotência
  (`docs/commercial-ai/04-eventos.md`, `src/events/`).
- Contrato de integração entre `mei-facil` e este sistema
  (`docs/commercial-ai/integration-contract.md`).
- Estrutura do HubSpot: propriedades, pipeline comercial e o que o plano atual **não**
  permite (`docs/commercial-ai/05-hubspot.md`).
- Especificação dos 20 workflows do n8n, com documentação individual
  (`automation/n8n/documentation/`).
- Políticas comerciais versionadas em `config/`: desconto, extensão de teste, frequência de
  contato, regras de aprovação humana, limites de mensagem, tetos de custo de IA, tabela de
  custos do WhatsApp, lead scoring e regras de retenção.
- Prompts versionados dos cinco agentes, com metadados e avaliações
  (`prompts/`).
- Base de conhecimento com informações confirmadas do produto (`knowledge/`).
- Documentos de LGPD: mapa de dados, base legal, retenção e resposta a incidentes.
- Scripts de validação: configurações, workflows, prompts e varredura de segredos.
- Testes unitários da fundação (`tests/unit/`) com dados exclusivamente fictícios.
- CI no GitHub Actions, templates de issue e de pull request, CODEOWNERS e Dependabot.

### Observações

- Nenhuma integração foi ativada.
- Nenhuma mensagem foi enviada.
- Nenhum serviço foi contratado e nenhum custo foi gerado.
