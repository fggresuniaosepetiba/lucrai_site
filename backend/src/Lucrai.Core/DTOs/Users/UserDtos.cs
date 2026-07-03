namespace Lucrai.Core.DTOs.Users;

public record CreateUserRequest(
    string Name,
    string Email,
    string Password,
    string Role,
    string? Avatar
);

public record UpdateUserRequest(
    string? Name,
    string? Role,
    string? Avatar,
    bool? Active
);

public record UserResponse(
    string Id,
    string Name,
    string Email,
    string Role,
    string Company,
    string? Avatar,
    bool Active,
    DateTime CreatedAt
);
