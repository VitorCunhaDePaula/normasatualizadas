import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Defesa em profundidade: confere a sessão no servidor e volta para "/" se não houver. */
export async function requireSession() {
  await connection();
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  return session;
}
