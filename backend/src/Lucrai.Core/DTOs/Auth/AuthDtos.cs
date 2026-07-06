namespace Lucrai.Core.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Name, string Email, string Password, string Company);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

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
    string Company,
    string Plan,
    bool MustChangePassword
);

public record AuthUserResponse(
    string Id,
    string Email,
    string Name,
    string Role,
    string Company,
    string Plan,
    bool MustChangePassword,
    string? Avatar,
    bool Active,
    DateTime CreatedAt
);
