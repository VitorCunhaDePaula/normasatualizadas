import { randomUUID } from "node:crypto";
import { blindIndex, encrypt } from "@/lib/crypto.mjs";
import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";

const globalForDb = globalThis as unknown as { __mysqlPool?: Pool };

export const pool: Pool =
  globalForDb.__mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    charset: "utf8mb4",
  });

if (process.env.NODE_ENV !== "production") globalForDb.__mysqlPool = pool;

export type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

export type FiltroOpcao = { valor: string; rotulo: string };
export type Filtro = {
  id: string;
  rotulo: string;
  tipo: "select" | "radio";
  opcoes: FiltroOpcao[];
};
export type Variantes = {
  filtros: Filtro[];
  tabelas: { selecao: Record<string, string>; colunas: string[]; linhas: string[][] }[];
};

export type Tabela = {
  id: number;
  slug: string;
  titulo: string;
  descricao: string | null;
  colunas: string[];
  linhas: string[][];
  ordem: number;
  capa: string | null;
  variantes: Variantes | null;
  download_url: string | null;
  download_rotulo: string | null;
  nota: string | null;
};

export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<(User & RowDataPacket)[]>(
    "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const [rows] = await pool.execute<(User & RowDataPacket)[]>(
    "SELECT id, name, email, password_hash FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ?? null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

export async function createUser(input: {
  name: string;
  cpf: string;
  crp: string;
  email: string;
  passwordHash: string;
}): Promise<string> {
  const id = randomUUID();
  await pool.execute<ResultSetHeader>(
    "INSERT INTO users (id, name, email, cpf_enc, cpf_hash, crp_enc, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      input.name.trim(),
      input.email.trim().toLowerCase(),
      encrypt(input.cpf),
      blindIndex(input.cpf),
      encrypt(input.crp),
      input.passwordHash,
    ],
  );
  return id;
}

export async function countTabelas(): Promise<number> {
  const [[{ total }]] = await pool.query<({ total: number } & RowDataPacket)[]>(
    "SELECT COUNT(*) AS total FROM tabelas",
  );
  return total;
}

/** Tabelas da mais recente para a mais antiga, `limit` por vez a partir de `offset`. */
export async function listTabelasRange(offset: number, limit: number): Promise<Tabela[]> {
  // LIMIT/OFFSET são inteiros não negativos (forçados aqui), nunca texto do usuário.
  const lim = Math.max(0, Math.floor(limit));
  const off = Math.max(0, Math.floor(offset));
  const [rows] = await pool.query<(Tabela & RowDataPacket)[]>(
    `SELECT id, slug, titulo, descricao, colunas, linhas, ordem, capa, variantes, download_url, download_rotulo, nota FROM tabelas ORDER BY created_at DESC, id DESC LIMIT ${lim} OFFSET ${off}`,
  );
  return rows;
}

export async function getTabelaBySlug(slug: string): Promise<Tabela | null> {
  const [rows] = await pool.execute<(Tabela & RowDataPacket)[]>(
    "SELECT id, slug, titulo, descricao, colunas, linhas, ordem, capa, variantes, download_url, download_rotulo, nota FROM tabelas WHERE slug = ? LIMIT 1",
    [slug],
  );
  return rows[0] ?? null;
}
