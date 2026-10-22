# TASK-08 — Página principal interna `/dashboard` (prévias)

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §4, §6, §7

**Depende de:** [TASK-03](./TASK-03.md), [TASK-07](./TASK-07.md), [TASK-10](./TASK-10.md)  
**Desbloqueia:** [TASK-09](./TASK-09.md)

---

- [ ] Server component que lista as tabelas (`ORDER BY ordem, titulo`).
- [ ] Card de prévia por tabela: título, descrição curta e as **primeiras ~3 linhas** da tabela (com fade/corte visual).
- [ ] Card clicável → `/dashboard/[slug]`.
- [ ] Cabeçalho com nome do usuário logado + botão Sair.
- [ ] Prévias também envolvidas pelo `ProtectedContent` ([TASK-10](./TASK-10.md)).
- [ ] Estado vazio ("Nenhuma tabela disponível").
- [ ] Responsivo conforme [ARCHITECTURE.md §2](./ARCHITECTURE.md#2-regras-gerais): grid de cards com 1 coluna no celular, 2 no tablet e 3 no desktop (ex.: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`). A prévia da tabela dentro do card não pode estourar a largura (cortar colunas ou `overflow: hidden`).
- [ ] Cabeçalho (nome do usuário + Sair) se reorganiza no celular sem quebrar.

**Pronto quando:** as duas tabelas aparecem com prévia, levam à página individual e o layout funciona em 360, 768, 1024 e 1440 px.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
