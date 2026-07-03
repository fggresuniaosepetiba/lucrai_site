namespace Lucrai.Core.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Name, string Email, string Password, string Company);

public record RefreshTokenRequest(string RefreshToken);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    UserInfo User
);

public record UserInfo(
    string Id,
    string Email,
    string Name,
    string Role,
    string Company
);

public record AuthUserResponse(
    string Id,
    string Email,
    string Name,
    string Role,
    string Company,
    string? Avatar,
    bool Active,
    DateTime CreatedAt
);
