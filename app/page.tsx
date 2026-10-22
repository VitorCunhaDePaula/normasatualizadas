import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

async function RedirectIfLoggedIn() {
  await connection();
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return null;
}

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <AuthForm />
    </main>
  );
}
