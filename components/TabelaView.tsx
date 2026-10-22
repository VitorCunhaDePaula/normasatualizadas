"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Variantes } from "@/lib/db";

type Props = {
  colunas: string[];
  linhas: string[][];
  variantes: Variantes | null;
  nota?: string | null;
};

const controlCls =
  "font-akkurat-regular w-full h-11 rounded-md border border-(--app-line) bg-(--app-card) px-3 text-base text-(--app-ink) outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--app-green)";
const labelCls = "font-akkurat-light mb-1 block p-0 text-[13px] text-(--app-mute)";

// Linha de confiabilidade (Ω/α): mesma grade das demais linhas, só o texto fica em vermelho.
const isOmega = (row: string[]) => row[0]?.startsWith("Ω");

/**
 * Filtros (quando há `variantes`) + tabela com visualização protegida: só a linha
 * sob o cursor (ou tocada/selecionada pelas setas) fica nítida; as demais ficam desfocadas.
 */
export default function TabelaView({ colunas, linhas, variantes, nota }: Props) {
  const filtros = variantes?.filtros ?? [];
  const [selecao, setSelecao] = useState<Record<string, string>>(() =>
    Object.fromEntries(filtros.map((f) => [f.id, f.opcoes[0]?.valor ?? ""])),
  );
  const [active, setActive] = useState<number | null>(null);
  const [moreRight, setMoreRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const atual = useMemo(() => {
    if (!variantes) return { colunas, linhas };
    return (
      variantes.tabelas.find((t) =>
        Object.entries(t.selecao).every(([k, v]) => selecao[k] === v),
      ) ?? null
    );
  }, [variantes, selecao, colunas, linhas]);

  const updateShadow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setMoreRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateShadow();
    window.addEventListener("resize", updateShadow);
    return () => window.removeEventListener("resize", updateShadow);
  }, [updateShadow, atual]);

  function escolher(id: string, valor: string) {
    setSelecao((s) => ({ ...s, [id]: valor }));
    setActive(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!atual || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    e.preventDefault();
    const next = Math.min(
      atual.linhas.length - 1,
      Math.max(0, (active ?? -1) + (e.key === "ArrowDown" ? 1 : -1)),
    );
    setActive(next);
    scrollRef.current?.querySelectorAll("tbody tr")[next]?.scrollIntoView({ block: "nearest" });
  }

  // Selects e radios numa linha só (2fr / 1.2fr / auto, como no design) a partir de 860px.
  let selectIdx = 0;
  const cols = filtros
    .map((f) => (f.tipo === "radio" ? "auto" : `${selectIdx++ === 0 ? 2 : 1.2}fr`))
    .join(" ");

  return (
    <>
      {filtros.length > 0 && (
        <div
          className="mb-5 grid items-end gap-[18px] min-[860px]:grid-cols-(--cols)"
          style={{ "--cols": cols } as CSSProperties}
        >
          {filtros.map((f) =>
            f.tipo === "select" ? (
              <div key={f.id}>
                <label htmlFor={`filtro-${f.id}`} className={labelCls}>
                  {f.rotulo}
                </label>
                <select
                  id={`filtro-${f.id}`}
                  value={selecao[f.id]}
                  onChange={(e) => escolher(f.id, e.target.value)}
                  className={controlCls}
                >
                  {f.opcoes.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <fieldset key={f.id} className="m-0 min-w-0 border-0 p-0">
                <legend className={labelCls}>{f.rotulo}</legend>
                <div className="flex min-h-11 flex-wrap items-center gap-x-3.5">
                  {f.opcoes.map((o) => (
                    <label
                      key={o.valor}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm text-(--app-ink)"
                    >
                      <input
                        type="radio"
                        name={`filtro-${f.id}`}
                        value={o.valor}
                        checked={selecao[f.id] === o.valor}
                        onChange={() => escolher(f.id, o.valor)}
                        className="accent-(--app-green)"
                      />
                      {o.rotulo}
                    </label>
                  ))}
                </div>
              </fieldset>
            ),
          )}
        </div>
      )}

      <div className="grid items-start gap-5 min-[860px]:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
          {atual ? (
            <div className="relative overflow-hidden rounded-[10px] bg-(--app-navy)">
              <div
                ref={scrollRef}
                tabIndex={0}
                role="region"
                aria-label="Tabela de normas. Passe o mouse ou use as setas para revelar uma linha."
                onScroll={updateShadow}
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                onKeyDown={onKeyDown}
                className="max-h-[70vh] overflow-auto rounded-[10px] select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-green)"
              >
                <table className="font-akkurat-regular w-full min-w-max border-separate border-spacing-y-[3px] text-center text-[#e9f0fa] tabular-nums">
                  <thead>
                    <tr>
                      {atual.colunas.map((c, i) => (
                        <th
                          key={i}
                          scope="col"
                          className={`sticky top-0 bg-(--app-navy2) px-3 py-3.5 font-akkurat-bold text-[15px] leading-tight ${
                            i < 2 ? "text-left" : ""
                          } ${i === 0 ? "left-0 z-20" : "z-10"}`}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {atual.linhas.map((row, r) => {
                      const on = active === r;
                      const omega = isOmega(row);
                      return (
                        <tr key={r} onMouseEnter={() => setActive(r)} onClick={() => setActive(r)}>
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className={`h-[38px] px-3 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg ${
                                c < 2 ? "text-left" : ""
                              } ${c === 0 ? "sticky left-0 z-[1]" : ""} ${
                                on
                                  ? `bg-white font-semibold ${omega ? "text-[#c0172b]" : "text-(--app-navy)"}`
                                  : `bg-(--app-navy) ${omega ? "font-semibold text-[#ff9b9b]" : ""}`
                              }`}
                            >
                              <span
                                className={`inline-block transition duration-75 ${
                                  on ? "" : "opacity-55 blur-[4.5px]"
                                }`}
                              >
                                {cell}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-(--app-navy) to-transparent transition-opacity ${
                  moreRight ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ) : (
            <p className="rounded-[10px] bg-(--app-navy) p-6 text-[#e9f0fa]">
              Sem dados para esta combinação.
            </p>
          )}
          {nota && <p className="mt-3 text-[12.5px] text-(--app-mute)">{nota}</p>}
        </div>

        <aside className="font-akkurat-light rounded-[10px] bg-(--app-info) p-[18px] text-[13.5px]">
          <h2 className="font-akkurat-bold mb-2 text-[15px]">Visualização protegida</h2>
          <p className="mb-2.5">As normas são exibidas apenas na linha selecionada.</p>
          <p>
            Para consultar outra linha, posicione o cursor do mouse sobre a tabela (ou toque na
            linha, no celular).
          </p>
        </aside>
      </div>
    </>
  );
}
