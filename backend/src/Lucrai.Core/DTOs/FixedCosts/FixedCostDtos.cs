using System.Text.Json;

namespace Lucrai.Core.DTOs.FixedCosts;

public record CustomCostItem(
    string Id,
    string Name,
    decimal Value
);

public record FixedCostRequest(
    decimal Aluguel,
    decimal Energia,
    decimal Agua,
    decimal Internet,
    decimal Contador,
    decimal ProLabore,
    decimal Softwares,
    decimal Telefone,
    decimal Marketing,
    decimal Limpeza,
    decimal Outros,
    List<CustomCostItem>? CustomCosts
)
{
    public decimal CalculateTotal()
    {
        var customSum = CustomCosts?.Sum(c => c.Value) ?? 0;
        return Aluguel + Energia + Agua + Internet + Contador + ProLabore + Softwares + Telefone + Marketing + Limpeza + Outros + customSum;
    }

    public string SerializeCustomCosts()
    {
        return CustomCosts != null ? JsonSerializer.Serialize(CustomCosts) : "[]";
    }

    public static List<CustomCostItem> DeserializeCustomCosts(string? json)
    {
        if (string.IsNullOrEmpty(json) || json == "[]") return [];
        try { return JsonSerializer.Deserialize<List<CustomCostItem>>(json) ?? []; }
        catch { return []; }
    }
}

public record FixedCostResponse(
    Guid Id,
    decimal Aluguel,
    decimal Energia,
    decimal Agua,
    decimal Internet,
    decimal Contador,
    decimal ProLabore,
    decimal Softwares,
    decimal Telefone,
    decimal Marketing,
    decimal Limpeza,
    decimal Outros,
    List<CustomCostItem> CustomCosts,
    decimal Total,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string Company
);
