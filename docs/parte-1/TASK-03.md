# TASK-03 — Banco de dados (schema + conexão)

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2, §6

**Depende de:** [TASK-01](./TASK-01.md), [TASK-02](./TASK-02.md)  
**Desbloqueia:** [TASK-04](./TASK-04.md), [TASK-05](./TASK-05.md), [TASK-08](./TASK-08.md), [TASK-09](./TASK-09.md), [TASK-11](./TASK-11.md)

---

- [ ] Criar `db/schema.sql` implementando **exatamente** o modelo de dados de [ARCHITECTURE.md §6](./ARCHITECTURE.md#6-modelo-de-dados) (tabelas `users` e `tabelas`, utf8mb4, InnoDB).
- [ ] `lib/db.ts`: `mysql.createPool({...})` lendo `DB_*`, `connectionLimit: 10`, guardado em `globalThis` para não multiplicar conexões no hot reload.
- [ ] Sempre queries parametrizadas (`pool.execute(sql, [params])`). Nunca concatenar input.
- [ ] Helpers: `getUserByEmail`, `createUser`, `listTabelas` (para prévias), `getTabelaBySlug`.

**Pronto quando:** um script/rota de teste consegue ler `SELECT 1` e listar as tabelas.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
