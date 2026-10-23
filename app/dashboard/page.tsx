import { Suspense } from "react";
import ProtectedContent from "@/components/ProtectedContent";
import Pagination from "@/components/Pagination";
import TabelaCard from "@/components/TabelaCard";
import { getTabelasSlice } from "@/lib/tabelas-feed";
import { requireSession } from "@/lib/session";

const POR_PAGINA_GRANDE = 20; // telas a partir de sm
const POR_PAGINA_PEQUENA = 10; // telas menores

type Params = Awaited<PageProps<"/dashboard">["searchParams"]>;

// Cada tamanho de tela pagina por conta própria: `pagina` (telas maiores) e `p` (telas menores).
const numero = (v: Params[string]) => Math.floor(Number(Array.isArray(v) ? v[0] : v)) || 1;
const limitar = (n: number, totalPages: number) => Math.min(Math.max(1, n), totalPages);

function montarHref(param: "pagina" | "p", params: Params) {
  return (alvo: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k !== param && typeof v === "string") q.set(k, v);
    }
    if (alvo > 1) q.set(param, String(alvo));
    const qs = q.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };
}

async function Tabelas({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  await requireSession();
  const params = await searchParams;

  // Mais recente primeiro. Só os itens da página atual de cada tamanho de tela são buscados e renderizados.
  const { total } = await getTabelasSlice(0, 0);
  if (total === 0) {
    return <p className="font-akkurat-light text-(--app-mute)">Nenhuma tabela disponível.</p>;
  }

  const totalGrande = Math.ceil(total / POR_PAGINA_GRANDE);
  const totalPequena = Math.ceil(total / POR_PAGINA_PEQUENA);
  const paginaGrande = limitar(numero(params.pagina), totalGrande);
  const paginaPequena = limitar(numero(params.p), totalPequena);

  const [grande, pequena] = await Promise.all([
    getTabelasSlice((paginaGrande - 1) * POR_PAGINA_GRANDE, POR_PAGINA_GRANDE),
    getTabelasSlice((paginaPequena - 1) * POR_PAGINA_PEQUENA, POR_PAGINA_PEQUENA),
  ]);

  return (
    <>
      {/* Telas maiores: 20 por página. */}
      <div className="hidden sm:block">
        <ul className="grid grid-cols-3 gap-[22px] md:grid-cols-4 lg:max-w-[1100px] lg:grid-cols-5">
          {grande.items.map((t) => (
            <li key={t.id}>
              <TabelaCard tabela={t} />
            </li>
          ))}
        </ul>
        <Pagination page={paginaGrande} totalPages={totalGrande} href={montarHref("pagina", params)} />
      </div>

      {/* Telas pequenas: 10 por página, no máximo 2 por linha; a última linha (1 item) fica centralizada. */}
      <div className="sm:hidden">
        <ul className="flex flex-wrap justify-center gap-4">
          {pequena.items.map((t) => (
            <li key={t.id} className="w-[calc(50%-0.5rem)]">
              <TabelaCard tabela={t} />
            </li>
          ))}
        </ul>
        <Pagination page={paginaPequena} totalPages={totalPequena} href={montarHref("p", params)} />
      </div>
    </>
  );
}

export default function TabelasPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-[1300px] flex-1 px-3.5 pt-5 pb-8 pl-[22px] sm:px-6 sm:pt-7 sm:pb-10 sm:pl-8">
      <ProtectedContent>
        <h1 className="font-lyon-semibold text-2xl leading-[1.1] sm:text-[30px]">Normas disponíveis</h1>
        <p className="font-akkurat-light mt-1 mb-6 text-(--app-mute)">
          Selecione o teste para consultar as normas atualizadas.
        </p>
        <Suspense fallback={null}>
          <Tabelas searchParams={searchParams} />
        </Suspense>
      </ProtectedContent>
    </main>
  );
}
