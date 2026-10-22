import { passwordRules } from "@/lib/validators";

/** Checklist das regras de senha; `tone` ajusta as cores ao tema (login escuro × área interna). */
export default function PasswordRules({
  password,
  tone,
}: {
  password: string;
  tone: "dark" | "app";
}) {
  const colors =
    tone === "dark"
      ? { idle: "text-[#8a9a9e]", ok: "text-[#5fd4b8]" }
      : { idle: "text-(--app-mute)", ok: "text-(--app-green)" };

  return (
    <ul aria-label="Requisitos da senha" className="grid gap-0.5 text-[13px] sm:grid-cols-2">
      {passwordRules.map((r) => {
        const ok = r.test(password);
        return (
          <li key={r.label} className={ok ? colors.ok : colors.idle}>
            <span aria-hidden>{ok ? "✓" : "•"}</span> {r.label}
            <span className="sr-only">{ok ? " (atendido)" : " (pendente)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
