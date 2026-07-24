# 14 — Incidentes

Incidentes envolvendo **dados pessoais** seguem também
[`lgpd-resposta-incidentes.md`](lgpd-resposta-incidentes.md).

## 1. Classificação

| Nível | Critério | Resposta | Exemplo |
|---|---|---|---|
| **P1** | Cliente afetado agora, ou dado exposto, ou dinheiro errado | Imediata | Mensagem errada em massa; token vazado; cobrança indevida |
| **P2** | Operação parada, sem dano ao cliente | 4 horas | n8n fora do ar; eventos não processando |
| **P3** | Degradação sem parada | 1 dia útil | Workflow com erro intermitente; custo acima da média |
| **P4** | Risco potencial | 1 semana | Configuração incorreta detectada antes de causar efeito |

## 2. Primeira ação de P1

```
1. COMMERCIAL_AI_KILL_SWITCH=true
2. Revogar credencial, se houver suspeita
3. Registrar a hora exata
4. Avisar o proprietário
5. NÃO apagar log nem histórico
```

Só depois investigar. **Parar primeiro é sempre certo; investigar primeiro nem sempre.**

## 3. Cenários

### Mensagem errada enviada a muitos contatos
1. Kill switch.
2. Quantos receberam e o que dizia.
3. Avaliar correção pública: se induziu a erro, corrigir com **uma** mensagem clara, sem
   sequência.
4. Identificar a causa (workflow, prompt ou política).
5. Corrigir, testar em staging, reativar.
6. Post-mortem.

### Credencial vazada
1. **Revogar imediatamente** — antes de qualquer análise.
2. Gerar nova e atualizar no n8n.
3. Verificar uso indevido no período de exposição.
4. Se estava no Git, tratar como comprometida em definitivo.
5. Incidente de dados pessoais se houve acesso a dado de titular.

### Cobrança ou desconto indevido
1. Kill switch.
2. Levantar quem foi afetado.
3. **Honrar o que foi comunicado ao cliente** — corrigir o sistema, não o cliente.
4. Comunicar com transparência.
5. Corrigir a política e a guarda que falhou.

### Número de WhatsApp banido ou restrito
1. Parar todo envio.
2. Verificar o motivo no painel da Meta.
3. Iniciar o recurso formal, se cabível.
4. Reavaliar frequência, templates e opt-out.
5. **Não** trocar de número para contornar — repete o problema e agrava.

### IA revelou dado de um contato a outro
1. Kill switch — **P1 sempre**.
2. Levantar o alcance.
3. Incidente de dados pessoais (`lgpd-resposta-incidentes.md`).
4. Auditar como o dado entrou no contexto: quase sempre é contexto mal isolado.
5. Corrigir o isolamento **antes** de reativar qualquer conversa.

### n8n fora do ar
1. Confirmar que a fila do SaaS está retendo os eventos.
2. Verificar se há perda de dado — não deve haver.
3. Ao voltar, acompanhar o reprocessamento.
4. Se a fila estourou, reconstruir a partir dos eventos do SaaS.

### Custo explodindo
1. Baixar o teto imediatamente, ou kill switch.
2. Identificar: loop, contexto crescente ou tarefa determinística virando IA.
3. Corrigir e restabelecer o teto.

## 4. Post-mortem

Obrigatório para P1 e P2. **Sem procurar culpado** — se uma pessoa sozinha conseguiu causar,
o problema é o controle que faltou.

Estrutura: o que aconteceu, linha do tempo, impacto (quantos, o quê, quanto), causa raiz
(não "erro humano" — o que permitiu o erro), o que funcionou, o que não funcionou, ações
corretivas com responsável e prazo, e como isso será detectado antes na próxima vez.

Toda ação corretiva vira issue com prazo. Post-mortem sem issue é post-mortem esquecido.

## 5. Registro

| Campo | Conteúdo |
|---|---|
| ID | `INC-AAAA-NN` |
| Detecção / contenção / resolução | Data e hora |
| Nível | P1–P4 |
| Impacto | Quantos e o quê |
| Causa raiz | Descrição |
| Ações | Feitas e pendentes |
| Dados pessoais envolvidos | Sim/não → aciona o fluxo de LGPD |

Registro em issue com o rótulo `incident`, usando `.github/ISSUE_TEMPLATE/incident.md`.

## 6. Prevenção

| Controle | Previne |
|---|---|
| Modo sombra na primeira implantação | Evento errado virar mensagem |
| Staging com dados fictícios | Teste alcançar cliente real |
| Guardas antes de todo envio | Mensagem sem consentimento ou fora de frequência |
| Teto de custo | Gasto descontrolado |
| Aprovação humana em ação sensível | Desconto, reembolso e campanha por engano |
| Kill switch | Propagação de qualquer erro de envio |
| CI com varredura de segredos | Credencial no repositório |
| Backup antes de importar | Perda de workflow |
| Post-mortem com issue | Repetição |
