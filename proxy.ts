import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { BLOCKED_UA_PATTERN } from "@/lib/ai-bots";

// O import vem de `next-auth/middleware` (nome do módulo no v4); só o arquivo é `proxy.ts`.
const auth = withAuth({
  pages: { signIn: "/" },
});

// Host canônico vem do NEXTAUTH_URL. Só redireciona quando ele começa com "www." e a requisição chegou no mesmo
// domínio sem o "www." (localhost, IPs e outros subdomínios não são afetados).
const canonicalHost = (() => {
  try {
    const host = new URL(process.env.NEXTAUTH_URL ?? "").hostname;
    return host.startsWith("www.") ? host : null;
  } catch {
    return null;
  }
})();

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (canonicalHost && req.nextUrl.hostname === canonicalHost.slice(4)) {
    const url = req.nextUrl.clone();
    url.hostname = canonicalHost;
    const proto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    if (proto === "http" || proto === "https") url.protocol = proto;
    return NextResponse.redirect(url, 308);
  }

  // Bots de IA / navegadores headless recebem 403 em qualquer página, inclusive no login e nas APIs.
  if (BLOCKED_UA_PATTERN.test(req.headers.get("user-agent") ?? "")) {
    return new NextResponse("Acesso negado.", { status: 403, headers: { "X-Robots-Tag": "noindex, noai" } });
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return auth(req as NextRequestWithAuth, event);
  }
  return NextResponse.next();
}

// Tudo, exceto estáticos do Next e o robots.txt (os bots precisam conseguir lê-lo).
export const config = { matcher: ["/((?!_next/static|_next/image|robots.txt).*)"] };
