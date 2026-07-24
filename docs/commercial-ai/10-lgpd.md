# 10 — LGPD

> ⚖️ **Este documento não é parecer jurídico.** Foi elaborado por agente de IA a partir da
> arquitetura do sistema. Os pontos marcados `⚖️ VALIDAÇÃO JURÍDICA NECESSÁRIA` precisam de
> análise de advogado antes de entrar em produção.

Documentos complementares: [`lgpd-mapa-de-dados.md`](lgpd-mapa-de-dados.md),
[`lgpd-base-legal.md`](lgpd-base-legal.md), [`lgpd-retencao.md`](lgpd-retencao.md),
[`lgpd-resposta-incidentes.md`](lgpd-resposta-incidentes.md).

## 1. Privacidade desde a concepção

Decisões de arquitetura tomadas **para** reduzir risco de privacidade, não depois dele:

| Decisão | Efeito |
|---|---|
| Repositórios separados | Dado comercial não trafega pelo perímetro do certificado digital e da emissão fiscal |
| Sistema comercial **sem acesso ao banco** do SaaS | Impossível acessar o que não deveria; não é política, é impossibilidade técnica |
| Eventos carregam **sinal**, não conteúdo | `first_receipt_created: true`, jamais o recibo |
| Clientes do MEI **nunca** vão ao HubSpot | A base de clientes de cada MEI é dele, não nossa |
| Consentimento como campo de primeira classe | Sem consentimento não há envio — verificado antes de cada mensagem |
| Mascaramento em log por padrão | Vazamento por log fica muito menos provável |
| Retenção curta de execução no n8n | Conversa não fica arquivada indefinidamente |

## 2. A separação mais importante

O MEI Nota Fácil tem **dois níveis de titulares**:

| Nível | Quem | Papel do MEI Nota Fácil | Vai ao HubSpot? |
|---|---|---|---|
| 1 | **Assinante** (o MEI) | **Controlador** | ✅ Sim |
| 2 | **Clientes do assinante** | **Operador** (trata por conta do MEI) | ❌ **Nunca** |

O modelo `Customer` no SaaS são os clientes **do MEI**. Sincronizá-los para o HubSpot seria
usar dados de terceiros, obtidos como operador, para finalidade comercial própria —
incompatível com a finalidade original.

**É a regra mais importante deste documento.** Está implementada como proibição explícita em
`04-eventos.md` §2 e verificada por teste automatizado.

⚖️ **VALIDAÇÃO JURÍDICA NECESSÁRIA:** confirmar o enquadramento controlador/operador e sua
descrição nos Termos de Uso e na Política de Privacidade.

## 3. Dados tratados pelo sistema comercial

Ver `lgpd-mapa-de-dados.md` para o mapa completo. Resumo:

**Trata:** nome, e-mail, telefone, cidade/estado, atividade profissional, origem do lead,
estágio no funil, scores, consentimentos, histórico de contato e conteúdo de conversas
comerciais.

**Não trata:** CPF/CNPJ do assinante¹, dados de clientes do MEI, conteúdo de nota fiscal,
recibo ou orçamento, texto de contrato analisado, dados de certificado digital, senha, dado
bancário ou de cartão.

¹ O CNPJ existe no SaaS (`MeiProfile.cnpj`) mas **não é enviado** ao sistema comercial —
não há finalidade comercial que o justifique.

## 4. Consentimento

| Canal | Base | Como coletar |
|---|---|---|
| WhatsApp | **Consentimento específico** | Caixa **não** pré-marcada, texto claro, no cadastro ou no primeiro contato |
| E-mail transacional | Execução de contrato | Não exige consentimento |
| E-mail de onboarding | Execução de contrato / legítimo interesse ⚖️ | Opt-out disponível |
| E-mail de marketing | **Consentimento** | Caixa **não** pré-marcada |

Registrado por contato: se consentiu, quando, por qual origem e com qual texto — este último
é o que prova que o consentimento foi informado.

**Opt-out:** imediato, em qualquer canal, por qualquer palavra da lista de
`07-whatsapp.md` §4. Processado **antes** de qualquer IA. Nunca apagado — é a prova de que
foi respeitado.

## 5. Finalidade

| Dado | Finalidade declarada | Uso incompatível (proibido) |
|---|---|---|
| Telefone | Atendimento e comunicação comercial autorizada | Venda, cessão, base de terceiro |
| E-mail | Comunicação transacional e comercial autorizada | Lista de terceiro |
| Dados de uso | Melhorar ativação e prevenir cancelamento | Perfilamento sensível |
| Origem do lead | Medir eficiência de canal | Rastreamento cruzado com terceiro |
| Conversas | Atendimento e melhoria | Treinar modelo externo sem consentimento |

**Não treinar modelo com conversa real de cliente** sem base legal específica e avaliada.
⚖️ **VALIDAÇÃO JURÍDICA NECESSÁRIA.**

## 6. Direitos do titular

| Direito | Como atender | Prazo |
|---|---|---|
| Confirmação e acesso | Exportação por contato (HubSpot + registros comerciais) | 15 dias |
| Correção | Atualização direta no CRM | Imediato |
| Anonimização/eliminação | Quando não houver base legal para manter | 15 dias ⚖️ |
| Portabilidade | Exportação estruturada | 15 dias |
| Informação sobre compartilhamento | Lista de operadores em `lgpd-mapa-de-dados.md` | 15 dias |
| Revogação de consentimento | Opt-out imediato | Imediato |
| **Revisão de decisão automatizada** | Trilha de auditoria + análise humana | 15 dias |

Alguns dados **não** podem ser eliminados a pedido: registro de opt-out (prova de respeito
ao pedido) e registros com retenção legal obrigatória. ⚖️ **VALIDAÇÃO JURÍDICA NECESSÁRIA.**

## 7. Decisão automatizada

O sistema toma decisões que afetam o titular: qualificar lead, atribuir score de risco,
priorizar atendimento, escolher canal, oferecer condição autorizada.

Controles (art. 20 da LGPD):

- Toda decisão relevante fica na trilha com entrada, regra e saída.
- Os pesos são públicos e versionados em `lead-scoring.json` — não são caixa-preta.
- `mnf_score_versao` permite reconstruir por que um contato tinha certo score em certa data.
- Revisão humana disponível.
- Nenhuma decisão automatizada **nega** serviço, aumenta preço ou bloqueia acesso.

## 8. Compartilhamento com operadores

| Operador | Dados | Finalidade | Localização |
|---|---|---|---|
| HubSpot | Nome, e-mail, telefone, estágio, atividades | CRM | EUA ⚖️ |
| Meta (WhatsApp) | Telefone, conteúdo das mensagens | Mensageria | EUA ⚖️ |
| n8n | Trânsito de todos os dados comerciais | Orquestração | Conforme hospedagem |
| Provedor de IA | Conteúdo de conversa (trechos) | Classificação e resposta | EUA ⚖️ |
| Provedor de e-mail | E-mail e nome | Envio | A definir |

⚖️ **VALIDAÇÃO JURÍDICA NECESSÁRIA:** transferência internacional de dados (arts. 33–36) —
verificar cláusulas contratuais e informar o titular na Política de Privacidade.

## 9. Retenção

Ver `lgpd-retencao.md`. Princípio: **guardar pelo tempo da finalidade, não "para sempre por
via das dúvidas"**.

Ponto de atenção imediato: a retenção de execuções do n8n (B-01) — cada execução do
WhatsApp guarda telefone e conteúdo de mensagem. Recomendação: 7 dias para sucesso, 30 para
falhas.

## 10. Incidentes

Ver `lgpd-resposta-incidentes.md` e `14-incidentes.md`.

## 11. Pendências

| # | Pendência | Responsável |
|---|---|---|
| 1 | Validação jurídica de todos os pontos ⚖️ | Advogado (a definir — B-07) |
| 2 | Política de Privacidade cobrindo o tratamento comercial | Proprietário + advogado |
| 3 | Texto de consentimento de WhatsApp e de marketing | Proprietário + advogado |
| 4 | Definir encarregado (DPO) e canal do titular | Proprietário |
| 5 | Confirmar e ajustar retenção do n8n | Proprietário |
| 6 | Cláusulas de transferência internacional | Advogado |
