# LGPD — Retenção

> ⚖️ Prazos são **propostas técnicas**, sujeitas a validação jurídica. Ver `10-lgpd.md`.

| Versão | Data | Status |
|---|---|---|
| 1.0 | 24/07/2026 | Aguardando validação jurídica |

## 1. Princípio

Guardar pelo tempo da finalidade. "Por via das dúvidas" não é finalidade.

Passado o prazo: **anonimizar** quando o dado agregado ainda tem valor analítico;
**eliminar** quando não tem.

## 2. Tabela de retenção

| Dado | Prazo proposto | Contagem a partir de | Depois | Justificativa ⚖️ |
|---|---|---|---|---|
| Contato de lead que nunca se cadastrou | **12 meses** | Último contato | Eliminar | Sem relação contratual |
| Contato de cadastrado sem trial | **24 meses** | Cadastro | Anonimizar | Reativação plausível |
| Contato de assinante ativo | Enquanto ativo | — | — | Contrato vigente |
| Contato de ex-assinante | **5 anos** | Cancelamento | Anonimizar | Prescrição civil ⚖️ |
| Conversas de WhatsApp | **12 meses** | Última mensagem | Eliminar | Continuidade do atendimento |
| Conversas de e-mail | **12 meses** | Último e-mail | Eliminar | Idem |
| **Consentimentos** | **Permanente** | — | Manter | Prova de conformidade |
| **Registros de opt-out** | **Permanente** | — | Manter | Prova de respeito ao pedido |
| Scores e histórico de estágio | **24 meses** | Última atualização | Anonimizar | Análise de funil |
| Origem do lead / campanha | **24 meses** | Criação | Anonimizar | Medição de canal |
| Trilha de decisões automatizadas | **24 meses** | Decisão | Anonimizar | Auditoria e art. 20 |
| Eventos brutos recebidos | **90 dias** | Recebimento | Eliminar | Depuração |
| Chaves de deduplicação (`event_id`) | **7 dias** | Recebimento | Eliminar | Só cobre retentativa |
| **Execuções do n8n (sucesso)** | **7 dias** | Execução | Eliminar | ⚠️ Guardam telefone e mensagem |
| **Execuções do n8n (falha)** | **30 dias** | Execução | Eliminar | Investigação |
| Logs da aplicação | **30 dias** | Geração | Eliminar | Já mascarados |
| Métricas agregadas | Indefinido | — | Manter | **Sem dado pessoal** |

## 3. Ponto de atenção imediato

A retenção de execuções do n8n **não foi verificada** (bloqueio B-01). É o maior risco de
retenção do sistema: cada execução do WhatsApp guarda telefone e conteúdo de mensagem, e o
padrão de muitas instalações é reter por muito tempo — ou indefinidamente.

**Ação:** confirmar e ajustar para 7 dias (sucesso) / 30 dias (falha) **antes** da Fase 2.

## 4. Anonimização

Anonimizar = tornar impossível reidentificar, inclusive por cruzamento.

| Campo | Vira |
|---|---|
| Nome | `[anonimizado]` |
| E-mail | Hash irreversível com sal, só para deduplicação de contagem |
| Telefone | Removido |
| Conteúdo de conversa | Removido |
| Cidade / Estado | Mantidos (não identificam sozinhos) |
| Estágio, scores, origem, datas | Mantidos |

O registro anonimizado continua servindo para métrica de funil sem ser dado pessoal.

⚠️ Substituir nome por iniciais, mascarar telefone parcialmente ou manter e-mail truncado
**não é anonimização** — permite reidentificação por cruzamento.

## 5. Eliminação a pedido do titular

Prazo de resposta: 15 dias.

**Pode ser eliminado:** dados de contato, conversas, scores, histórico comercial.

**Não pode ser eliminado:**
- Registro de opt-out — sem ele, a pessoa voltaria a receber mensagem, o que contraria o
  próprio pedido.
- Registro do consentimento e de sua revogação — prova de conformidade.
- Dados com retenção legal obrigatória (fiscal, contábil) ⚖️.

Resposta ao titular explica o que foi eliminado, o que foi mantido e por quê.

## 6. Execução

| Rotina | Frequência | Responsável |
|---|---|---|
| Varredura de dados vencidos | Semanal | COM-20 (a implementar na Fase 6) |
| Limpeza de chaves de deduplicação | Diária | COM-01 |
| Purga de execuções do n8n | Automática | Configuração do n8n |
| Purga de eventos brutos | Diária | COM-01 |
| Revisão da tabela de retenção | Anual | Proprietário + jurídico |

Toda eliminação automática é registrada: o que, quantos, quando, por qual regra — sem
identificar os titulares.

## 7. Pendências

1. ⚖️ Validar todos os prazos.
2. Confirmar e ajustar a retenção do n8n (B-01) — **prioridade alta**.
3. Implementar a rotina de varredura (Fase 6).
4. Definir a retenção legal obrigatória aplicável a ex-assinante.
5. Verificar a política de retenção do provedor de IA.
