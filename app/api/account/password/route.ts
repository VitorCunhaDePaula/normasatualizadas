import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUserPassword } from "@/lib/db";
import { passwordChangeLimiter, tooManyRequests } from "@/lib/rate-limit";
import { PASSWORD_MAX, PASSWORD_POLICY_ERROR, isStrongPassword } from "@/lib/validators";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Troca de senha do usuário logado. Só a senha atual errada conta para o limitador.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return bad("Sessão expirada. Entre novamente.", 401);

  const wait = passwordChangeLimiter.retryAfter(userId);
  if (wait > 0) return tooManyRequests(wait);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Requisição inválida.");
  }
  const { currentPassword, newPassword } = (body ?? {}) as Record<string, unknown>;

  if (typeof currentPassword !== "string" || !currentPassword || currentPassword.length > PASSWORD_MAX) {
    return bad("Informe sua senha atual.");
  }
  if (typeof newPassword !== "string") return bad(PASSWORD_POLICY_ERROR);
  if (newPassword.length > PASSWORD_MAX) {
    return bad(`A senha deve ter no máximo ${PASSWORD_MAX} caracteres.`);
  }
  if (!isStrongPassword(newPassword)) return bad(PASSWORD_POLICY_ERROR);

  const user = await getUserById(userId);
  if (!user) return bad("Sessão expirada. Entre novamente.", 401);

  if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
    passwordChangeLimiter.hit(userId);
    return bad("Senha atual incorreta.");
  }
  if (currentPassword === newPassword) return bad("A nova senha deve ser diferente da atual.");

  await updateUserPassword(userId, await bcrypt.hash(newPassword, 12));
  return NextResponse.json({ ok: true });
}
