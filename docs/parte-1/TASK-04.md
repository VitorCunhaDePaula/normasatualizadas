# TASK-04 — Autenticação (next-auth + bcrypt)

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2, §3, §7, §8

**Depende de:** [TASK-03](./TASK-03.md)  
**Desbloqueia:** [TASK-05](./TASK-05.md), [TASK-06](./TASK-06.md), [TASK-07](./TASK-07.md)

---

- [ ] `lib/auth.ts` exportando `authOptions`:
  - `CredentialsProvider` com campos `email` e `password`.
  - `authorize`: busca por e-mail (normalizado `trim().toLowerCase()`), `bcrypt.compare`; retorna `{ id, name, email }` ou `null`. Mensagem de erro genérica (não revelar se o e-mail existe).
  - `session: { strategy: "jwt", maxAge: 60 * 60 * 8 }`.
  - `pages: { signIn: "/" }`.
  - `callbacks.jwt` / `callbacks.session` para expor `user.id` na sessão.
- [ ] `app/api/auth/[...nextauth]/route.ts` com `export { handler as GET, handler as POST }` (sem `export const runtime`: com `cacheComponents` ligado o Next não aceita; Node.js já é o padrão).
- [ ] `types/next-auth.d.ts` estendendo `Session` com `user.id`.
- [ ] `SessionProvider` em um client component envolvendo o layout.
- [ ] Botão **Sair** nas páginas internas (`signOut({ callbackUrl: "/" })`).

**Pronto quando:** o usuário de teste loga, a sessão mostra o id, e o logout volta para `/`.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
