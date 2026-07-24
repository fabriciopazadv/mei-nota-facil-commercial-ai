---
titulo: Funcionalidades confirmadas
categoria: features
ultima_revisao: 2026-07-24
responsavel: proprietario
fonte: repositório mei-facil (README, schema e rotas de API)
status: confirmado
versao: 1.0.0
---

# Funcionalidades

Tudo listado aqui **existe** no produto. Nada além disto pode ser prometido.

## Orçamentos

- Itens com descrição, quantidade e valor unitário.
- Desconto sobre o subtotal (o total nunca fica negativo).
- Prazo de execução, validade, garantia e forma de pagamento.
- Chave Pix já preenchida com a do MEI.
- **Validade real**: passado o prazo, o orçamento vira `VENCIDO` sozinho e não pode mais ser
  aprovado.
- **Página pública** para o cliente, sem login: aprovar, recusar ou pedir alteração.
- **Aceite eletrônico** com nome, CPF e data-hora registrados.
- Lista com filtros por estágio e busca.
- Histórico de alterações de cada orçamento.
- **Conversão em cobrança**: orçamento aprovado vira recibo, e o orçamento é marcado como
  convertido.
- **Ordem de serviço** em PDF, com itens, prazo, garantia e campos de assinatura.

## Clientes (mini-CRM do MEI)

- Cadastro com telefone/WhatsApp, e-mail e CPF/CNPJ.
- Etiquetas e segmentos livres.
- Observações.
- **Próxima ação**: o que fazer e quando — aparece em vermelho quando atrasa.
- Aniversário ou data de renovação.
- Marcação de contrato vigente.
- Lista com busca e segmentos prontos: *Devendo*, *A contatar*, *Datas próximas*,
  *Com contrato*.
- **Quanto cada cliente deve**, calculado automaticamente, com o total a receber no topo.
- **Ficha completa**: deve agora, já pagou, histórico, e uma linha do tempo unificada com
  orçamentos, notas/recibos e pagamentos.
- Botão de WhatsApp com mensagem pronta — vira cobrança quando há valor em aberto.

## Documentos fiscais

Modelo híbrido, com dois caminhos:

| Caminho | Exige certificado? | Valor fiscal |
|---|---|---|
| **Recibo** | Não | Não tem valor fiscal |
| **NFS-e** | **Sim** | Nota fiscal de serviço |

- Recibo em PDF e por página pública compartilhável.
- NFS-e pelo Portal Nacional, para quem tem certificado digital.
- Quando não há certificado, o sistema explica e sugere autoridades certificadoras.

## Pagamentos

- Registro de recebimento por Pix (manual).
- Aviso claro de que registrar o comprovante **não** confirma o recebimento no banco.
- Vínculo do pagamento ao orçamento e ao documento fiscal.

## Funções de IA

Todas orientativas, com aviso de que não substituem advogado nem contador.

| Função | O que faz |
|---|---|
| **Leitura de contrato** | Relatório estruturado sobre um contrato recebido |
| **Perguntas sobre o contrato** | Responde com base no texto; avisa quando a resposta não está no documento, sem inventar cláusula |
| **Assistente financeiro** | Panorama e recomendações a partir de pagamentos e orçamentos, incluindo alerta de teto do MEI |
| **Dúvidas fiscais** | Orientação sobre NFS-e, recibo, certificado, Pix e limite do MEI |

O texto do PDF do contrato é extraído **no próprio aparelho** — só o texto sai do navegador.

## Painel

Visão de quanto há a receber, orçamentos em aberto e situação geral.

## Catálogo de serviços

Serviços recorrentes salvos com descrição e valor, para reaproveitar em orçamentos.

---

## Perguntas frequentes sobre o que NÃO existe

| Perguntam | Resposta |
|---|---|
| Integra com meu banco / concilia automático? | **Não.** O registro de pagamento é manual. |
| Emite NF-e de produto? | **Não.** Só NFS-e de serviço. |
| Faz minha declaração anual (DASN)? | **Não.** |
| Emite a guia DAS? | **Não.** |
| Abre ou fecha MEI? | **Não.** |
| Substitui contador? | **Não**, e o produto diz isso explicitamente. |
| Folha de pagamento? | **Não.** |
| Tem app na App Store / Play Store? | Instalável pelo navegador como aplicativo (PWA). Não afirme presença em loja sem confirmação. |

**Nunca prometa que qualquer um destes "está no roadmap".**
