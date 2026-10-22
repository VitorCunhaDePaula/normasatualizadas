# TASK-07 — Proteção das rotas internas

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2 (proxy.ts), §7, §8

**Depende de:** [TASK-04](./TASK-04.md)  
**Desbloqueia:** [TASK-08](./TASK-08.md), [TASK-09](./TASK-09.md)

---

- [ ] `proxy.ts` (substitui o antigo `middleware.ts` no Next 16+):
  ```ts
  import { withAuth } from "next-auth/middleware";

  export default withAuth({
    pages: { signIn: "/" },
  });

  export const config = { matcher: ["/dashboard/:path*"] };
  ```
  > O import continua sendo `next-auth/middleware` (é o nome do módulo no next-auth v4); só o **arquivo** do Next muda para `proxy.ts`.
- [ ] Defesa em profundidade: nas pages de `/dashboard`, checar `getServerSession(authOptions)` e `redirect("/")` se não houver sessão.
- [ ] Nenhum conteúdo de tabela exposto em rota pública ou API sem sessão.

**Pronto quando:** acessar `/dashboard` ou `/dashboard/qualquer` deslogado (inclusive em aba anônima) cai em `/`.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
