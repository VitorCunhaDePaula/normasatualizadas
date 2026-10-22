# TASK-01 — Setup do projeto

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2, §3, §4, §5

**Depende de:** —  
**Desbloqueia:** [TASK-02](./TASK-02.md), [TASK-03](./TASK-03.md)

---

- [ ] Criar app: `npx create-next-app@latest` (TypeScript, App Router, ESLint, `src/` opcional).
- [ ] Instalar as dependências de [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-stack-e-dependências): `npm i next-auth@4 bcrypt mysql2` e `npm i -D @types/bcrypt`.
- [ ] Criar `.env` com **exatamente** as variáveis listadas em [ARCHITECTURE.md §5](./ARCHITECTURE.md#5-variáveis-de-ambiente).
- [ ] Criar a estrutura de pastas de [ARCHITECTURE.md §4](./ARCHITECTURE.md#4-estrutura-de-pastas) (arquivos vazios ou com TODO).
- [ ] Garantir `.env` no `.gitignore` (não versionado).
- [ ] Scripts no `package.json`: `db:up`, `db:down`, `db:reset`, `db:seed`.

**Pronto quando:** `npm run dev` sobe a página padrão sem erros.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
