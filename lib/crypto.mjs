// Criptografia de dados sensíveis (CPF/CRP): AES-256-GCM + HMAC-SHA256 (índice cego).
// .mjs para ser usado tanto pelo app quanto por scripts/seed.mjs.
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

function getKey() {
  const key = Buffer.from(process.env.ENCRYPTION_KEY ?? "", "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY deve ser uma chave de 32 bytes em base64.");
  }
  return key;
}

/** @param {string} plain @returns {string} formato: iv.tag.ciphertext (base64) */
export function encrypt(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

/** @param {string} payload @returns {string} */
export function decrypt(payload) {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Hash determinístico (HMAC) para busca/unicidade sem expor o valor. @param {string} plain */
export function blindIndex(plain) {
  return createHmac("sha256", getKey()).update(plain).digest("hex");
}
