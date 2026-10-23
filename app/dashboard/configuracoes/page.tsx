import { Suspense } from "react";
import Link from "next/link";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ProtectedContent from "@/components/ProtectedContent";
import { requireSession } from "@/lib/session";

async function Conta() {
  const { user } = await requireSession();

  return (
    <section className="rounded-[14px] border border-(--app-line) bg-(--app-card) p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] sm:px-7 sm:py-[26px]">
      <h1 className="font-lyon-semibold text-2xl leading-[1.1] sm:text-[30px]">Configurações</h1>
      <dl className="mt-5 grid gap-4 sm:grid-cols-[max-content_1fr] sm:gap-x-8">
        <dt className="font-akkurat-light text-sm text-(--app-mute)">Nome</dt>
        <dd className="font-akkurat-bold min-w-0 wrap-break-word">{user.name}</dd>
        <dt className="font-akkurat-light text-sm text-(--app-mute)">E-mail</dt>
        <dd className="font-akkurat-bold min-w-0 wrap-break-word">{user.email}</dd>
      </dl>

      <hr className="my-6 border-(--app-line)" />
      <h2 className="font-lyon-semibold text-lg">Alterar senha</h2>
      <ChangePasswordForm />
    </section>
  );
}

export default function ConfiguracoesPage() {
  return (
    <main className="mx-auto w-full max-w-[1300px] flex-1 px-3.5 pt-5 pb-8 pl-[22px] sm:px-6 sm:pt-7 sm:pb-10 sm:pl-8">
      <Link
        href="/dashboard"
        className="mb-3.5 inline-flex min-h-11 items-center font-akkurat-bold text-sm text-(--app-green) hover:underline"
      >
        ← Voltar aos testes
      </Link>
      <ProtectedContent>
        <Suspense fallback={null}>
          <Conta />
        </Suspense>
      </ProtectedContent>
    </main>
  );
}
