namespace Lucrai.Core.DTOs.Documentos;

public record DocumentoResponse(
    Guid Id,
    string Company,
    string UserUploadId,
    string NomeArquivoOriginal,
    string NomeArquivoStorage,
    string PathStorage,
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
    string? DadosExtraidosRaw,
    string? DadosEstruturados,
    string? ObservacoesIa,
    string? ResumoExecutivo,
    string? LancamentoId,
    string? UsuarioConferenciaId,
    string? DataConferencia,
    string? MotivoRejeicao,
    int TentativasProcessamento,
    string? UltimoErro,
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

// Lixeira
public record DocumentoTrashItemResponse(
    Guid Id,
    Guid DocumentoId,
    string NomeArquivoOriginal,
    string TipoArquivo,
    long TamanhoBytes,
    string StatusOriginal,
    string MotivoExclusao,
    string ExcluidoPor,
    DateTime ExcluidoEm,
    DateTime ExpiracaoEm
);

public record ExcluirRequest(string Motivo);

public record CleanupResponse(int Removidos);

// Conferência
public record RejeitarRequest(string Motivo);

public record ConfirmarRequest(
    decimal? ValorExtraido,
    string? DataExtraida,
    string? FavorecidoExtraido,
    string? EmitenteExtraido,
    string? DescricaoExtraida,
    string? TipoMovimentacaoSugerido,
    string? CategoriaSugeridaId
);

// Auditoria
public record DocumentoLogResponse(
    Guid Id,
    Guid? DocumentoId,
    string Acao,
    string Descricao,
    string UsuarioNome,
    DateTime CriadoEm,
    string? Detalhes
);

// Aprendizado
public record DocumentoAprendizadoResponse(
    Guid Id,
    string Chave,
    string? CategoriaId,
    string? TipoMovimentacao,
    int? ConfiancaMinima,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record UpsertAprendizadoRequest(
    string Chave,
    string? CategoriaId,
    string? TipoMovimentacao,
    int? ConfiancaMinima,
    bool? Ativo
);

// Config
public record DocumentoConfigResponse(
    Guid Id,
    string Company,
    bool CategorizacaoAutomatica,
    bool CriarLancamentoAutomatico,
    int DiasRetencaoLixeira
);

public record UpsertConfigRequest(
    bool? CategorizacaoAutomatica,
    bool? CriarLancamentoAutomatico,
    int? DiasRetencaoLixeira
);
