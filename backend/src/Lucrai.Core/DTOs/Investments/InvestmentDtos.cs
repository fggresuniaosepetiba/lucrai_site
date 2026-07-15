namespace Lucrai.Core.DTOs.Investments;

public record CreateInvestmentRequest(
    string Name,
    string? Description,
    string Type,
    decimal InvestedAmount,
    decimal? CurrentValue,
    DateTime StartDate,
    DateTime? EndDate,
    decimal? ExpectedROI,
    decimal? ActualROI,
    decimal? IRR,
    decimal? NPV,
    int? PaybackMonths,
    string? Notes
);

public record UpdateInvestmentRequest(
    string Name,
    string? Description,
    string Type,
    decimal InvestedAmount,
    decimal? CurrentValue,
    DateTime StartDate,
    DateTime? EndDate,
    decimal? ExpectedROI,
    decimal? ActualROI,
    decimal? IRR,
    decimal? NPV,
    int? PaybackMonths,
    string Status,
    string? Notes
);

public record InvestmentResponse(
    Guid Id,
    string DisplayId,
    string Name,
    string? Description,
    string Type,
    decimal InvestedAmount,
    decimal? CurrentValue,
    DateTime StartDate,
    DateTime? EndDate,
    decimal? ExpectedROI,
    decimal? ActualROI,
    decimal? IRR,
    decimal? NPV,
    int? PaybackMonths,
    string Status,
    string? Notes,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record InvestmentSummaryResponse(
    decimal TotalInvestido,
    int ProjetosAtivos,
    decimal? ROIMedio,
    decimal? CapEx
);
