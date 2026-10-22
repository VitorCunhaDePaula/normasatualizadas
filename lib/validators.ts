export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const digit = ((sum * 10) % 11) % 10;
    if (digit !== Number(cpf[len])) return false;
  }
  return true;
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** Regras de senha (cadastro e troca de senha); o front usa `ok` para o checklist. */
export const passwordRules = [
  { label: `Mínimo de ${PASSWORD_MIN} caracteres`, test: (p: string) => p.length >= PASSWORD_MIN },
  { label: "1 letra maiúscula", test: (p: string) => /\p{Lu}/u.test(p) },
  { label: "1 número", test: (p: string) => /\d/.test(p) },
  { label: "1 caractere especial (ex.: ! @ # $ %)", test: (p: string) => /[^\p{L}\p{N}\s]/u.test(p) },
];

export const isStrongPassword = (p: string) =>
  p.length <= PASSWORD_MAX && passwordRules.every((r) => r.test(p));

export const PASSWORD_POLICY_ERROR = `A senha deve ter no mínimo ${PASSWORD_MIN} caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.`;

/** CRP no formato UF/número, ex.: 06/123456 */
export function isValidCrp(value: string): boolean {
  return /^\d{2}\/\d{4,6}$/.test(value.trim());
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function formatCrp(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
