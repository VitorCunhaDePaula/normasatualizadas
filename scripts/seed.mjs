// Popula o banco: usuário de teste + tabelas de db/seed/*.json (idempotente).
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { blindIndex, encrypt } from "../lib/crypto.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(root, ".env"));
} catch {
  // sem .env: usa as variáveis já presentes no ambiente
}

const TEST_USER = { name: "Usuário de Teste", cpf: "52998224725", crp: "00/00000", email: "teste@normas.local", password: "Teste@123" };

// Confere o formato de db/seed/*.json (ARCHITECTURE.md §6) antes de gravar.
function validateTabela(t, file) {
  const fail = (msg) => {
    throw new Error(`${file}: ${msg}`);
  };
  const checkGrid = (colunas, linhas, where) => {
    if (!Array.isArray(colunas) || colunas.length === 0) fail(`${where}: "colunas" deve ser uma lista não vazia`);
    if (!Array.isArray(linhas)) fail(`${where}: "linhas" deve ser uma lista`);
    if (!colunas.every((c) => typeof c === "string")) fail(`${where}: colunas devem ser strings`);
    linhas.forEach((row, i) => {
      if (!Array.isArray(row) || row.length !== colunas.length) {
        fail(`${where}: linha ${i + 1} tem ${row?.length} células, esperado ${colunas.length}`);
      }
      if (!row.every((c) => typeof c === "string")) fail(`${where}: linha ${i + 1} tem célula que não é string`);
    });
  };

  if (!t.slug || !/^[a-z0-9-]+$/.test(t.slug)) fail('"slug" obrigatório (minúsculas, números e hífen)');
  if (!t.titulo) fail('"titulo" obrigatório');
  checkGrid(t.colunas, t.linhas, "tabela");

  if (t.variantes) {
    const { filtros, tabelas } = t.variantes;
    if (!Array.isArray(filtros) || !Array.isArray(tabelas)) fail('"variantes" precisa de "filtros" e "tabelas"');
    const ids = new Set(filtros.map((f) => f.id));
    tabelas.forEach((v, i) => {
      for (const k of Object.keys(v.selecao ?? {})) {
        if (!ids.has(k)) fail(`variante ${i + 1}: filtro "${k}" não existe em "filtros"`);
      }
      checkGrid(v.colunas, v.linhas, `variante ${i + 1}`);
    });
  }
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  const hash = await bcrypt.hash(TEST_USER.password, 12);
  await conn.execute(
    `INSERT INTO users (id, name, email, cpf_enc, cpf_hash, crp_enc, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), cpf_enc = VALUES(cpf_enc), crp_enc = VALUES(crp_enc), password_hash = VALUES(password_hash)`,
    [
      randomUUID(),
      TEST_USER.name,
      TEST_USER.email,
      encrypt(TEST_USER.cpf),
      blindIndex(TEST_USER.cpf),
      encrypt(TEST_USER.crp),
      hash,
    ],
  );
  console.log(`usuário de teste: ${TEST_USER.email}`);

  const dir = path.join(root, "db", "seed");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  for (const file of files) {
    const t = JSON.parse(await readFile(path.join(dir, file), "utf8"));
    validateTabela(t, file);
    await conn.execute(
      `INSERT INTO tabelas (slug, titulo, descricao, colunas, linhas, ordem, capa, variantes, download_url, download_rotulo, nota) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), descricao = VALUES(descricao),
         colunas = VALUES(colunas), linhas = VALUES(linhas), ordem = VALUES(ordem), capa = VALUES(capa), variantes = VALUES(variantes), download_url = VALUES(download_url),
         download_rotulo = VALUES(download_rotulo), nota = VALUES(nota)`,
      [t.slug, t.titulo, t.descricao ?? null, JSON.stringify(t.colunas), JSON.stringify(t.linhas), t.ordem ?? 0, t.capa ?? null,
        t.variantes ? JSON.stringify(t.variantes) : null,
        t.download_url ?? null,
        t.download_rotulo ?? null,
        t.nota ?? null,
      ],
    );
    console.log(`tabela: ${t.slug}`);
  }
} finally {
  await conn.end();
}
