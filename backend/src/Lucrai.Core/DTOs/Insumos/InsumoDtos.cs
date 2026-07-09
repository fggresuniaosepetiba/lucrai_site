namespace Lucrai.Core.DTOs.Insumos;

public record CreateInsumoRequest(
    string Nome,
    string Categoria,
    string UnidadeMedida,
    decimal QuantidadeComprada,
    decimal ValorPago
);

public record UpdateInsumoRequest(
    string? Nome,
    string? Categoria,
    string? UnidadeMedida,
    decimal? QuantidadeComprada,
    decimal? ValorPago
);

public record InsumoResponse(
    Guid Id,
    string Nome,
    string Categoria,
    string UnidadeMedida,
    decimal QuantidadeComprada,
    decimal ValorPago,
    decimal CustoPorUnidade,
    string Company,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
