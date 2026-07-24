---
titulo: Planos, valores e teste gratuito
categoria: pricing
ultima_revisao: 2026-07-24
responsavel: proprietario
fonte: repositório mei-facil (.env.example, AsaasBillingProvider, rota de registro)
status: confirmado
versao: 1.0.0
---

# Planos e teste gratuito

## Valores

| Plano | Valor | Equivalente mensal |
|---|---|---|
| Mensal | R$ 14,99 | R$ 14,99 |
| Semestral | R$ 69,99 | R$ 11,66 |

Cobrança recorrente. A cada ciclo, a pessoa escolhe **cartão, Pix ou boleto**.

> Valores conforme a configuração vigente do sistema de cobrança. Se houver divergência com
> o que a página de assinatura exibe, **a página vence** — e este documento precisa ser
> corrigido.

## Teste gratuito: 31 dias

E aqui está o ponto que mais gera confusão, e que todo agente precisa acertar:

> **O período gratuito de 31 dias só começa quando a pessoa vincula o pagamento no
> checkout.** Criar a conta não inicia o teste.

### O que isso significa na prática

| Situação | O que a pessoa vê |
|---|---|
| Criou a conta, não passou pelo checkout | Funções principais bloqueadas. **Não está em teste.** |
| Passou pelo checkout | 31 dias liberados, sem cobrança no período |
| Fim dos 31 dias | Primeira cobrança, no plano escolhido |

### Como explicar

Quem se cadastrou e não entende por que está bloqueado **não errou nada** — apenas não
concluiu um passo que talvez nem soubesse existir.

Explique assim:

- falta cadastrar a forma de pagamento para liberar os 31 dias;
- **não há cobrança durante o período gratuito**;
- a primeira cobrança só acontece no fim dos 31 dias;
- dá para cancelar antes disso.

Sem culpar, sem pressionar, sem tratar como falha do usuário.

### O que NÃO dizer

- "Você esqueceu de pagar" — não há pagamento no teste.
- "Seu teste acabou" — para quem nunca iniciou, ele não acabou: nunca começou.
- "É um problema técnico" — não é.

## Formas de pagamento

Cartão, Pix ou boleto, escolhidos a cada ciclo.

O sistema **não** pede nem armazena dados de cartão na conversa. O pagamento acontece
sempre pelo checkout oficial. **Nenhum agente pede dado de cartão — jamais.**

## Descontos

**Não há desconto autorizado.** Se pedirem: registre a objeção de preço, explique o que o
produto entrega e crie tarefa humana. Nunca prometa desconto futuro nem sugira que "talvez
dê para negociar".

## Cancelamento

Pode ser feito a qualquer momento. O pedido é respeitado — sem obstáculo, sem exigência de
falar com atendente, sem insistência depois da reafirmação.
