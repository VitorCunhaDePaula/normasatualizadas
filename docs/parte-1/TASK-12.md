# TASK-12 — Testes finais e preparação para entrega

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** Todo o documento, especialmente §5 e §10

**Depende de:** todas as anteriores (01–11)  
**Desbloqueia:** Entrega

---

- [ ] Checklist manual:
  - [ ] Cadastro novo / e-mail duplicado / senha curta
  - [ ] Login certo / senha errada / e-mail inexistente
  - [ ] Acesso direto a `/dashboard` e `/dashboard/[slug]` deslogado → `/`
  - [ ] Slug inexistente → 404
  - [ ] Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, clique direito, arrastar seleção → bloqueados
  - [ ] Print Screen → tela branca 2 s
  - [ ] Logout encerra sessão
  - [ ] Chrome, Edge, Firefox e celular
  - [ ] Responsividade de `/`, `/dashboard` e `/dashboard/[slug]` em 360, 768, 1024 e 1440 px (DevTools → modo dispositivo) e em pelo menos um celular real
  - [ ] Nenhuma página com scroll horizontal
- [ ] `npm run build` sem erros/warnings de tipo.
- [ ] README: como rodar local, variáveis de ambiente, como apontar para o MySQL de produção.
- [ ] Deploy (quando houver credenciais): configurar `DB_*`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL=https://www.normasatualizadas.hogrefe.com.br`; rodar `schema.sql` e `db:seed` no banco real; HTTPS obrigatório (cookies de sessão seguros).

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
