# ADR-007 — Aprovação humana obrigatória em ações irreversíveis

| Status | Data |
|---|---|
| **Aceito** | 24/07/2026 |

## Contexto

O sistema é chamado de "autônomo". A pergunta é o que ele decide sozinho.

Algumas ações são reversíveis (atualizar propriedade, criar tarefa, classificar lead). Outras
não são: mensagem enviada, desconto concedido, reembolso feito, campanha publicada, dado
eliminado.

## Problema

Qual o limite de autonomia da IA?

## Opções

1. **Autonomia total** — a IA decide tudo dentro das regras.
2. **Autonomia em três níveis** — total, limitada e proibida sem aprovação.
3. **Aprovação para tudo** — nada executa sem humano.

## Decisão

**Opção 2**, com a matriz em `config/autonomy/`:

| Nível | Critério | Exemplos |
|---|---|---|
| **Total** | Reversível, sem custo, dentro da política | Responder dúvida aprovada, atualizar propriedade, criar tarefa, classificar lead, enviar link oficial, parar sequência |
| **Limitada** | Reversível, custo baixo, dentro de limite configurado | Desconto pré-aprovado, extensão curta de trial, escolher entre templates aprovados, definir prioridade |
| **Proibida sem aprovação** | Irreversível, com custo, ou de efeito jurídico | Alterar preço, criar plano, publicar campanha paga, disparo em massa, desconto fora da política, reembolso, responder ameaça judicial, afirmação fiscal ou jurídica, alterar termos, excluir dados, bloquear usuário, contratar serviço, gerar custo novo |

## Justificativa

A Opção 1 é inaceitável: mensagem enviada não volta, e reembolso concedido por engano é
dinheiro perdido — com o agravante de que o cliente já foi informado. A Opção 3 elimina a
razão de existir do sistema.

O critério que separa os níveis é **reversibilidade**, não complexidade. Uma ação simples e
irreversível (enviar mensagem em massa) é mais perigosa que uma ação complexa e reversível
(recalcular todos os scores).

## Regra do silêncio

**Silêncio nunca aprova.** Sem resposta dentro do prazo, a ação **não** executa e é
registrada como não aprovada.

O oposto — executar por falta de resposta — transformaria a aprovação em teatro.

## Solicitação de aprovação

Toda solicitação (COM-16) informa: o que se pretende fazer, para quem, por quê, qual regra
disparou, custo estimado, o que acontece se ninguém responder e o prazo.

## Consequências

**Positivas** — nenhuma ação irreversível sem humano; limites verificados por código;
autonomia real onde é seguro; trilha completa; ampliável com segurança na Fase 7.

**Negativas** — aprovação pendente atrasa oportunidade; exige presença humana; a fila pode
acumular.

**Mitigação** — a maior parte das ações é de autonomia total; a fila é monitorada; a Fase 7
amplia a autonomia limitada **depois** de histórico comprovado.

## Limites iniciais

`discount-policy.json` e `trial-extension-policy.json` nascem em **zero**. Sem decisão do
proprietário, a IA não tem nada a oferecer além do preço cheio — o que é seguro, não
conveniente.

## Riscos

| Risco | Mitigação |
|---|---|
| Fila de aprovação acumulando | Monitoramento; revisão do que pode virar autonomia limitada |
| Aprovar sem ler | Solicitação objetiva, com custo e impacto explícitos |
| IA contornar a matriz por texto persuasivo | Verificação em **código**, não no prompt (ADR-006) |
| Autonomia ampliada cedo demais | Fase 7 exige métricas e revisão |

## Reversibilidade

**Alta.** Ampliar ou restringir autonomia é editar JSON. Restringir tem efeito imediato.
