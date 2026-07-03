using Lucrai.Core.Enums;

namespace Lucrai.Core.DTOs.Contas;

public record CreateContaRequest(
    string Nome,
    string Email,
    string Telefone,
    string Senha,
    string Empresa,
    string Porte,
    string Faturamento,
    string Origem,
    string Plano
);

public record ContaResponse(
    Guid Id,
    string Nome,
    string Email,
    string Telefone,
    string Empresa,
    string Porte,
    string Faturamento,
    string Origem,
    string Plano,
    DateTime CreatedAt
);
