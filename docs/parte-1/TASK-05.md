# TASK-05 — Registro de usuários (API)

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §6, §8

**Depende de:** [TASK-03](./TASK-03.md), [TASK-04](./TASK-04.md)  
**Desbloqueia:** [TASK-06](./TASK-06.md)

---

- [ ] `app/api/register/route.ts` (POST; roda em Node.js por padrão, sem `export const runtime`):
  - Validar: nome obrigatório, CPF válido (dígitos verificadores), CRP no formato UF/número, e-mail válido, senha mínimo 8 caracteres (+ confirmação no front).
  - E-mail ou CPF já cadastrado → `409` com mensagem genérica ("Dados já cadastrados."), sem dizer qual campo.
  - `bcrypt.hash(senha, 12)` → `INSERT` em `users`.
  - Responder `201` sem devolver dados sensíveis.
- [ ] Após registro bem-sucedido, o front faz `signIn("credentials", ...)` automaticamente e redireciona para `/dashboard`.

**Pronto quando:** cadastro novo funciona, duplicado retorna erro claro, senha fica só como hash no banco.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
