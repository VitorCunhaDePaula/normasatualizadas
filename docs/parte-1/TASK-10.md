# TASK-10 — Proteção de conteúdo (anti-cópia + Print Screen)

> **Antes de começar:** leia [ARCHITECTURE.md](./ARCHITECTURE.md). As regras gerais (§2) valem para todas as tasks.
> **Seções relevantes:** §4, §7

**Depende de:** —  
**Desbloqueia:** [TASK-08](./TASK-08.md), [TASK-09](./TASK-09.md)

---

Criar `components/ProtectedContent.tsx` (`"use client"`) e usar em `/dashboard` e `/dashboard/[slug]`.

**Bloquear copiar/colar/selecionar:**
- [ ] CSS no wrapper: `user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;`
- [ ] Listeners no `document` com `preventDefault()`: `copy`, `cut`, `paste`, `contextmenu`, `selectstart`, `dragstart`.
- [ ] `keydown`: bloquear `Ctrl/Cmd + C`, `V`, `X`, `A`, `S`, `P` (e `U` para "ver código-fonte").
- [ ] `@media print { body { display: none !important; } }` (ou visibility hidden) para impedir Ctrl+P / imprimir pelo menu.

**Print Screen → tela branca por 2 segundos:**
- [ ] Ouvir `keyup` **e** `keydown` com `e.key === "PrintScreen"` (no Windows o evento normalmente só chega no `keyup`).
- [ ] Ao disparar: mostrar overlay `position: fixed; inset: 0; background: #fff; z-index: 2147483647` por **2000 ms**, depois remover.
- [ ] Best-effort: tentar `navigator.clipboard.writeText("")` para limpar a imagem copiada (pode falhar sem permissão; envolver em try/catch e ignorar erro).
- [ ] Remover todos os listeners no cleanup do `useEffect`.

Esqueleto de referência:
```tsx
"use client";
import { useEffect, useState, type ReactNode } from "react";

const BLOCKED_KEYS = ["c", "v", "x", "a", "s", "p", "u"];

export default function ProtectedContent({ children }: { children: ReactNode }) {
  const [blank, setBlank] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const block = (e: Event) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setBlank(true);
        clearTimeout(timer);
        timer = setTimeout(() => setBlank(false), 2000);
        navigator.clipboard?.writeText("").catch(() => {});
        return;
      }
      if ((e.ctrlKey || e.metaKey) && BLOCKED_KEYS.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const events = ["copy", "cut", "paste", "contextmenu", "selectstart", "dragstart"];
    events.forEach((ev) => document.addEventListener(ev, block));
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, block));
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{ userSelect: "none", WebkitUserSelect: "none" }}>
      {children}
      {blank && (
        <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 2147483647 }} />
      )}
    </div>
  );
}
```

**Limitações (comunicar ao cliente):** isso dificulta a cópia, mas não impede 100%. O sistema operacional costuma capturar a tela *antes* do navegador receber o evento do Print, então a tela branca serve mais como dissuasão; ferramentas como Win+Shift+S, gravadores de tela, DevTools ou foto pelo celular não são bloqueáveis via navegador.

**Pronto quando:** Ctrl+C/Ctrl+V/clique direito/seleção não funcionam nas páginas de tabela, e pressionar Print deixa a tela branca por ~2 s.

---

Em caso de conflito entre esta task e o ARCHITECTURE.md, **o ARCHITECTURE.md prevalece**. Se algo precisar mudar na arquitetura, atualize-o primeiro.
