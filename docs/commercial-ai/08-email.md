# 08 — E-mail

## 1. Situação

**O SaaS não envia e-mail.** Verificado: nenhuma dependência de `nodemailer`, `resend`,
`sendgrid`, SMTP ou função de envio no repositório `mei-facil`.

Isso significa que hoje não existe: verificação de e-mail, recuperação de senha por e-mail,
recibo de pagamento, aviso de fim de trial ou qualquer comunicação transacional.

É uma lacuna maior do que parece. E-mail é o canal **gratuito**; WhatsApp é o canal **pago**.
Depender só de WhatsApp significa pagar por comunicação que sairia de graça.

## 2. Análise de alternativas

```
Necessidade: enviar e-mail transacional (verificação, onboarding, fim de trial,
             falha de pagamento) e, eventualmente, comunicação de marketing.
             Volume estimado: baixo no início (< 2.000/mês).
```

### Alternativa 1 — E-mail de marketing do HubSpot
- **Custo inicial / recorrente:** zero (já contratado)
- **Limite gratuito:** restrito no plano atual; a auditoria mostrou `MARKETING_EMAIL` como
  `REQUIRES_REAUTHORIZATION` e o portal sem assento de Marketing Hub
- **Vantagens:** já pago; registro automático no contato; sem integração nova
- **Desvantagens:** **não serve para transacional**; sujeito ao limite de contatos de
  marketing; disparo condicionado ao plano
- **Riscos:** misturar transacional com marketing prejudica entregabilidade e pode ferir a
  finalidade declarada na LGPD
- **Recomendação:** usar **apenas** para comunicação de marketing, se e quando o plano
  permitir. Nunca para transacional.

### Alternativa 2 — SMTP de domínio já contratado
- **Custo:** zero, se já existir
- **Limite:** normalmente algumas centenas por dia
- **Vantagens:** custo zero; domínio próprio; sem serviço novo
- **Desvantagens:** entregabilidade fraca sem SPF/DKIM/DMARC bem configurados; sem métrica
  de abertura; limite baixo
- **Riscos:** e-mail em spam é pior que e-mail não enviado
- **Recomendação:** **verificar primeiro se existe.** É o Nível 1 do princípio de economia.
  Serve bem para transacional de baixo volume com DNS correto.

### Alternativa 3 — Provedor transacional com plano gratuito
- **Custo inicial:** zero
- **Recorrente:** zero dentro do limite gratuito
- **Vantagens:** boa entregabilidade; API simples; métricas; webhooks de entrega, abertura
  e bounce
- **Desvantagens:** serviço externo a mais; limite gratuito muda; alguns exigem cartão
- **Riscos:** dependência de terceiro; mudança unilateral de política
- **Recomendação:** caminho provável quando o volume crescer. **Pesquisar os limites
  gratuitos vigentes na data da decisão** — não confiar em número decorado. Comparar:
  limite mensal e diário, exigência de cartão, permissão de uso comercial, existência de
  API e webhook, política de dados e risco de descontinuidade.

### Decisão

**Adiada, deliberadamente**, até o proprietário responder se já existe SMTP/domínio
contratado (bloqueio B-05).

O que **não** fica adiado: a **camada de abstração**. O código fala com uma interface, não
com um provedor. Trocar de provedor deve ser mudar uma variável de ambiente, não reescrever
o sistema.

## 3. Camada de abstração

```typescript
interface EmailProvider {
  send(message: EmailMessage): Promise<EmailResult>;
  readonly name: string;
}

interface EmailMessage {
  to: string;
  category: EmailCategory;      // decide provedor, cabeçalhos e consentimento
  templateId: string;           // nunca corpo solto no código
  variables: Record<string, string | number>;
  correlationId?: string;
}
```

`EMAIL_PROVIDER` seleciona a implementação. Existe sempre um `NoopEmailProvider` que
registra e não envia — é o padrão em development e o comportamento quando o provedor está
fora do ar.

## 4. Categorias

| Categoria | Exemplos | Base legal | Opt-out |
|---|---|---|---|
| `transacional` | Verificação, senha, recibo, confirmação | Execução de contrato | Não se aplica |
| `onboarding` | Primeiros passos, dicas de uso no trial | Execução de contrato / legítimo interesse | Sim |
| `recuperacao` | Checkout abandonado, falha de pagamento, fim de trial | Execução de contrato / legítimo interesse | Sim |
| `marketing` | Novidades, promoções, conteúdo | **Consentimento** | **Obrigatório** |
| `suporte` | Resposta a ticket | Execução de contrato | Não se aplica |

**Nunca misturar transacional com marketing no mesmo envio nem no mesmo domínio de envio
sem análise técnica.** Uma denúncia de spam em campanha derruba a entregabilidade do e-mail
de recuperação de senha.

⚖️ A classificação de base legal acima precisa de **validação jurídica**. Ver
`lgpd-base-legal.md`.

## 5. E-mail × WhatsApp

Regra de escolha de canal:

| Situação | Canal | Motivo |
|---|---|---|
| Verificação, senha, recibo | **E-mail** | Transacional, gratuito, assíncrono |
| Onboarding do trial | **E-mail** | Gratuito e comporta texto longo |
| Fim de trial se aproximando | E-mail **primeiro** | Se não houver reação, então WhatsApp |
| Checkout abandonado (< 1h) | **WhatsApp** se a janela estiver aberta | Urgência real |
| Checkout abandonado (> 1h) | **E-mail** | Janela provavelmente fechada = custo |
| Falha de pagamento | **E-mail + WhatsApp** | Consequência concreta para o usuário |
| Marketing e conteúdo | **E-mail** | WhatsApp de marketing é caro e desgasta o número |
| Resposta a pergunta do usuário | **Mesmo canal em que perguntou** | Óbvio e gratuito |

Traduzindo: **o e-mail é o padrão; o WhatsApp é a exceção justificada.** Isso protege o
custo e a qualidade do número.

## 6. Requisitos técnicos

Independentemente do provedor:

- SPF, DKIM e DMARC configurados no domínio.
- Remetente com domínio próprio, nunca genérico gratuito.
- `List-Unsubscribe` em tudo que não for transacional.
- Registro de bounce e reclamação, com supressão automática do endereço.
- Registro do envio como atividade no HubSpot.
- Sem imagem rastreadora em e-mail transacional.
- Templates versionados em `prompts/templates/email/`.

## 7. Pendências

| # | Pendência | Responsável |
|---|---|---|
| 1 | Existe SMTP/domínio já contratado? (B-05) | Proprietário |
| 2 | SPF/DKIM/DMARC configurados no domínio? | Proprietário |
| 3 | Endereço remetente oficial | Proprietário |
| 4 | Pesquisar limites gratuitos vigentes na data da decisão | Conjunto |
| 5 | Implementar a camada de abstração | Fase 3 |

Enquanto pendente, `EMAIL_PROVIDER` fica vazio e o sistema usa o provedor `noop`: registra a
intenção de envio, não envia nada, não gera custo.
