namespace Lucrai.Core.DTOs.Settings;

public record SettingsRequest(
    string CompanyName,
    string? LogoUrl,
    string PrimaryColor
);

public record SettingsResponse(
    Guid Id,
    string CompanyName,
    string? LogoUrl,
    string PrimaryColor,
    string Company
);
