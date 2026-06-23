export function validarCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let resto = (sum * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  resto = (sum * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(digits[10])) return false;

  return true;
}

export function validarCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * pesos1[i];
  }
  let resto = sum % 11;
  const dig1 = resto < 2 ? 0 : 11 - resto;
  if (dig1 !== parseInt(digits[12])) return false;

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * pesos2[i];
  }
  resto = sum % 11;
  const dig2 = resto < 2 ? 0 : 11 - resto;
  if (dig2 !== parseInt(digits[13])) return false;

  return true;
}

export function detectarTipoDocumento(documento: string): "cpf" | "cnpj" | null {
  const digits = documento.replace(/\D/g, "");
  if (digits.length === 11) return "cpf";
  if (digits.length === 14) return "cnpj";
  return null;
}

export function validarDocumento(documento: string): { valido: boolean; tipo: "cpf" | "cnpj" | null; mensagem: string } {
  const tipo = detectarTipoDocumento(documento);
  if (!tipo) return { valido: false, tipo: null, mensagem: "Documento inválido. Deve ter 11 (CPF) ou 14 (CNPJ) dígitos." };

  if (tipo === "cpf") {
    const valido = validarCPF(documento);
    return { valido, tipo, mensagem: valido ? "" : "CPF inválido. Verifique o número informado." };
  }

  const valido = validarCNPJ(documento);
  return { valido, tipo, mensagem: valido ? "" : "CNPJ inválido. Verifique o número informado." };
}

export function formatarDocumento(documento: string): string {
  const digits = documento.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return documento;
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
