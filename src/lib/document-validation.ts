export function isValidCPF(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // 000.000.000-00, 111.111.111-11 etc.

  const nums = digits.split("").map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += nums[i] * (10 - i);
  let check1 = 11 - (sum % 11);
  if (check1 >= 10) check1 = 0;
  if (check1 !== nums[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += nums[i] * (11 - i);
  let check2 = 11 - (sum % 11);
  if (check2 >= 10) check2 = 0;
  if (check2 !== nums[10]) return false;

  return true;
}

// RG não tem um dígito verificador padronizado nacionalmente (cada estado
// emite de um jeito) — só dá pra checar se tem a quantidade de dígitos
// esperada e se não é uma sequência óbvia (tipo tudo igual).
export function isValidRG(digits: string): boolean {
  if (digits.length !== 9) return false;
  if (/^(\d)\1{8}$/.test(digits)) return false;
  return true;
}

export function isValidDocumento(digits: string, tipo: "CPF" | "RG"): boolean {
  return tipo === "CPF" ? isValidCPF(digits) : isValidRG(digits);
}
