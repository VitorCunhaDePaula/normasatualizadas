import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp, loginLimiter, tooManyRequests } from "@/lib/rate-limit";

const handler = NextAuth(authOptions) as (req: Request, ctx: unknown) => Promise<Response>;

// Login (Credentials): 5 falhas por hora por IP bloqueiam o IP por 15 minutos.
export async function POST(req: Request, ctx: unknown) {
  if (!new URL(req.url).pathname.endsWith("/callback/credentials")) return handler(req, ctx);

  const ip = clientIp(req);
  const wait = loginLimiter.retryAfter(ip);
  if (wait > 0) return tooManyRequests(wait);

  const res = await handler(req, ctx);
  // Falha de credenciais: 401 (json) ou redirecionamento com ?error= (formulário).
  if (res.status === 401 || res.headers.get("location")?.includes("error=")) {
    loginLimiter.hit(ip);
  }
  return res;
}

export { handler as GET };
