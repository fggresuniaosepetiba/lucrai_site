namespace Lucrai.Core.DTOs.Signature;

public record SignatureRequest(
    string? ImagemBase64,
    string NomeResponsavel,
    string Cargo,
    bool PermitirUso
);

public record SignatureResponse(
    Guid Id,
    string? ImagemBase64,
    string NomeResponsavel,
    string Cargo,
    bool PermitirUso,
    string Company
);
