# TASK-11 — Seed das duas tabelas do cliente — aguardando dados

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §6, §10

**Depende de:** [TASK-02](./TASK-02.md), [TASK-03](./TASK-03.md)  
**Desbloqueia:** [TASK-12](./TASK-12.md)

---

- [ ] Receber as duas tabelas (planilha/PDF) e converter para `db/seed/<slug>.json` no formato `{ slug, titulo, descricao, colunas, linhas, ordem, capa?, download_url?, variantes? }`.
- [ ] Conferir acentuação (utf8mb4), células vazias e números com vírgula decimal (manter como string para exibição fiel).
- [ ] `scripts/seed.mjs`: lê os JSON e faz `INSERT ... ON DUPLICATE KEY UPDATE` (pode rodar várias vezes sem duplicar).
- [ ] Enquanto os dados não chegarem, usar 2 tabelas placeholder com o mesmo formato.

**Pronto quando:** as tabelas reais estão no banco e batem com o original enviado pelo cliente.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
