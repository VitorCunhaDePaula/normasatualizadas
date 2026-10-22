# TASK-09 — Página individual `/dashboard/[slug]` — aguardando design

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2 (designs), §6, §7

**Depende de:** [TASK-03](./TASK-03.md), [TASK-07](./TASK-07.md), [TASK-08](./TASK-08.md), [TASK-10](./TASK-10.md)  
**Desbloqueia:** [TASK-11](./TASK-11.md), [TASK-12](./TASK-12.md)

---

- [ ] Busca por slug; inexistente → `notFound()`.
- [ ] Renderizar a tabela a partir de `colunas`/`linhas` **conforme o design da tabela fornecido**.
- [ ] Responsivo conforme [ARCHITECTURE.md §2](./ARCHITECTURE.md#2-regras-gerais):
  - Tabela dentro de um container com `overflow-x: auto`; a página em si nunca rola na horizontal.
  - Cabeçalho da tabela fixo (`position: sticky; top: 0`) e, se a tabela for larga, primeira coluna também fixa (`position: sticky; left: 0`) para não perder a referência ao rolar no celular.
  - Tipografia e padding das células reduzidos no mobile (ex.: `clamp()`), sem ficar ilegível.
  - Indicação visual de que há mais conteúdo à direita (sombra/fade na borda) no celular.
- [ ] Link "voltar" para `/dashboard`.
- [ ] Conteúdo envolvido por `<ProtectedContent>` ([TASK-10](./TASK-10.md)).

**Pronto quando:** cada tabela abre completa, no visual do design, e é legível e navegável em 360, 768, 1024 e 1440 px.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
