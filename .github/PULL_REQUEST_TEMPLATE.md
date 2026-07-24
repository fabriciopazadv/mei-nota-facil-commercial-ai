## Objetivo

<!-- O que este pull request faz, em uma ou duas frases. -->

## Problema resolvido

<!-- Que problema existia antes. Referencie a issue, se houver. -->

## Fase do projeto

<!-- Fase 0 a 7 — ver docs/commercial-ai/15-roadmap.md -->

## Arquivos alterados

<!-- Os principais, com uma linha sobre o motivo de cada. -->

## Arquitetura

<!-- Decisões tomadas. Se criou ou alterou um ADR, cite. -->

## Testes executados

```
# cole a saída de: npm run check
```

## Resultados

<!-- O que passou, o que ficou pendente. Se algo falhou, diga qual e por quê. -->

## Riscos e efeitos colaterais

<!-- O que pode quebrar. O que muda para quem já está usando. -->

## Variáveis de ambiente necessárias

<!-- Novas variáveis. Já foram adicionadas ao .env.example com valor VAZIO? -->

## Instruções de deploy

<!-- Passo a passo. Ordem importa. -->

## Instruções de rollback

<!-- Como desfazer. Obrigatório: um pull request sem plano de reversão não é aprovado. -->

---

## Checklist de segurança

- [ ] Nenhuma credencial, token ou chave
- [ ] Nenhum dado pessoal real (nem mascarado, se for reidentificável)
- [ ] Segredo novo declarado em `.env.example` com valor vazio
- [ ] Entrada externa validada por schema
- [ ] Log passa pelo redator de dados pessoais
- [ ] Ação sensível protegida por aprovação humana
- [ ] Erro tratado, sem falha silenciosa
- [ ] `npm run security:check` verde

## Checklist de LGPD

- [ ] Nenhum dado novo tratado sem finalidade declarada
- [ ] Consentimento verificado antes de qualquer envio
- [ ] Opt-out respeitado
- [ ] **Nenhum dado de cliente do MEI trafega para o domínio comercial**
- [ ] Retenção definida para dado novo
- [ ] Decisão automatizada registrada na trilha
- [ ] Pontos que exigem validação jurídica estão marcados com ⚖️

## Checklist de custos

- [ ] Nenhuma contratação nova
- [ ] Nenhum custo recorrente novo
- [ ] Chamada de IA justificada (regra determinística não resolveria?)
- [ ] Envio de mensagem respeita os limites de frequência
- [ ] Teto de custo respeitado

## Aprovação humana

Este pull request altera algum destes itens?

- [ ] Preço ou plano
- [ ] Política de desconto ou de extensão de trial
- [ ] Regras de autonomia ou de aprovação
- [ ] Pesos de lead scoring
- [ ] Limites de custo
- [ ] Texto de mensagem comercial
- [ ] Campanha ou disparo
- [ ] Política de privacidade
- [ ] Permissões

**Se qualquer item acima estiver marcado, este pull request exige aprovação explícita do
proprietário e não pode ser aprovado por quem o abriu.**
