# Política de Segurança

Este repositório guarda a inteligência comercial do MEI Nota Fácil. Ele **não** guarda
segredos nem dados de pessoas.

---

## 1. O que nunca entra neste repositório

Proibido em qualquer arquivo, commit, branch, issue, pull request ou anexo:

- Chaves de API (Anthropic, Gemini, HubSpot, Meta/WhatsApp, Asaas, n8n)
- Tokens de acesso, refresh tokens, cookies, sessões
- Senhas, `DATABASE_URL` com credencial, strings de conexão reais
- Certificados, chaves privadas (`*.pem`, `*.key`, `*.p12`, `*.pfx`)
- Credenciais SMTP
- Dados reais de clientes: nome, CPF/CNPJ, telefone, e-mail, endereço
- Conversas reais de WhatsApp, e-mails reais, prints com dados pessoais
- Backups, dumps de banco, exportações de produção, logs de produção

Isso vale inclusive para dados **parcialmente mascarados** quando ainda permitirem
reidentificação (ex.: `João S., (11) 9****-1234, CNPJ 12.345.***/0001-**`).

## 2. Onde os segredos vivem

| Segredo | Local correto |
|---|---|
| Tokens de integração usados pela automação | Credenciais do n8n |
| Variáveis da aplicação | Variáveis de ambiente da hospedagem |
| Segredos de longo prazo | Cofre de segredos / gerenciador do provedor |
| Uso local do desenvolvedor | `.env` local, nunca commitado |

O único arquivo de ambiente versionado é [`.env.example`](.env.example), sempre com
valores **vazios**.

## 3. Dados de teste

Fixtures e exemplos usam apenas dados fictícios:

```
João Teste
teste@example.com
+55 11 90000-0000
CNPJ 00.000.000/0001-00
```

## 4. Controles obrigatórios

- **Assinatura de webhook** — todo evento recebido é verificado por HMAC-SHA256 com
  comparação em tempo constante antes de qualquer processamento.
- **Idempotência** — todo evento carrega `event_id`; reprocessamento não gera efeito novo.
- **Mascaramento em log** — telefone, e-mail, CPF/CNPJ e conteúdo de mensagem são
  redigidos antes de qualquer `console.log` ou envio a ferramenta de observabilidade.
- **Menor privilégio** — cada integração usa credencial própria, com o menor escopo que
  cumpra a função. Sem token compartilhado entre sistemas.
- **Allowlist de ações** — o agente só executa ferramentas declaradas. Ação fora da lista
  é recusada e registrada, nunca improvisada.
- **Defesa contra prompt injection** — conteúdo vindo de usuário (mensagem de WhatsApp,
  e-mail, formulário) é tratado como dado, nunca como instrução. Instrução embutida em
  mensagem de cliente não altera política, preço, desconto nem escopo de ferramenta.
- **Limites de taxa e timeout** — em toda chamada externa, com tentativa limitada e fila
  de falhas.
- **Interruptor de parada** — `COMMERCIAL_AI_KILL_SWITCH=true` congela todo envio
  automatizado sem necessidade de deploy.
- **Trilha de auditoria** — toda decisão automatizada relevante é registrada com entrada,
  regra aplicada, saída e se houve aprovação humana.

## 5. Rotação de credenciais

| Credencial | Rotação |
|---|---|
| Token do HubSpot (Private App) | 6 meses ou a cada saída de pessoa com acesso |
| Token da Meta/WhatsApp | Token de sistema permanente; revisar a cada 6 meses |
| `WEBHOOK_SIGNING_SECRET` | 6 meses, com janela de aceitação dupla na troca |
| `N8N_API_KEY` | 6 meses |
| `ENCRYPTION_KEY` | Somente com plano de rechaveamento escrito |

Após qualquer suspeita de vazamento: **revogar primeiro, investigar depois**.

## 6. Se um segredo vazar para o Git

1. Revogue e gere nova credencial no provedor — **isso primeiro**, antes de mexer no Git.
2. Registre um incidente seguindo [14-incidentes.md](docs/commercial-ai/14-incidentes.md).
3. Remova do histórico apenas com autorização expressa do proprietário (reescrita de
   histórico é operação destrutiva e exige aprovação humana).
4. Considere o segredo comprometido para sempre, mesmo que o repositório seja privado.

## 7. Verificação automática

```bash
npm run security:check
```

Roda também no CI, em todo pull request. A varredura procura padrões de chave, token,
CPF/CNPJ, telefone brasileiro e e-mail fora dos domínios de exemplo. **Falha no CI bloqueia
o merge.**

## 8. Como reportar uma vulnerabilidade

Não abra issue pública com detalhe explorável. Comunique diretamente ao proprietário do
repositório, com: o que foi encontrado, como reproduzir, impacto estimado e sugestão de
correção. Confirmação de recebimento em até 48 horas.
