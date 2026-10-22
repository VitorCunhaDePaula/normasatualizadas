import Link from "next/link";

const itemCls =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-akkurat-bold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--app-green)";
const idleCls = "border-(--app-line) bg-(--app-card) text-(--app-green) hover:bg-(--app-soft)";
const activeCls = "border-(--app-green) bg-(--app-green) text-(--app-card)";
const disabledCls = "border-(--app-line) text-(--app-mute) opacity-50";

/** Páginas exibidas: primeira, última e vizinhas da atual; lacunas viram null (reticências). */
function pagesToShow(current: number, total: number): (number | null)[] {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? [null, p] : [p]));
}

export default function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  /** Monta o link da página `p` (mantém os outros parâmetros da URL). */
  href: (p: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${itemCls} ${idleCls}`}>
          Anterior
        </Link>
      ) : (
        <span aria-disabled className={`${itemCls} ${disabledCls}`}>
          Anterior
        </span>
      )}

      <span className="font-akkurat-light px-2 text-sm text-(--app-mute) sm:hidden">
        Página {page} de {totalPages}
      </span>
      <ul className="hidden items-center gap-2 sm:flex">
        {pagesToShow(page, totalPages).map((p, i) => (
          <li key={p ?? `gap-${i}`}>
            {p === null ? (
              <span aria-hidden className="px-1 text-(--app-mute)">
                …
              </span>
            ) : (
              <Link
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Página ${p}`}
                className={`${itemCls} ${p === page ? activeCls : idleCls}`}
              >
                {p}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${itemCls} ${idleCls}`}>
          Próxima
        </Link>
      ) : (
        <span aria-disabled className={`${itemCls} ${disabledCls}`}>
          Próxima
        </span>
      )}
    </nav>
  );
}
