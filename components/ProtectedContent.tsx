"use client";

import { useEffect, useState, type ReactNode } from "react";

const BLOCKED_KEYS = ["c", "v", "x", "a", "s", "p", "u"];
const BLOCKED_EVENTS = ["copy", "cut", "paste", "contextmenu", "selectstart", "dragstart"];
const BLANK_MS = 2000;

/**
 * Dificulta cópia e captura de tela do conteúdo. Não impede 100%: Win+Shift+S,
 * gravadores de tela, DevTools e foto pelo celular não são bloqueáveis pelo navegador.
 */
export default function ProtectedContent({ children }: { children: ReactNode }) {
  const [blank, setBlank] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const block = (e: Event) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setBlank(true);
        clearTimeout(timer);
        timer = setTimeout(() => setBlank(false), BLANK_MS);
        try {
          navigator.clipboard?.writeText("").catch(() => {});
        } catch {
          // sem permissão: ignora
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && BLOCKED_KEYS.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    BLOCKED_EVENTS.forEach((ev) => document.addEventListener(ev, block));
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    return () => {
      BLOCKED_EVENTS.forEach((ev) => document.removeEventListener(ev, block));
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="select-none"
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      <style>{"@media print { body { display: none !important; } }"}</style>
      {children}
      {blank && (
        <div
          aria-hidden
          style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 2147483647 }}
        />
      )}
    </div>
  );
}
