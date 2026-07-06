using Lucrai.Core.DTOs.Dashboard;

namespace Lucrai.Core.Interfaces;

public interface IDashboardIntelligenceService
{
    Task<ProjectionResponse> CalcularProjecaoAsync(ProjectionRequest request, string? company);
    Task<RunwayResponse> CalcularRunwayAsync(string? company);
    Task<BreakEvenResponse> CalcularBreakEvenAsync(string? company);
    Task<HealthResponse> CalcularSaudeAsync(string? company);
    Task<List<SparklinePoint>> CalcularSparklineAsync(int months, string? company);
    Task<NotaCFOResponse> GerarNotaCFOAsync(string? company);
    Task<List<AcaoRecomendada>> GerarAcoesRecomendadasAsync(string? company);
}
