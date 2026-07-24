# COM-19-Base-Conhecimento — Base de Conhecimento

| Campo | Valor |
|---|---|
| Fase | 2 |
| Status | Especificado — não implementado |
| Gatilho | Sub-workflow, chamado pelos agentes |
| Responsável | Proprietário |

## Finalidade

Busca em `knowledge/` por arquivo, categoria e palavra-chave. **Sem banco vetorial** — o volume não justifica, e a busca estruturada é mais previsível e auditável.

Só devolve documentos com `status: confirmado`. Documento marcado `a_confirmar` não vai ao público.

Quando não encontra: a resposta correta é "não sei, vou confirmar" + tarefa humana. **Não saber é uma resposta profissional; inventar não é.**

Reavaliar busca semântica acima de ~100 documentos, priorizando a extensão vetorial do PostgreSQL já usado pelo projeto.

## Entrada

Pergunta ou tema.

## Saída

Trechos relevantes de `knowledge/`, ou indicação de que não há informação confirmada.

## Credenciais necessárias

Nenhuma.

## Variáveis

—

## Tratamento de erro

Falha na busca → o agente responde que vai confirmar e cria tarefa humana. **Nunca improvisa.**

## Idempotência

Busca é somente leitura.

## Testes

Pergunta com resposta na base; sem resposta; documento com `status: a_confirmar` (não deve ser usado); pergunta ambígua.

## Rollback

Reverter os arquivos de `knowledge/` pelo Git.
