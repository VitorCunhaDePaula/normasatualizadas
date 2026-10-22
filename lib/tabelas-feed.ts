import { countTabelas, listTabelasRange, type Tabela } from "@/lib/db";

/** Tabelas da mais recente para a mais antiga. Busca só o trecho pedido, nunca a lista inteira. */
export async function getTabelasSlice(offset: number, limit: number): Promise<{ items: Tabela[]; total: number }> {
  const total = await countTabelas();
  const items = limit > 0 ? await listTabelasRange(offset, limit) : [];
  return { items, total };
}
