// Limitadores em memória por chave (IP; chave nula = IP não identificado, não é limitada). Suficiente para uma instância única; com várias
// instâncias/serverless, troque por um store compartilhado (ex.: Redis/Upstash).
//
// Memória: a cada 5 minutos uma varredura apaga só as entradas expiradas (bloqueios ativos são
// preservados) e cada limitador guarda no máximo MAX_ENTRIES chaves.

import { isIP } from "node:net";

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const SWEEP_EVERY_MS = 5 * MINUTE;
const MAX_ENTRIES = 10_000;

type Entry = { count: number; resetAt: number; blockedUntil: number };
type Store = Map<string, Entry>;

const g = globalThis as unknown as {
  __rlStores?: Set<Store>;
  __rlTimer?: ReturnType<typeof setInterval>;
};
const stores = (g.__rlStores ??= new Set<Store>());

/** Uma entrada expirou quando o bloqueio acabou (ou, sem bloqueio, quando a janela acabou). */
const isExpired = (e: Entry, now: number) => (e.blockedUntil > 0 ? e.blockedUntil : e.resetAt) <= now;

function sweep(store: Store, now = Date.now()) {
  for (const [key, e] of store) if (isExpired(e, now)) store.delete(key);
}

if (!g.__rlTimer) {
  g.__rlTimer = setInterval(() => stores.forEach((s) => sweep(s)), SWEEP_EVERY_MS);
  g.__rlTimer.unref?.();
}

/**
 * Com o Map cheio, apaga em lote (10% do teto) as entradas mais antigas sem bloqueio ativo. O Map
 * preserva a ordem de inserção; apagar em lote mantém o custo amortizado baixo, em vez de varrer
 * o início do Map a cada requisição.
 */
function makeRoom(store: Store, now: number) {
  if (store.size < MAX_ENTRIES) return;
  let toFree = MAX_ENTRIES / 10;
  for (const [key, e] of store) {
    if (e.blockedUntil > now) continue;
    store.delete(key);
    if (--toFree === 0) return;
  }
  // Tudo bloqueado (improvável: cada bloqueio exige várias falhas reais): cede a mais antiga.
  if (toFree === MAX_ENTRIES / 10) store.delete(store.keys().next().value as string);
}

type Options = {
  /** Número de eventos permitidos na janela. */
  max: number;
  windowMs: number;
  /** Se informado, ao atingir `max` a chave fica bloqueada por este tempo (e o contador zera). */
  blockMs?: number;
};

export function createLimiter({ max, windowMs, blockMs }: Options) {
  const store: Store = new Map();
  stores.add(store);

  return {
    /** Segundos restantes de bloqueio (0 = liberado). */
    retryAfter(key: string | null): number {
      if (key === null) return 0;
      const now = Date.now();
      const e = store.get(key);
      if (!e) return 0;
      if (e.blockedUntil > now) return Math.ceil((e.blockedUntil - now) / 1000);
      if (e.blockedUntil > 0 || e.resetAt <= now) {
        store.delete(key);
        return 0;
      }
      return !blockMs && e.count >= max ? Math.ceil((e.resetAt - now) / 1000) : 0;
    },

    /** Registra um evento para a chave. */
    hit(key: string | null): void {
      if (key === null) return;
      const now = Date.now();
      let e = store.get(key);
      if (!e || (e.blockedUntil === 0 && e.resetAt <= now)) {
        if (!e) makeRoom(store, now);
        e = { count: 0, resetAt: now + windowMs, blockedUntil: 0 };
        store.set(key, e);
      }
      e.count += 1;
      if (blockMs && e.count >= max) e.blockedUntil = now + blockMs;
    },
  };
}

/** Login: 5 falhas por hora por IP → bloqueio de 15 minutos. */
export const loginLimiter = createLimiter({ max: 5, windowMs: HOUR, blockMs: 15 * MINUTE });

/** Cadastro: 3 por hora por IP. */
export const registerLimiter = createLimiter({ max: 3, windowMs: HOUR });

/** Troca de senha: 5 senhas atuais erradas por hora por usuário (chave = id) → bloqueio de 15 minutos. */
export const passwordChangeLimiter = createLimiter({ max: 5, windowMs: HOUR, blockMs: 15 * MINUTE });

/**
 * IP do cliente. Atrás de um proxy que acrescenta o IP ao X-Forwarded-For (nginx, etc.), a
 * ÚLTIMA entrada é a confiável; a primeira pode ser forjada pelo cliente.
 * Em produção, o proxy do host precisa preencher x-real-ip / X-Forwarded-For.
 */
export function clientIp(req: Request): string | null {
  const real = req.headers.get("x-real-ip")?.trim();
  const fwd = req.headers.get("x-forwarded-for")?.split(",");
  const ip = real || fwd?.[fwd.length - 1]?.trim();
  // Só aceita IPv4/IPv6 válidos: evita chaves arbitrárias (e enormes) vindas de cabeçalho forjado.
  // Sem IP válido devolve null e o limitador ignora a requisição (não há balde compartilhado, que
  // permitiria a um atacante bloquear todos os usuários sem IP identificado).
  return ip && isIP(ip) ? ip : null;
}

export const tooManyRequests = (retryAfterSeconds: number) =>
  Response.json(
    { error: "Muitas tentativas. Tente novamente mais tarde." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );

