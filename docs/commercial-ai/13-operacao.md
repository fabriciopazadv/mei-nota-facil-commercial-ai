# 13 — Operação (runbook)

## 1. Botão de parada

```
COMMERCIAL_AI_KILL_SWITCH=true
```

Congela **todo** envio automatizado, em todos os canais, sem deploy. Eventos continuam
sendo recebidos e registrados; nada sai.

**Onde acionar:** variável de ambiente do n8n (e do ambiente de execução auxiliar, se
houver). Efeito na próxima execução de workflow.

**Quando usar:** mensagem errada em produção, comportamento anômalo, custo disparando,
suspeita de vazamento, queda de qualidade do número, **ou qualquer dúvida**.

Na dúvida, acione. É reversível; mensagem enviada não é.

## 2. Painel — o que acompanhar

### Diário
| Métrica | Sinal de alerta |
|---|---|
| Leads gerados | Queda abrupta |
| Cadastros concluídos | Queda abrupta |
| **Cadastrados sem trial** | **Crescendo — o gargalo conhecido** |
| Testes iniciados | Queda |
| Usuários ativados | Queda |
| Conversões | Queda |
| Pagamentos falhos | Alta |
| Cancelamentos | Alta |
| Mensagens enviadas | Acima do teto |
| Custo do dia | Acima da média |
| Erros de workflow | Qualquer um |
| Encaminhamentos humanos pendentes | Acumulando |

### Semanal
Funil completo × semana anterior, origens, objeções mais frequentes, taxa de resposta no
WhatsApp, tempo médio de primeira resposta, churn, reativações, opt-outs, reclamações,
custo por lead e CAC.

### Sempre visível
Qualidade do número de WhatsApp (painel da Meta), consumo de IA × teto, execuções do n8n ×
limite do plano.

## 3. Rotina diária (10 minutos)

1. Relatório diário (COM-14) chegou? Se não, o COM-14 falhou — investigar.
2. Algum erro de workflow? Se sim, COM-17 registrou — verificar.
3. Encaminhamentos humanos pendentes? Responder.
4. Custo dentro do esperado?
5. Qualidade do número de WhatsApp está verde?
6. Alguma anomalia sinalizada?

## 4. Rotina semanal (30 minutos)

1. Ler o relatório semanal (COM-15).
2. Revisar objeções mais frequentes → atualizar `knowledge/objections/`.
3. Revisar conversas que foram para humano → o que poderia ter sido automatizado com
   segurança?
4. Verificar se algum score está previsto demais ou de menos.
5. Revisar pedidos de aprovação pendentes.
6. Conferir CAC × preço do plano.

## 5. Rotina mensal

1. Revisar `config/` — as políticas ainda fazem sentido?
2. Revisar `knowledge/` — algo desatualizado?
3. Revisar prompts com pior desempenho.
4. Verificar rotação de credenciais vencida.
5. Verificar retenção de dados executando.
6. Testar o kill switch.
7. Testar a restauração de um backup.

## 6. Problemas comuns

### Eventos não chegam
Verificar: SaaS emitindo? Fila acumulando? Webhook do COM-01 ativo? Assinatura batendo
(`401` indica segredo divergente)? n8n no ar?
Ação: se for o segredo, sincronizar os dois lados. Eventos ficam na fila e reprocessam.

### Contato duplicado no HubSpot
Causa provável: e-mail com maiúscula/espaço ou corrida entre eventos simultâneos.
Ação: mesclar no HubSpot; verificar a normalização no COM-02; conferir a trava de
idempotência.

### Mensagem duplicada para o mesmo contato
Causa provável: evento reprocessado sem trava, ou dois workflows agindo sobre o mesmo
gatilho.
Ação: **kill switch**, identificar a origem, corrigir a trava, retomar.

### Mensagem de WhatsApp não entrega
Verificar: janela aberta? Template aprovado? Limite de 24h atingido? Qualidade do número?
Número válido em E.164? Contato bloqueou?

### Qualidade do número caindo
Ação imediata: reduzir mensagens iniciadas pelo negócio; revisar os templates recentes;
conferir se o opt-out está sendo respeitado; verificar a frequência de contato. Se
continuar caindo, **parar tudo** e revisar a estratégia. Perder o número é caro.

### Custo de IA disparando
Verificar: alguma tarefa determinística virou chamada de IA? Contexto crescendo demais?
Loop chamando o modelo repetidamente? Cache funcionando?
Ação: baixar o teto, corrigir, subir de novo.

### IA respondendo errado
Ação: kill switch se for grave; identificar o prompt; verificar se a informação existe em
`knowledge/`; corrigir a base **antes** do prompt (quase sempre o problema é falta de
informação confirmada, não o prompt); adicionar caso em `prompts/evaluations/`.

### Workflow em erro
COM-17 registrou. Verificar se é temporário (API fora) ou permanente (defeito). Temporário
reprocessa sozinho; permanente exige correção e reprocessamento da fila de falhas.

## 7. Fila de encaminhamento humano

Tudo que a IA encaminha vira tarefa no HubSpot com prioridade.

| Prioridade | Situação | Prazo |
|---|---|---|
| **Urgente** | Ameaça judicial, vazamento, fraude, pessoa alterada | 1 hora |
| **Alta** | Reclamação grave, reembolso, erro fiscal, cancelamento | 4 horas |
| **Média** | Pedido de atendente, dúvida não coberta | 1 dia útil |
| **Baixa** | Baixa confiança em assunto trivial | 2 dias úteis |

Fila crescendo sem ser respondida = ou a IA está encaminhando demais, ou falta capacidade
humana. Ambos precisam de decisão, não de acúmulo.

## 8. Aprovações pendentes

COM-16 gera solicitações. **Silêncio nunca aprova**: sem resposta no prazo, a ação não
executa e é registrada como não aprovada.

## 9. Contatos

| Situação | Quem |
|---|---|
| Decisão comercial, desconto, campanha | Proprietário |
| Incidente de dados | Proprietário + jurídico ⚖️ |
| Falha técnica | Responsável técnico |
| Fora do horário | ⚠️ a definir |

## 10. O que nunca fazer

- Enviar mensagem em massa manualmente "só desta vez"
- Desligar uma guarda de consentimento para testar
- Usar dado real em staging
- Importar workflow em produção sem backup
- Alterar política direto no n8n sem passar pelo repositório
- Aprovar a própria alteração em ação sensível
- Ignorar queda de qualidade do número
- Apagar log durante um incidente
