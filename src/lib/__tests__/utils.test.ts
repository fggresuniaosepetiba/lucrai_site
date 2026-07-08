import { describe, it, expect } from "vitest";
import {
  formatCurrency, formatDate, generateId, getNextDisplayId,
  valorPorExtenso, formatCurrencyInput, formatCompactCurrency,
  parseCurrencyInput, parseLocalDate, todayStr,
  validateTransactionDate, validateForecastDate,
} from "../utils";

describe("formatCurrency", () => {
  it("deve formatar valor inteiro", () => {
    expect(formatCurrency(1500)).toBe("R$ 1.500,00");
  });

  it("deve formatar valor com centavos", () => {
    expect(formatCurrency(1500.50)).toBe("R$ 1.500,50");
  });

  it("deve formatar zero", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });

  it("deve formatar valor negativo", () => {
    expect(formatCurrency(-500.99)).toBe("-R$ 500,99");
  });
});

describe("formatDate", () => {
  it("deve formatar data valida a partir de string", () => {
    const result = formatDate("2024-03-15");
    expect(result).toBe("15/03/2024");
  });

  it("deve retornar — para data invalida", () => {
    expect(formatDate("invalido")).toBe("—");
  });
});

describe("generateId", () => {
  it("deve gerar string nao vazia", () => {
    expect(generateId()).toBeTruthy();
  });
});

describe("getNextDisplayId", () => {
  it("deve gerar #001 para tabela vazia", async () => {
    expect(await getNextDisplayId([])).toBe("#001");
  });

  it("deve incrementar a partir do maior ID existente", async () => {
    const table = [
      { displayId: "#005" },
      { displayId: "#003" },
    ];
    expect(await getNextDisplayId(table)).toBe("#006");
  });

  it("deve ignorar IDs sem padrao numerico", async () => {
    const table = [
      { displayId: "ABC" },
      { displayId: "#002" },
    ];
    expect(await getNextDisplayId(table)).toBe("#003");
  });

  it("deve usar prefixo personalizado", async () => {
    expect(await getNextDisplayId([], "FC-")).toBe("FC-001");
  });
});

describe("valorPorExtenso", () => {
  it("deve retornar string vazia para NaN", () => {
    expect(valorPorExtenso(NaN)).toBe("");
  });

  it("deve retornar zero reais para 0", () => {
    expect(valorPorExtenso(0)).toBe("zero reais");
  });

  it("deve escrever 1 real", () => {
    expect(valorPorExtenso(1)).toBe("um real");
  });

  it("deve escrever valor com centavos", () => {
    expect(valorPorExtenso(1.50)).toBe("um real e cinquenta centavos");
  });

  it("deve escrever apenas centavos", () => {
    expect(valorPorExtenso(0.50)).toBe("cinquenta centavos");
  });

  it("deve escrever 1 centavo", () => {
    expect(valorPorExtenso(0.01)).toBe("um centavo");
  });

  it("deve escrever mil reais", () => {
    expect(valorPorExtenso(1000)).toBe("mil reais");
  });

  it("deve escrever milhao", () => {
    const result = valorPorExtenso(1500000);
    expect(result).toContain("milhão");
  });

  it("deve escrever bilhao e milhao", () => {
    const result = valorPorExtenso(1500000000);
    expect(result).toContain("bilhão");
    expect(result).toContain("milhões");
  });

  it("deve escrever 84736.80 corretamente", () => {
    expect(valorPorExtenso(84736.80)).toBe("oitenta e quatro mil, setecentos e trinta e seis reais e oitenta centavos");
  });
});

describe("formatCurrencyInput", () => {
  it("deve formatar digitos como moeda", () => {
    expect(formatCurrencyInput("150050")).toBe("1.500,50");
  });

  it("deve retornar vazio para string vazia", () => {
    expect(formatCurrencyInput("")).toBe("");
  });

  it("deve ignorar caracteres nao numericos", () => {
    expect(formatCurrencyInput("1a2b3c")).toBe("1,23");
  });

  it("deve formatar centavos apenas", () => {
    expect(formatCurrencyInput("50")).toBe("0,50");
  });
});

describe("formatCompactCurrency", () => {
  it("deve retornar completo para valores abaixo de 1 milhao", () => {
    const result = formatCompactCurrency(5000);
    expect(result.display).toBe("R$ 5.000,00");
    expect(result.full).toBe("R$ 5.000,00");
  });

  it("deve abreviar milhao", () => {
    const result = formatCompactCurrency(2500000);
    expect(result.display).toContain("Mi");
    expect(result.full).toBe("R$ 2.500.000,00");
  });

  it("deve abreviar bilhao", () => {
    const result = formatCompactCurrency(3500000000);
    expect(result.display).toContain("Bi");
  });

  it("deve mostrar sinal negativo", () => {
    const result = formatCompactCurrency(-5000000);
    expect(result.display).toContain("-");
  });
});

describe("parseCurrencyInput", () => {
  it("deve converter string formatada para numero", () => {
    expect(parseCurrencyInput("1.500,50")).toBe(1500.50);
  });

  it("deve retornar 0 para string vazia", () => {
    expect(parseCurrencyInput("")).toBe(0);
  });
});

describe("parseLocalDate", () => {
  it("deve criar Date a partir de string ISO", () => {
    const d = parseLocalDate("2024-03-15");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(15);
  });

  it("deve ignorar porcao de horario", () => {
    const d = parseLocalDate("2024-03-15T10:30:00Z");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });
});

describe("todayStr", () => {
  it("deve retornar string no formato YYYY-MM-DD", () => {
    const result = todayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("validateTransactionDate", () => {
  it("deve aceitar data passada valida", () => {
    expect(validateTransactionDate("2024-01-15").valid).toBe(true);
  });

  it("deve rejeitar data futura", () => {
    const result = validateTransactionDate("2099-12-31");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("futuros");
  });

  it("deve rejeitar data anterior a 1900", () => {
    const result = validateTransactionDate("1899-12-31");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("período permitido");
  });

  it("deve rejeitar string vazia", () => {
    expect(validateTransactionDate("").valid).toBe(false);
  });

  it("deve rejeitar formato invalido", () => {
    expect(validateTransactionDate("31/12/2024").valid).toBe(false);
  });
});

describe("validateForecastDate", () => {
  it("deve aceitar data futura valida (dentro de 10 anos)", () => {
    const result = validateForecastDate("2027-06-15");
    expect(result.valid).toBe(true);
  });

  it("deve rejeitar data passada", () => {
    const result = validateForecastDate("2024-01-15");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("anterior");
  });

  it("deve rejeitar data muito distante (>10 anos)", () => {
    const result = validateForecastDate("2099-01-01");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("excede");
  });
});
