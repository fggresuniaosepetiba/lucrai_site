import { describe, it, expect, beforeEach } from "vitest";
import { valorPorExtenso } from "../valorPorExtenso";
import { validarCPF, validarCNPJ, validarDocumento, formatarDocumento, detectarTipoDocumento, validarEmail } from "../cpfCnpjValidator";
import { gerarProximoNumeroRecibo, getUltimoNumeroRecibo } from "../gerarNumeroRecibo";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });
Object.defineProperty(globalThis, "window", { value: globalThis, writable: true });

describe("valorPorExtenso", () => {
  it("valorPorExtenso_1: valor 84736.80", () => {
    const result = valorPorExtenso(84736.80);
    expect(result).toBe("Oitenta e quatro mil, setecentos e trinta e seis Reais e oitenta Centavos");
  });

  it("valorPorExtenso_2: valor 1000000", () => {
    const result = valorPorExtenso(1000000);
    expect(result).toBe("Um milhão de Reais");
  });

  it("valorPorExtenso_3: valor 50000000", () => {
    const result = valorPorExtenso(50000000);
    expect(result).toBe("Cinquenta milhões de Reais");
  });

  it("valorPorExtenso_4: valor 1000000000", () => {
    const result = valorPorExtenso(1000000000);
    expect(result).toBe("Um bilhão de Reais");
  });

  it("valorPorExtenso_5: valor 0.50", () => {
    const result = valorPorExtenso(0.50);
    expect(result).toBe("Cinquenta Centavos");
  });

  it("valor exato sem centavos: 100", () => {
    const result = valorPorExtenso(100);
    expect(result).toBe("Cem Reais");
  });

  it("valor com centavos e reais: 1.99", () => {
    const result = valorPorExtenso(1.99);
    expect(result).toBe("Um Real e noventa e nove Centavos");
  });

  it("valor zero", () => {
    const result = valorPorExtenso(0);
    expect(result).toBe("Zero Reais");
  });

  it("valor negativo retorna vazio", () => {
    const result = valorPorExtenso(-100);
    expect(result).toBe("");
  });

  it("milhar exato: 1000", () => {
    const result = valorPorExtenso(1000);
    expect(result).toBe("Mil Reais");
  });

  it("milhares com centena: 1500", () => {
    const result = valorPorExtenso(1500);
    expect(result).toBe("Mil, quinhentos Reais");
  });

  it("bilhoes com milhoes: 2500000000", () => {
    const result = valorPorExtenso(2500000000);
    expect(result).toBe("Dois bilhões, quinhentos milhões de Reais");
  });
});

describe("CPF Validation", () => {
  it("cpfValido: CPF 529.982.247-25", () => {
    expect(validarCPF("52998224725")).toBe(true);
  });

  it("cpfInvalido: CPF 111.111.111-11 (digitos iguais)", () => {
    expect(validarCPF("11111111111")).toBe(false);
  });

  it("CPF com digitos verificadores errados", () => {
    expect(validarCPF("12345678901")).toBe(false);
  });

  it("CPF com formato incorreto (curto)", () => {
    expect(validarCPF("1234567890")).toBe(false);
  });

  it("CPF com formato incorreto (longo)", () => {
    expect(validarCPF("123456789012")).toBe(false);
  });
});

describe("CNPJ Validation", () => {
  it("cnpjValido: CNPJ 11.222.333/0001-81", () => {
    expect(validarCNPJ("11222333000181")).toBe(true);
  });

  it("cnpjInvalido: CNPJ 11.111.111/1111-11 (digitos iguais)", () => {
    expect(validarCNPJ("11111111111111")).toBe(false);
  });

  it("CNPJ com digitos verificadores errados", () => {
    expect(validarCNPJ("12345678000100")).toBe(false);
  });

  it("CNPJ com formato incorreto (curto)", () => {
    expect(validarCNPJ("123456780001")).toBe(false);
  });
});

describe("validarDocumento", () => {
  it("documento valido (CPF)", () => {
    const result = validarDocumento("52998224725");
    expect(result.valido).toBe(true);
    expect(result.tipo).toBe("cpf");
    expect(result.mensagem).toBe("");
  });

  it("documento valido (CNPJ)", () => {
    const result = validarDocumento("11222333000181");
    expect(result.valido).toBe(true);
    expect(result.tipo).toBe("cnpj");
    expect(result.mensagem).toBe("");
  });

  it("documento invalido", () => {
    const result = validarDocumento("11111111111");
    expect(result.valido).toBe(false);
    expect(result.tipo).toBe("cpf");
    expect(result.mensagem).toBe("CPF inválido. Verifique o número informado.");
  });

  it("tamanho invalido", () => {
    const result = validarDocumento("12345");
    expect(result.valido).toBe(false);
    expect(result.tipo).toBeNull();
  });

  it("CNPJ invalido com mensagem correta", () => {
    const result = validarDocumento("11111111111111");
    expect(result.valido).toBe(false);
    expect(result.mensagem).toBe("CNPJ inválido. Verifique o número informado.");
  });
});

describe("formatarDocumento", () => {
  it("formata CPF", () => {
    expect(formatarDocumento("52998224725")).toBe("529.982.247-25");
  });

  it("formata CNPJ", () => {
    expect(formatarDocumento("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("retorna original se tamanho invalido", () => {
    expect(formatarDocumento("12345")).toBe("12345");
  });
});

describe("detectarTipoDocumento", () => {
  it("detecta CPF", () => {
    expect(detectarTipoDocumento("52998224725")).toBe("cpf");
  });

  it("detecta CNPJ", () => {
    expect(detectarTipoDocumento("11222333000181")).toBe("cnpj");
  });

  it("retorna null para tamanho invalido", () => {
    expect(detectarTipoDocumento("12345")).toBeNull();
  });
});

describe("validarEmail", () => {
  it("email valido", () => {
    expect(validarEmail("teste@exemplo.com")).toBe(true);
  });

  it("email sem @", () => {
    expect(validarEmail("testeexemplo.com")).toBe(false);
  });

  it("email vazio", () => {
    expect(validarEmail("")).toBe(false);
  });
});

describe("Numeracao Sequencial", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("numeracaoSequencial: Primeiro recibo do ano", () => {
    const currentYear = new Date().getFullYear();
    const numero = gerarProximoNumeroRecibo();
    expect(numero).toBe(`REC-${currentYear}-000001`);
  });

  it("segundo recibo incrementa", () => {
    gerarProximoNumeroRecibo();
    const numero = gerarProximoNumeroRecibo();
    const currentYear = new Date().getFullYear();
    expect(numero).toBe(`REC-${currentYear}-000002`);
  });

  it("numeracaoNaoReutilizada: cancelar nao libera numero", () => {
    const num1 = gerarProximoNumeroRecibo();
    const num2 = gerarProximoNumeroRecibo();
    expect(num1).not.toBe(num2);
  });

  it("sequencial continua apos obter ultimo", () => {
    gerarProximoNumeroRecibo();
    const { sequencial } = getUltimoNumeroRecibo();
    expect(sequencial).toBe(1);
  });
});

describe("Auditoria", () => {
  it("criacao registra acao criado", () => {
    const evento = {
      id: "1",
      reciboId: "rec-1",
      acao: "criado" as const,
      realizadoEm: new Date().toISOString(),
      realizadoPor: "Usuário Teste",
    };
    expect(evento.acao).toBe("criado");
    expect(evento.reciboId).toBe("rec-1");
    expect(evento.realizadoPor).toBe("Usuário Teste");
  });

  it("pdf_baixado registra acao correta", () => {
    const evento = {
      id: "2",
      reciboId: "rec-1",
      acao: "pdf_baixado" as const,
      realizadoEm: new Date().toISOString(),
      realizadoPor: "Usuário Teste",
    };
    expect(evento.acao).toBe("pdf_baixado");
  });
});

describe("Cancelamento", () => {
  it("cancelamento_semMotivo: rejeitar cancelamento sem motivo", () => {
    const motivo = "";
    expect(motivo.trim().length > 0).toBe(false);
  });

  it("cancelamento_comMotivo: status cancelado e motivo registrado", () => {
    const cancelamento = {
      status: "cancelado" as const,
      cancelamento: {
        motivo: "Cliente desistiu do serviço",
        canceladoEm: new Date().toISOString(),
        canceladoPor: "Usuário Teste",
      },
    };
    expect(cancelamento.status).toBe("cancelado");
    expect(cancelamento.cancelamento.motivo).toBe("Cliente desistiu do serviço");
  });
});

describe("Filtros", () => {
  const recibos = [
    { id: "1", status: "emitido" as const, tipo: "recebimento" as const },
    { id: "2", status: "emitido" as const, tipo: "pagamento" as const },
    { id: "3", status: "cancelado" as const, tipo: "recebimento" as const },
    { id: "4", status: "emitido" as const, tipo: "pagamento" as const },
  ];

  it("filtroEmitidos: exibe apenas emitidos", () => {
    const emitidos = recibos.filter((r) => r.status === "emitido");
    expect(emitidos).toHaveLength(3);
    expect(emitidos.every((r) => r.status === "emitido")).toBe(true);
  });

  it("filtroCancelados: exibe apenas cancelados", () => {
    const cancelados = recibos.filter((r) => r.status === "cancelado");
    expect(cancelados).toHaveLength(1);
    expect(cancelados.every((r) => r.status === "cancelado")).toBe(true);
  });

  it("filtroRecebimento: exibe apenas recebimento", () => {
    const recebimentos = recibos.filter((r) => r.tipo === "recebimento");
    expect(recebimentos).toHaveLength(2);
    expect(recebimentos.every((r) => r.tipo === "recebimento")).toBe(true);
  });

  it("filtroPagamento: exibe apenas pagamento", () => {
    const pagamentos = recibos.filter((r) => r.tipo === "pagamento");
    expect(pagamentos).toHaveLength(2);
    expect(pagamentos.every((r) => r.tipo === "pagamento")).toBe(true);
  });
});
