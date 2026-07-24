using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class Recibo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayId { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Numero { get; set; } = string.Empty;
    public ReciboTipo Tipo { get; set; }
    public ReciboOrigem Origem { get; set; }
    public ReciboStatus Status { get; set; } = ReciboStatus.Emitido;
    public string Data { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string ValorPorExtenso { get; set; } = string.Empty;
    public string NomePagador { get; set; } = string.Empty;
    public string? DocumentoPagador { get; set; }
    public bool SemDocumentoPagador { get; set; }
    public string NomeRecebedor { get; set; } = string.Empty;
    public string? DocumentoRecebedor { get; set; }
    public bool SemDocumentoRecebedor { get; set; }
    public string Referente { get; set; } = string.Empty;
    public string? FormaPagamento { get; set; }
    public string? Observacoes { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Cidade { get; set; }
    public string? Estado { get; set; }
    public bool ExibirAssinatura { get; set; }
    public int? ParcelaAtual { get; set; }
    public int? ParcelasTotal { get; set; }
    public Guid? LancamentoId { get; set; }
    public string CriadoPor { get; set; } = string.Empty;
    public string? Cancelamento { get; set; }
    public DateTime? ExcluidoEm { get; set; }
    public string? ExcluidoPor { get; set; }
    public DateTime? ExpiracaoEm { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
