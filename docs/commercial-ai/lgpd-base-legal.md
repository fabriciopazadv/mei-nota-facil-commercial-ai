# LGPD — Base Legal

> ⚖️ **Documento técnico preparatório, não parecer jurídico.** Todo enquadramento aqui é
> **proposta** e precisa de confirmação por advogado antes de produção.

| Versão | Data | Status |
|---|---|---|
| 1.0 | 24/07/2026 | **Aguardando validação jurídica** |

## 1. Bases utilizadas (art. 7º da LGPD)

| Inciso | Base | Onde propomos usar |
|---|---|---|
| I | Consentimento | WhatsApp, e-mail de marketing, cookies de campanha |
| II | Obrigação legal | Guarda de consentimento e opt-out |
| V | Execução de contrato | Comunicação transacional com assinante e pessoa em teste |
| IX | Legítimo interesse | Onboarding, ativação, prevenção de cancelamento, medição de canal |

## 2. Enquadramento por atividade

### 2.1 Comunicação transacional
**Proposta:** execução de contrato (art. 7º, V).
Exemplos: verificação de e-mail, confirmação de pagamento, aviso de fim de trial, aviso de
falha de pagamento.
**Justificativa:** decorrem diretamente da relação contratual; sem elas o contrato não se
executa adequadamente.
**Sem opt-out** — não é comunicação promocional. ⚖️ *Confirmar o limite entre "aviso
necessário" e "comunicação comercial".*

### 2.2 Onboarding e ativação durante o teste
**Proposta:** execução de contrato **ou** legítimo interesse (art. 7º, IX).
Exemplos: dicas de uso, sugestão da próxima função, lembrete de recurso não explorado.
**Justificativa:** a pessoa aderiu a um teste gratuito de 31 dias; ajudá-la a usar o produto
é a própria execução do que ela contratou.
**Com opt-out.** ⚖️ *Confirmar qual base é mais adequada.*

### 2.3 Comunicação de WhatsApp
**Proposta:** **consentimento** (art. 7º, I) — específico, informado e destacado.
**Justificativa:** canal pessoal e intrusivo, sujeito também às regras da Meta, que exigem
opt-in independentemente da LGPD. Adotamos o padrão mais rigoroso.
**Requisitos:** caixa **não** pré-marcada; texto claro sobre o que será enviado; registro de
data, origem e texto exibido; revogação imediata.

### 2.4 Marketing por e-mail
**Proposta:** **consentimento** (art. 7º, I).
**Requisitos:** opt-in separado do aceite dos Termos; `List-Unsubscribe`; supressão imediata.
⚖️ *Avaliar se comunicação a cliente ativo sobre novidade do próprio produto cabe em
legítimo interesse — soft opt-in.*

### 2.5 Recuperação de checkout abandonado
**Proposta:** legítimo interesse (art. 7º, IX).
**Justificativa:** a pessoa manifestou intenção de compra e interrompeu; lembrá-la é
expectativa legítima. Limitado a poucas tentativas, com opt-out.
⚖️ **Ponto sensível — confirmar.** Requer teste de balanceamento documentado.

### 2.6 Prevenção de cancelamento e reativação
**Proposta:** legítimo interesse para cliente ativo; **consentimento** para reativação de
ex-cliente após período longo.
⚖️ *Definir a partir de quantos meses a reativação exige consentimento novo.*

### 2.7 Scores e perfilamento comercial
**Proposta:** legítimo interesse (art. 7º, IX).
**Justificativa:** prioriza atendimento e adequa comunicação. **Não** nega serviço, não
altera preço e não bloqueia acesso.
**Salvaguardas:** pesos públicos e versionados; trilha de auditoria; revisão humana
disponível (art. 20).

### 2.8 Medição de origem e campanha
**Proposta:** legítimo interesse para o dado próprio; **consentimento** quando envolver
cookie ou identificador de terceiro. ⚖️ *Confirmar com a política de cookies.*

### 2.9 Uso de IA sobre conversas
**Proposta:** execução de contrato / legítimo interesse **para atender**.
**Proibido sem base específica:** usar conversa real para treinar ou ajustar modelo.
⚖️ **Ponto sensível — confirmar**, inclusive a política de retenção do provedor escolhido.

## 3. Teste de balanceamento (legítimo interesse)

Exigido para cada uso baseado no art. 7º, IX. Estrutura:

1. **Interesse legítimo:** qual é, concretamente.
2. **Necessidade:** o objetivo se alcança com menos dado?
3. **Balanceamento:** expectativa do titular × impacto sobre ele.
4. **Salvaguardas:** opt-out, limite de frequência, transparência, revisão humana.

⚖️ **A ser elaborado e assinado por responsável jurídico** para: onboarding, recuperação de
checkout, prevenção de cancelamento, scores e medição de canal.

## 4. Dados sensíveis

O sistema comercial **não** trata dados sensíveis (art. 5º, II) e não deve começar a tratar.
Não inferir nem registrar: saúde, condição financeira pessoal, opinião política, religião,
filiação sindical, origem racial ou orientação sexual.

Se surgir espontaneamente numa conversa, não é extraído nem gravado em propriedade do CRM.

## 5. Menores

O produto se destina a microempreendedores individuais — maiores de idade. Não há coleta
dirigida a menores. Se identificado, o atendimento é encaminhado a humano e o cadastro
revisado. ⚖️ *Confirmar procedimento.*

## 6. Pendências para o jurídico

| # | Pergunta | Prioridade |
|---|---|---|
| 1 | Enquadramento controlador/operador nos dois níveis de titulares | **Alta** |
| 2 | Recuperação de checkout cabe em legítimo interesse? | **Alta** |
| 3 | Texto de consentimento de WhatsApp | **Alta** |
| 4 | Onboarding: contrato ou legítimo interesse? | Média |
| 5 | Prazo para reativação exigir consentimento novo | Média |
| 6 | Transferência internacional (HubSpot, Meta, IA) | **Alta** |
| 7 | Retenção mínima obrigatória após cancelamento | Média |
| 8 | Testes de balanceamento formais | **Alta** |
| 9 | Adequação da Política de Privacidade | **Alta** |
| 10 | Uso de conversa para treinar modelo | Média |
