import Image from "next/image";
import Link from "next/link";
import type { Tabela } from "@/lib/db";

const PREVIEW_ROWS = 3;

function Preview({ tabela }: { tabela: Tabela }) {
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden rounded-md bg-(--app-card) p-2 text-[11px] text-(--app-ink) shadow-[2px_3px_8px_rgba(0,0,0,.2)]">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {tabela.colunas.map((c, i) => (
              <th key={i} className="truncate border-b border-(--app-line) px-1 py-1 text-left font-bold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabela.linhas.slice(0, PREVIEW_ROWS).map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="truncate border-b border-(--app-line) px-1 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-(--app-card) to-transparent" />
    </div>
  );
}

export default function TabelaCard({ tabela }: { tabela: Tabela }) {
  return (
    <Link
      href={`/dashboard/${tabela.slug}`}
      className="flex h-full flex-col gap-3 rounded-[14px] border border-(--app-line) bg-(--app-soft) p-4 transition hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(0,0,0,.14)] focus-visible:-translate-y-[3px] focus-visible:shadow-[0_8px_20px_rgba(0,0,0,.14)]"
    >
      {tabela.capa ? (
        <div className="relative aspect-[5/7] w-full overflow-hidden border border-(--app-line) bg-white shadow-[2px_3px_8px_rgba(0,0,0,.2)]">
          <Image
            src={tabela.capa}
            alt={`Capa de ${tabela.titulo}`}
            fill
            sizes="220px"
            className="object-cover"
            draggable={false}
          />
        </div>
      ) : (
        <Preview tabela={tabela} />
      )}
      <h2 className="font-akkurat-bold text-base">{tabela.titulo}</h2>
      {tabela.descricao && (
        <p className="font-akkurat-light -mt-2 text-[13px] text-(--app-mute)">{tabela.descricao}</p>
      )}
    </Link>
  );
}
