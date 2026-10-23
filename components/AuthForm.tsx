"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Logo from "@/components/Logo";
import PasswordInput from "@/components/PasswordInput";
import PasswordRules from "@/components/PasswordRules";
import {
  PASSWORD_POLICY_ERROR,
  formatCpf,
  formatCrp,
  isStrongPassword,
} from "@/lib/validators";

type Mode = "login" | "register";

const inputCls =
  "font-akkurat-regular w-full min-h-11 rounded-lg border border-[#dde3e5] bg-white px-3 text-base text-[#1c2434] placeholder:text-[#6b7680] outline-none transition focus:border-[#0f5c4f] disabled:opacity-60";
const labelCls = "font-akkurat-bold mb-1.5 block text-sm text-[#1c2434]";

function Field({
  label,
  id,
  type,
  ...props
}: {
  label: string;
  id: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {type === "password" ? (
        <PasswordInput
          id={id}
          name={id}
          tone="dark"
          className={inputCls}
          {...props}
        />
      ) : (
        <input id={id} name={id} type={type} className={inputCls} {...props} />
      )}
    </div>
  );
}

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");
  const [crp, setCrp] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
  }

  async function login(email: string, password: string) {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!res || res.error) return false;
    router.push("/dashboard");
    router.refresh();
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    setLoading(true);
    try {
      if (isLogin) {
        if (!(await login(email, password)))
          setError("E-mail ou senha inválidos.");
        return;
      }

      if (!isStrongPassword(password)) {
        setError(PASSWORD_POLICY_ERROR);
        return;
      }
      if (password !== String(form.get("confirm") ?? "")) {
        setError("As senhas não coincidem.");
        return;
      }
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          cpf,
          crp,
          email,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Não foi possível concluir o cadastro.");
        return;
      }
      if (!(await login(email, password))) {
        setError("Cadastro criado. Entre com seu e-mail e senha.");
        switchMode("login");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[450px] rounded-3xl bg-white px-5 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:px-10 sm:py-9">
      <Logo />
      <h1 className="font-lyon-semibold mt-7 text-center text-xl text-[#1c2434]">
        Acessar normas atualizadas
      </h1>
      <p
        key={`sub-${mode}`}
        className="font-akkurat-light animate-form-swap mt-1.5 text-center text-[0.95rem] text-[#6b7680]"
      >
        {isLogin
          ? "Insira seus dados de acesso"
          : "Crie seu cadastro profissional"}
      </p>

      <form
        key={`form-${mode}`}
        onSubmit={onSubmit}
        className="animate-form-swap mt-6 flex flex-col gap-4"
        noValidate
      >
        {!isLogin && (
          <>
            <Field
              label="Nome completo"
              id="name"
              type="text"
              autoComplete="name"
              required
              disabled={loading}
            />
            <Field
              label="CPF"
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              required
              disabled={loading}
            />
            <Field
              label="CRP"
              id="crp"
              type="text"
              inputMode="numeric"
              placeholder="06/123456"
              value={crp}
              onChange={(e) => setCrp(formatCrp(e.target.value))}
              required
              disabled={loading}
            />
          </>
        )}
        <Field
          label="E-mail"
          id="email"
          type="email"
          autoComplete="email"
          required
          disabled={loading}
        />
        <Field
          label="Senha"
          id="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {!isLogin && <PasswordRules password={password} tone="dark" />}
        {!isLogin && (
          <Field
            label="Confirmar senha"
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        )}

        {error && (
          <p
            role="alert"
            className="font-akkurat-regular rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#b3261e]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-akkurat-bold mt-2 min-h-12 w-full rounded-lg border border-[#8fd9cd] cursor-pointer bg-[#b5ede4] text-base text-[#1c2434] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Aguarde…" : isLogin ? "Entrar" : "Cadastrar e entrar"}
        </button>
      </form>

      <p
        key={`switch-${mode}`}
        className="font-akkurat-light animate-form-swap mt-5 text-center text-sm text-[#6b7680]"
      >
        {isLogin ? "Não possui uma conta? " : "Já tem conta? "}
        <button
          type="button"
          onClick={() => switchMode(isLogin ? "register" : "login")}
          disabled={loading}
          className="font-akkurat-bold min-h-11 px-1 text-[#0f5c4f] hover:underline"
        >
          {isLogin ? "Cadastre-se" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
