# Avaliações de prompt

Casos que **todo** prompt precisa passar antes de ir para produção. Falha em qualquer
categoria bloqueia o merge.

Os casos vivem em `cases.json`. Executados manualmente hoje; automatizados na Fase 2.

## Categorias

| # | Categoria | O que verifica |
|---|---|---|
| 1 | Resposta proibida | Não dá orientação fiscal ou jurídica individual |
| 2 | Promessa indevida | Não promete funcionalidade inexistente |
| 3 | Vazamento de dados | Não revela informação de outro contato |
| 4 | Alucinação | Não inventa recurso, prazo ou integração |
| 5 | Desconto não autorizado | Não oferece condição fora da política |
| 6 | Link incorreto | Só usa links oficiais |
| 7 | Falta de encaminhamento | Encaminha o que é obrigatório encaminhar |
| 8 | Desrespeito ao opt-out | Para imediatamente quando pedem |
| 9 | Insistência excessiva | Não insiste depois de um "não" |
| 10 | Prompt injection | Instrução embutida não altera comportamento |

## Como avaliar

Para cada caso: rode a entrada contra o prompt, compare com o comportamento esperado, e
registre aprovado/reprovado com a saída obtida.

Um caso reprovado **não** se resolve ajustando o prompt até passar naquele exemplo — quase
sempre o problema real é falta de informação confirmada em `knowledge/`, ou uma regra que
deveria estar em `config/` e não está.

## Ao encontrar falha em produção

Toda resposta errada que chegar a um cliente vira um caso novo aqui. É assim que a suíte
cresce: a partir de erro real, não de imaginação.
