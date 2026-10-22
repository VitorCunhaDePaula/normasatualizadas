# TASK-06 — Página `/` (login + cadastro) — aguardando design

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §2 (designs), §7, §8

**Depende de:** [TASK-04](./TASK-04.md), [TASK-05](./TASK-05.md)  
**Desbloqueia:** [TASK-12](./TASK-12.md)

---

- [ ] Uma única página com alternância entre **Entrar** e **Cadastrar** (abas ou toggle, conforme o design).
- [ ] Login: `signIn("credentials", { redirect: false })` → trata erro na tela; sucesso → `/dashboard`.
- [ ] Cadastro: nome completo, CPF, CRP, e-mail, senha, confirmar senha → chama `/api/register` ([TASK-05](./TASK-05.md)).
- [ ] Estados de loading (botão desabilitado) e mensagens de erro inline.
- [ ] Se já existe sessão ao abrir `/`, redirecionar para `/dashboard` (checar com `getServerSession` no server component).
- [ ] Responsivo conforme [ARCHITECTURE.md §2](./ARCHITECTURE.md#2-regras-gerais): formulário ocupa a largura toda no celular e fica centralizado com largura máxima no desktop; se o design tiver imagem/coluna lateral, ela some ou vai para cima no mobile.
- [ ] Inputs com `font-size` ≥ 16 px e botões com área de toque ≥ 44 px.
- [ ] **Aplicar o design do cliente** quando recebido.

**Pronto quando:** fluxo completo login/cadastro funciona, bate com o design e não quebra em 360, 768, 1024 e 1440 px.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
