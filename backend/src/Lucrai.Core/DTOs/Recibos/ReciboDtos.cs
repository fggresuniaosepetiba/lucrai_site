namespace Lucrai.Core.DTOs.Recibos;

public record CreateReciboRequest(
    string Tipo,
    string Origem,
    string Data,
    decimal Valor,
    string NomePagador,
    string? DocumentoPagador,
    bool SemDocumentoPagador,
    string NomeRecebedor,
    string? DocumentoRecebedor,
    bool SemDocumentoRecebedor,
    string Referente,
    string? FormaPagamento,
    string? Observacoes,
    string? Telefone,
    string? Email,
    string? Cidade,
    string? Estado,
    bool ExibirAssinatura,
    int? ParcelaAtual,
    int? ParcelasTotal,
    Guid? LancamentoId,
    string CriadoPor
);

public record UpdateReciboRequest(
    string? Tipo,
    string? Data,
    decimal? Valor,
    string? NomePagador,
    string? DocumentoPagador,
    bool? SemDocumentoPagador,
    string? NomeRecebedor,
    string? DocumentoRecebedor,
    bool? SemDocumentoRecebedor,
    string? Referente,
    string? FormaPagamento,
    string? Observacoes,
    string? Telefone,
    string? Email,
    string? Cidade,
    string? Estado,
    bool? ExibirAssinatura,
    int? ParcelaAtual,
    int? ParcelasTotal,
    Guid? LancamentoId
);

public record CancelarReciboRequest(string Motivo);

public record CreateAuditRequest(string Action, string Description, string User);

public record CancelamentoInfo(string Motivo, string CanceladoEm, string CanceladoPor);

public record ReciboResponse(
    Guid Id,
    string DisplayId,
    string Company,
    string Numero,
    string Tipo,
    string Origem,
    string Status,
    string Data,
    decimal Valor,
    string ValorPorExtenso,
    string NomePagador,
    string? DocumentoPagador,
    bool SemDocumentoPagador,
    string NomeRecebedor,
    string? DocumentoRecebedor,
    bool SemDocumentoRecebedor,
    string Referente,
    string? FormaPagamento,
    string? Observacoes,
    string? Telefone,
    string? Email,
    string? Cidade,
    string? Estado,
    bool ExibirAssinatura,
    int? ParcelaAtual,
    int? ParcelasTotal,
    Guid? LancamentoId,
    string CriadoPor,
    CancelamentoInfo? Cancelamento,
    DateTime? ExcluidoEm,
    string? ExcluidoPor,
    DateTime? ExpiracaoEm,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
