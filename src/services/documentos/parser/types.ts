export interface DadosDocumento {
  documento: {
    tipo: string | null;
    numero_nota: string | null;
    serie: string | null;
    chave_acesso: string | null;
    data_emissao: string | null;
    data_saida: string | null;
    protocolo_autorizacao: string | null;
    situacao: string | null;
  };
  emitente: {
    razao_social: string | null;
    nome_fantasia: string | null;
    cnpj: string | null;
    inscricao_estadual: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    telefone: string | null;
  };
  destinatario: {
    razao_social: string | null;
    nome_fantasia: string | null;
    cnpj_cpf: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  };
  financeiro: {
    valor_total: number | null;
    valor_produtos: number | null;
    valor_frete: number | null;
    valor_seguro: number | null;
    desconto: number | null;
    outras_despesas: number | null;
    valor_final: number | null;
  };
  pagamento: {
    forma: string | null;
    quantidade_parcelas: number | null;
    valor_parcelas: number | null;
  };
  produtos: ProdutoExtraido[];
  tributacao: {
    icms: number | null;
    icms_st: number | null;
    pis: number | null;
    cofins: number | null;
    ipi: number | null;
    iss: number | null;
    cfop: string | null;
    ncm: string | null;
    cst: string | null;
  };
  transporte: {
    transportadora: string | null;
    cnpj: string | null;
    frete: number | null;
    volume: string | null;
    peso: string | null;
  };
  informacoes_complementares: {
    observacoes: string | null;
    informacoes_adicionais: string | null;
    mensagens_fiscais: string | null;
  };
  interpretacao_financeira: {
    tipo_movimentacao: string | null;
    categoria_sugerida: string | null;
    descricao_sugerida: string | null;
    resumo_executivo: string | null;
  };
  confianca: number;
  dados_brutos: string | null;
}

export interface ProdutoExtraido {
  codigo: string | null;
  descricao: string | null;
  marca: string | null;
  modelo: string | null;
  quantidade: number | null;
  unidade: string | null;
  valor_unitario: number | null;
  valor_total: number | null;
}

export interface ParserResult {
  dados: DadosDocumento;
  provedor: string;
  tempo_processamento_ms: number;
}

export function criarDadosDocumentoVazio(): DadosDocumento {
  return {
    documento: {
      tipo: null,
      numero_nota: null,
      serie: null,
      chave_acesso: null,
      data_emissao: null,
      data_saida: null,
      protocolo_autorizacao: null,
      situacao: null,
    },
    emitente: {
      razao_social: null,
      nome_fantasia: null,
      cnpj: null,
      inscricao_estadual: null,
      endereco: null,
      cidade: null,
      estado: null,
      cep: null,
      telefone: null,
    },
    destinatario: {
      razao_social: null,
      nome_fantasia: null,
      cnpj_cpf: null,
      endereco: null,
      cidade: null,
      estado: null,
      cep: null,
    },
    financeiro: {
      valor_total: null,
      valor_produtos: null,
      valor_frete: null,
      valor_seguro: null,
      desconto: null,
      outras_despesas: null,
      valor_final: null,
    },
    pagamento: {
      forma: null,
      quantidade_parcelas: null,
      valor_parcelas: null,
    },
    produtos: [],
    tributacao: {
      icms: null,
      icms_st: null,
      pis: null,
      cofins: null,
      ipi: null,
      iss: null,
      cfop: null,
      ncm: null,
      cst: null,
    },
    transporte: {
      transportadora: null,
      cnpj: null,
      frete: null,
      volume: null,
      peso: null,
    },
    informacoes_complementares: {
      observacoes: null,
      informacoes_adicionais: null,
      mensagens_fiscais: null,
    },
    interpretacao_financeira: {
      tipo_movimentacao: null,
      categoria_sugerida: null,
      descricao_sugerida: null,
      resumo_executivo: null,
    },
    confianca: 0,
    dados_brutos: null,
  };
}
