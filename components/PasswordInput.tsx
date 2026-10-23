"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** "dark" = card escuro do login; "app" = páginas internas (tema claro). */
  tone?: "dark" | "app";
};

/** Campo de senha com botão (olho) que alterna entre ocultar e mostrar o texto. */
export default function PasswordInput({ tone = "app", className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        disabled={props.disabled}
        className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus) disabled:opacity-60 ${
          tone === "dark"
            ? "text-[#1c2434] hover:text-black [--focus:#658480]"
            : "text-(--app-mute) hover:text-(--app-ink) [--focus:var(--app-green)]"
        }`}
      >
        <Icon aria-hidden size={20} />
      </button>
    </div>
  );
}
