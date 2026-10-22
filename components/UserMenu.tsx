"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const MAX_NAME = 14;

const firstNameTruncated = (name: string) => {
  const chars = Array.from(name.trim().split(/\s+/)[0]);
  return chars.length > MAX_NAME ? `${chars.slice(0, MAX_NAME).join("")}...` : name;
};

const itemCls =
  "flex min-h-11 w-full items-center px-4 font-akkurat-bold text-left text-sm text-(--app-ink) hover:bg-(--app-soft) focus-visible:bg-(--app-soft) focus-visible:outline-none";

export default function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu do usuário ${name}`}
        onClick={() => setOpen((o) => !o)}
        className="font-akkurat-regular flex min-h-11 max-w-full items-center gap-2.5 rounded-lg px-1.5 text-sm text-(--app-mute) hover:bg-(--app-soft) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--app-green) sm:gap-3.5"
      >
        <span
          aria-hidden
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#e4002b] font-akkurat-bold leading-none text-white"
        >
          <span className="block leading-none [text-box:trim-both_cap_alphabetic]">
            {Array.from(name.trim())[0]?.toUpperCase()}
          </span>
        </span>
        <span className="min-w-0 truncate">
          Olá, <strong className="font-akkurat-bold text-(--app-ink)">{firstNameTruncated(name)}</strong>
        </span>
        <span aria-hidden className={`shrink-0 text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-48 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-(--app-line) bg-(--app-card) py-1 shadow-[0_8px_24px_rgba(0,0,0,.18)]"
        >
          <Link href="/dashboard/configuracoes" role="menuitem" onClick={() => setOpen(false)} className={itemCls}>
            Configurações
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`${itemCls} text-(--app-green)`}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
