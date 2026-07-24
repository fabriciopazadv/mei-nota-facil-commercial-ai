---
titulo: NFS-e, recibo e certificado digital
categoria: nfse
ultima_revisao: 2026-07-24
responsavel: proprietario
fonte: repositório mei-facil (FiscalAdapter, rota /api/fiscal/nfse, README)
status: confirmado
versao: 1.0.0
---

# NFS-e, recibo e certificado digital

O assunto que mais gera dúvida e mais gera desistência. Vale acertar.

## Os dois caminhos

| | Recibo | NFS-e |
|---|---|---|
| Exige certificado digital? | **Não** | **Sim** |
| Tem valor fiscal? | **Não** | **Sim** |
| Disponível para todo mundo? | **Sim** | Só com certificado |
| Serve para quê? | Comprovar o serviço e o pagamento ao cliente | Nota fiscal de serviço |

## A dúvida mais comum

> "Preciso de certificado digital para usar o sistema?"

**Não.** O recibo funciona sem certificado e está sempre disponível. O certificado só é
necessário para emitir **NFS-e**.

Isso importa muito comercialmente: certificado digital custa dinheiro e assusta. Muita gente
desiste achando que precisa comprar um antes de testar. **Não precisa.**

## Quando o cliente pede nota fiscal

Se o cliente final exige nota fiscal de serviço, aí sim é necessário o certificado digital.
O sistema explica isso quando alguém tenta emitir NFS-e sem ter certificado, e sugere
autoridades certificadoras.

## Autoridades certificadoras sugeridas pelo produto

| Autoridade | Destaque exibido |
|---|---|
| Certisign | Menor custo |
| Serasa | Menor custo |
| Valid | Mais suporte |

O produto **não vende** certificado e **não recebe comissão**. Apenas indica onde obter.

⚠️ **Nenhum agente informa preço de certificado.** Os valores variam por autoridade, tipo e
validade — e informar errado gera reclamação. Diga que varia e indique consultar a
autoridade certificadora.

## Teto do MEI

O produto calcula e alerta sobre o limite de faturamento anual do MEI —
**R$ 81.000,00 por ano**, conforme implementado no assistente financeiro.

O cálculo do alerta é determinístico, feito no código; a IA apenas explica o resultado.

⚠️ **Cuidado:** o limite do MEI pode mudar por norma. Se houver alteração legal, este
documento precisa ser revisado **antes** de qualquer agente voltar a citar o valor.

## Limites das respostas fiscais

Os agentes podem:

- explicar a **diferença** entre recibo e nota fiscal;
- explicar **que** o certificado é necessário para NFS-e;
- explicar **como** o produto funciona;
- mencionar a existência do limite anual do MEI.

Os agentes **não** podem:

- dizer se determinada pessoa precisa emitir nota naquele caso concreto;
- orientar sobre enquadramento, tributação ou como declarar;
- dizer o que fazer se alguém estourou o limite;
- opinar sobre situação fiscal individual;
- sugerir qualquer forma de deixar de emitir documento.

Tudo isso é **encaminhamento humano obrigatório**. Orientação fiscal individual errada gera
prejuízo real para o cliente e responsabilidade para o negócio.
