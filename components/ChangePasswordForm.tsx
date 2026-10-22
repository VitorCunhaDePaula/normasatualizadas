"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import PasswordRules from "@/components/PasswordRules";
import { PASSWORD_POLICY_ERROR, isStrongPassword } from "@/lib/validators";

const inputCls =
  "font-akkurat-regular w-full h-11 rounded-md border border-(--app-line) bg-(--app-card) px-3 text-base text-(--app-ink) outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--app-green) disabled:opacity-60";
const labelCls = "font-akkurat-light mb-1 block text-[13px] text-(--app-mute)";

type Status = { kind: "error" | "success"; message: string } | null;

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    if (!isStrongPassword(next)) {
      setStatus({ kind: "error", message: PASSWORD_POLICY_ERROR });
      return;
    }
    if (next !== confirm) {
      setStatus({ kind: "error", message: "As senhas não coincidem." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStatus({ kind: "error", message: data?.error ?? "Não foi possível alterar a senha." });
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setStatus({ kind: "success", message: "Senha alterada com sucesso." });
    } catch {
      setStatus({ kind: "error", message: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-4 flex max-w-md flex-col gap-4">
      <div>
        <label htmlFor="current-password" className={labelCls}>
          Senha atual
        </label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          disabled={loading}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="new-password" className={labelCls}>
          Nova senha
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          disabled={loading}
          className={inputCls}
        />
      </div>
      <PasswordRules password={next} tone="app" />
      <div>
        <label htmlFor="confirm-password" className={labelCls}>
          Confirmar nova senha
        </label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={loading}
          className={inputCls}
        />
      </div>

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`font-akkurat-regular rounded-lg px-3 py-2 text-sm ${
            status.kind === "error"
              ? "bg-[#fdecec] text-[#a11b1b] dark:bg-[#3a1f22] dark:text-[#ffb4b4]"
              : "bg-(--app-soft) text-(--app-green)"
          }`}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="font-akkurat-bold min-h-11 w-full rounded-lg border border-(--app-green) bg-(--app-soft) px-4 text-[14.5px] text-(--app-green) transition hover:bg-(--app-mint) hover:text-(--app-ink) disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Aguarde…" : "Alterar senha"}
      </button>
    </form>
  );
}
