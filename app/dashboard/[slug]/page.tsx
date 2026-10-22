import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProtectedContent from "@/components/ProtectedContent";
import TabelaView from "@/components/TabelaView";
import { getTabelaBySlug } from "@/lib/db";
import { requireSession } from "@/lib/session";

async function Conteudo({ params }: { params: PageProps<"/dashboard/[slug]">["params"] }) {
  await requireSession();
  const { slug } = await params;
  const tabela = await getTabelaBySlug(slug);
  if (!tabela) notFound();

  return (
    <section className="rounded-[14px] bg-(--app-card) p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] sm:px-7 sm:py-[26px]">
      <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-lyon-semibold text-2xl leading-[1.1] wrap-break-word sm:text-[30px]">{tabela.titulo}</h1>
          {tabela.descricao && <p className="font-akkurat-light mt-1 text-(--app-mute)">{tabela.descricao}</p>}
        </div>
        {tabela.download_url && (
          <a
            href={tabela.download_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg sm:w-auto border border-(--app-green) bg-(--app-soft) px-4 font-akkurat-bold text-[14.5px] text-(--app-green) transition hover:bg-(--app-mint) hover:text-(--app-ink)"
          >
            <span aria-hidden>⬇</span>
            {tabela.download_rotulo || "Estudos normativos atualizados"}
          </a>
        )}
      </div>

      <TabelaView
        colunas={tabela.colunas}
        linhas={tabela.linhas}
        variantes={tabela.variantes}
        nota={tabela.nota}
      />
    </section>
  );
}

export default function TabelaPage({ params }: PageProps<"/dashboard/[slug]">) {
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
          <Conteudo params={params} />
        </Suspense>
      </ProtectedContent>
    </main>
  );
}
