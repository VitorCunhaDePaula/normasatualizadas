# TASK-02 — Ambiente de teste MySQL (sem credenciais de produção)

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2, §5, §6

**Depende de:** [TASK-01](./TASK-01.md)  
**Desbloqueia:** [TASK-03](./TASK-03.md), [TASK-11](./TASK-11.md)

---

- [ ] `docker-compose.yml` com `mysql:8.4`, porta 3306, volume nomeado, e `./db/schema.sql` montado em `/docker-entrypoint-initdb.d/01-schema.sql` (cria as tabelas na primeira subida).
- [ ] Usuário/senha/banco do container iguais aos do `.env`.
- [ ] Scripts:
  - `db:up` → `docker compose up -d`
  - `db:down` → `docker compose down`
  - `db:reset` → `docker compose down -v && docker compose up -d` (recria do zero)
  - `db:seed` → `node scripts/seed.mjs`
- [ ] Seed cria também um **usuário de teste**: `teste@normas.local` / `Teste@123` (hash com bcrypt).
- [ ] Documentar no README: para produção, basta trocar as variáveis `DB_*` no ambiente de deploy e rodar `schema.sql` + `seed` no banco real.
- [ ] Alternativa sem Docker: anotar no README que funciona com qualquer MySQL 8 local (XAMPP/Laragon/instalação nativa) apontando o `.env` para ele.

**Pronto quando:** `npm run db:up && npm run db:seed` deixa o banco com as tabelas, o usuário de teste e as tabelas do cliente (ou placeholders).

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
