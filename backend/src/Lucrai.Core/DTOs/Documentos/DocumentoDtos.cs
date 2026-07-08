namespace Lucrai.Core.DTOs.Documentos;

public record DocumentoResponse(
    Guid Id,
    string Company,
    string UserUploadId,
    string NomeArquivoOriginal,
    string TipoArquivo,
    long TamanhoBytes,
    string Status,
    string? TipoDocumentoDetectado,
    decimal? ValorExtraido,
    string? DataExtraida,
    string? FavorecidoExtraido,
    string? EmitenteExtraido,
    string? DescricaoExtraida,
    string? TipoMovimentacaoSugerido,
    string? CategoriaSugeridaId,
    int? ConfiancaExtracao,
    string? ResumoExecutivo,
    string? LancamentoId,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record DocumentoStatsResponse(
    int Total,
    int Aguardando,
    int Processando,
    int ConvertidosMes,
    int RejeitadosMes,
    int EconomiaEstimadaMinutos,
    decimal ValorTotalAutomatizado
);

public record DocumentoUploadResponse(
    DocumentoResponse Documento,
    string? Erro
);
