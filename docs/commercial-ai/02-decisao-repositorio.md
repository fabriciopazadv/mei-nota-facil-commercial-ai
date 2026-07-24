# 02 — Decisão: repositório separado ou monorepositório

| Campo | Valor |
|---|---|
| Data | 24/07/2026 |
| Status | **Decidido** — repositório separado |
| Decisor | Proprietário, sob recomendação técnica |
| ADR | [ADR-001](adr/ADR-001-repositorio-separado.md) |

---

## 1. Situação encontrada

Levantamento dos repositórios da conta `fabriciopazadv`:

| Repositório | Conteúdo | Visibilidade |
|---|---|---|
| `mei-facil` | SaaS completo: Next.js 16, Prisma, PostgreSQL, Vercel | Privado |
| `mei-nota-facil-commercial-ai` | Vazio, sem commits | **Público** ⚠️ → em correção |

Não existia repositório comercial anterior. Não há duplicidade a resolver.

O `mei-facil` **não é monorepositório**: é uma aplicação Next.js única, sem `apps/`, sem
`packages/`, sem workspaces no `package.json`. A hipótese do §3 do comando complementar
(manter dentro do principal por integração forte) **não se aplica** — não há infraestrutura
compartilhada a preservar.

---

## 2. Alternativas analisadas

### Alternativa 1 — Repositório separado *(escolhida)*

```
mei-facil                       → produto
mei-nota-facil-commercial-ai    → sistema comercial
```

**Vantagens**

- Isolamento de segurança: os segredos comerciais (Meta, HubSpot, n8n) ficam fora do
  repositório que faz deploy do produto. Um comprometimento não alcança o outro.
- Blast radius menor: mudança em política de desconto não pode quebrar a emissão de NFS-e.
- Permissões independentes: um colaborador comercial não precisa de acesso ao código fiscal
  nem ao manuseio de certificado digital.
- Ciclos de vida diferentes: o produto versiona por release; o comercial muda política
  quase diariamente.
- CI mais barato e mais rápido: o CI comercial não roda build do Next.js.
- Naturezas diferentes: o comercial é majoritariamente **configuração, prompt e workflow**,
  não aplicação.

**Desvantagens**

- Schema de eventos existe em dois lugares.
- Mudança que atravessa os dois exige dois pull requests coordenados.
- Sem tipos compartilhados por import direto.

**Mitigações**

- `docs/commercial-ai/integration-contract.md` é o contrato normativo, com versionamento e
  política de descontinuação.
- JSON Schema publicado em `automation/n8n/schemas/` como artefato de referência.
- Teste de contrato dos dois lados sobre as mesmas fixtures.

### Alternativa 2 — Monorepositório

```
mei-facil/
├── apps/{web,commercial-ai}/
├── packages/{shared,events,security}/
└── automation/n8n/
```

**Vantagens** — tipos compartilhados por import; um pull request atômico; um só CI.

**Desvantagens** — exigiria reestruturar um SaaS em produção que hoje não é monorepo
(risco alto, ganho nenhum para o produto); junta segredos comerciais ao deploy do produto;
CI mais lento; permissões acopladas; e o comando mestre é explícito em não adotar
monorepositório por conveniência.

### Alternativa 3 — Sistema comercial inteiramente dentro do n8n, sem repositório

**Vantagens** — velocidade inicial.

**Desvantagens** — sem versionamento, sem revisão, sem teste, sem rollback, sem histórico.
Prompt e política viram conhecimento tácito preso numa interface. Descartada.

---

## 3. Critérios avaliados

| Critério | Separado | Monorepo | Peso |
|---|---|---|---|
| Isolamento de segurança | ✅ Forte | ❌ Segredos juntos | **Alto** |
| Risco de alteração acidental no produto | ✅ Nulo | ⚠️ Real | **Alto** |
| Permissões independentes | ✅ | ❌ | **Alto** |
| Complexidade de deploy | ✅ Independentes | ⚠️ Acoplada | Médio |
| Compartilhamento de tipos | ⚠️ Por contrato | ✅ Direto | Médio |
| Custo de migração agora | ✅ Zero | ❌ Reestruturar produção | **Alto** |
| Maturidade do projeto | ✅ Adequado | ⚠️ Prematuro | Médio |
| Tamanho da equipe (1 pessoa + agente) | ✅ Simples | ⚠️ Overhead de ferramenta | Médio |

---

## 4. Decisão

**Repositório separado**, `mei-nota-facil-commercial-ai`, privado, branch padrão `main`.

Comunicação entre os sistemas **exclusivamente** por HTTP com evento assinado por HMAC.
Nenhum acesso do sistema comercial ao banco de produção do SaaS — nem leitura.

---

## 5. Justificativa técnica

O argumento decisivo não é organização de código: é **superfície de comprometimento**.

O sistema comercial manipula tokens da Meta, do HubSpot e do n8n, além de dados de contato
e conversas. O SaaS manipula certificado digital A1, emissão fiscal e a base de clientes de
cada MEI. São dois perímetros com perfis de risco distintos, e o segundo é regulado.

Juntá-los no mesmo repositório significaria que qualquer pessoa com acesso para ajustar um
texto de WhatsApp teria acesso ao código que manuseia certificado digital. Isso é
inaceitável, e nenhuma conveniência de tipagem compensa.

O segundo argumento é o custo de reversão: separar depois é caro; juntar depois é barato.
Começamos pela opção reversível.

---

## 6. Consequências

**Positivas** — perímetros isolados; permissões granulares; CI rápido; políticas
comerciais versionadas e revisáveis; o produto não corre risco por mudança comercial.

**Negativas** — contrato de eventos precisa de disciplina; mudanças atravessadas custam
dois pull requests; sem tipagem compartilhada automática.

**Reversível?** Sim. Mover este repositório para `apps/commercial-ai/` no `mei-facil` é
uma operação de horas, sem perda de histórico. A decisão contrária (extrair de um monorepo
já enraizado) é que seria cara.

---

## 7. Revisão

Reavaliar se: o time crescer a ponto de a coordenação de dois pull requests virar gargalo;
o contrato de eventos mudar mais de uma vez por mês por dessincronia; ou o SaaS migrar
para monorepositório por outro motivo.
