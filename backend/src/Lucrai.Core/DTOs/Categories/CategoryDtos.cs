namespace Lucrai.Core.DTOs.Categories;

public record CreateCategoryRequest(
    string Name,
    string Color,
    string Icon,
    string Type
);

public record UpdateCategoryRequest(
    string? Name,
    string? Color,
    string? Icon,
    string? Type
);

public record CategoryResponse(
    Guid Id,
    string Name,
    string Color,
    string Icon,
    string Type,
    string Company,
    DateTime CreatedAt,
    int TransactionCount
);

public record RemoveDuplicatesResponse(
    int RemovedCount
);
