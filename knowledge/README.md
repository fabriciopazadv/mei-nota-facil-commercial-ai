# Base de Conhecimento

Fonte única de verdade dos agentes sobre o MEI Nota Fácil.

## Regra

**Só entra aqui o que está confirmado.** Se não está aqui, o agente não sabe — e dizer "não
sei, vou confirmar" é a resposta correta.

Base de conhecimento com informação errada é pior que base vazia: o agente responde com
confiança algo falso, e o cliente descobre depois de assinar.

## Metadados obrigatórios

Todo documento começa com:

```yaml
---
titulo:
categoria:
ultima_revisao:
responsavel:
fonte:
status: confirmado | a_confirmar | desatualizado
versao:
---
```

Documento com `status: a_confirmar` **não é usado** pelos agentes para responder ao público.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `product/` | O que é o produto, para quem, como funciona |
| `features/` | Funcionalidades, uma a uma |
| `pricing/` | Planos, valores, teste gratuito, formas de pagamento |
| `nfse/` | Nota fiscal, certificado digital, recibo |
| `objections/` | Objeções comuns e respostas aprovadas |
| `support/` | Problemas frequentes e soluções |
| `policies/` | Cancelamento, reembolso, privacidade |

## Busca

Por arquivo, categoria e palavra-chave. **Sem banco vetorial** nesta fase — o volume não
justifica. Reavaliar acima de ~100 documentos, e então priorizando a extensão vetorial do
PostgreSQL já usado pelo projeto, em vez de contratar outro serviço.

## Manutenção

Toda pergunta que o agente não soube responder vira uma pendência aqui. É assim que a base
cresce: a partir de dúvida real de cliente, não de imaginação.

Revisão mensal: verificar se algum documento ficou desatualizado por mudança no produto.
