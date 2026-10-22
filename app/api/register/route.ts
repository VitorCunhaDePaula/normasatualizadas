import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "@/lib/db";
import { clientIp, registerLimiter, tooManyRequests } from "@/lib/rate-limit";
import {
  PASSWORD_MAX,
  PASSWORD_POLICY_ERROR,
  isStrongPassword,
  isValidCpf,
  isValidCrp,
  onlyDigits,
} from "@/lib/validators";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

// Cadastro: no máximo 3 por hora por IP. Erros de validação (400) não contam.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const wait = registerLimiter.retryAfter(ip);
  if (wait > 0) return tooManyRequests(wait);

  const res = await handle(req);
  if (res.status !== 400) registerLimiter.hit(ip);
  return res;
}

async function handle(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Requisição inválida.");
  }

  const { name, cpf, crp, email, password } = (body ?? {}) as Record<string, unknown>;
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanCpf = typeof cpf === "string" ? onlyDigits(cpf) : "";
  const cleanCrp = typeof crp === "string" ? crp.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!cleanName || cleanName.length > 120) return bad("Informe seu nome completo.");
  if (!isValidCpf(cleanCpf)) return bad("Informe um CPF válido.");
  if (!isValidCrp(cleanCrp)) return bad("Informe um CRP válido (ex.: 06/123456).");
  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 190) return bad("Informe um e-mail válido.");
  if (typeof password !== "string") return bad(PASSWORD_POLICY_ERROR);
  if (password.length > PASSWORD_MAX) {
    return bad(`A senha deve ter no máximo ${PASSWORD_MAX} caracteres.`);
  }
  if (!isStrongPassword(password)) return bad(PASSWORD_POLICY_ERROR);

  const conflict = NextResponse.json(
    { error: "Dados já cadastrados." },
    { status: 409 },
  );

  if (await getUserByEmail(cleanEmail)) return conflict;

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await createUser({
      name: cleanName,
      cpf: cleanCpf,
      crp: cleanCrp,
      email: cleanEmail,
      passwordHash,
    });
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") return conflict;
    throw err;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
