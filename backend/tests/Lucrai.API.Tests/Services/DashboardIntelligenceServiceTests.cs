using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Core.Services;
using Moq;

namespace Lucrai.API.Tests.Services;

public class DashboardIntelligenceServiceTests
{
    private readonly Mock<ITransactionRepository> _transactionRepoMock;
    private readonly Mock<ICashForecastRepository> _forecastRepoMock;
    private readonly DashboardIntelligenceService _service;

    public DashboardIntelligenceServiceTests()
    {
        _transactionRepoMock = new Mock<ITransactionRepository>();
        _forecastRepoMock = new Mock<ICashForecastRepository>();
        _service = new DashboardIntelligenceService(
            _transactionRepoMock.Object,
            _forecastRepoMock.Object
        );
    }

    [Fact]
    public async Task CalcularRunwayAsync_PositiveBalance_ReturnsHealthy()
    {
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 120000m, expenses: 60000m, balance: 30000m));

        var result = await _service.CalcularRunwayAsync("test");

        Assert.Equal(6, result.Meses);
        Assert.Equal("healthy", result.Status);
    }

    [Fact]
    public async Task CalcularRunwayAsync_NegativeBalance_ReturnsZero()
    {
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 0m, expenses: 60000m, balance: -10000m));

        var result = await _service.CalcularRunwayAsync("test");

        Assert.Equal(0, result.Meses);
        Assert.Equal("positive", result.Status);
    }

    [Fact]
    public async Task CalcularRunwayAsync_ZeroExpenses_ReturnsPositive()
    {
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 10000m, expenses: 0m, balance: 5000m));

        var result = await _service.CalcularRunwayAsync("test");

        Assert.Equal(0, result.Meses);
        Assert.Equal("positive", result.Status);
    }

    [Fact]
    public async Task CalcularBreakEvenAsync_Profit_ReturnsAcimaTrue()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 10000 },
            new() { Type = TransactionType.Expense, Value = 4000 },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.CalcularBreakEvenAsync("test");

        Assert.True(result.Acima);
        Assert.Equal(6000, result.Valor);
        Assert.Equal(60, result.PercentualAtingido);
    }

    [Fact]
    public async Task CalcularBreakEvenAsync_Loss_ReturnsAcimaFalse()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 3000 },
            new() { Type = TransactionType.Expense, Value = 5000 },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.CalcularBreakEvenAsync("test");

        Assert.False(result.Acima);
        Assert.Equal(-2000, result.Valor);
    }

    [Fact]
    public async Task CalcularBreakEvenAsync_ZeroRevenue_ReturnsZero()
    {
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<Core.Entities.Transaction>());

        var result = await _service.CalcularBreakEvenAsync("test");

        Assert.False(result.Acima);
        Assert.Equal(0, result.Valor);
    }

    [Fact]
    public async Task CalcularSaudeAsync_Healthy_ReturnsHighScore()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 50000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 30000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 20000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 10000, CategoryId = Guid.NewGuid() },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.CalcularSaudeAsync("test");

        Assert.True(result.Score >= 50);
        Assert.Equal(3, result.SubIndicadores.Count);
    }

    [Fact]
    public async Task CalcularSaudeAsync_Critical_ReturnsLowScore()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 1000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 5000, CategoryId = Guid.NewGuid() },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.CalcularSaudeAsync("test");

        Assert.True(result.Score < 50);
        Assert.Equal("Crítico", result.Label);
    }

    [Fact]
    public async Task CalcularProjecaoAsync_ReturnsProjection()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 10000, Date = DateTime.UtcNow.AddMonths(-1) },
            new() { Type = TransactionType.Expense, Value = 4000, Date = DateTime.UtcNow.AddMonths(-1) },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);
        _forecastRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<Core.Entities.CashForecast>());

        var request = new ProjectionRequest(6, null, null, null, null, null);
        var result = await _service.CalcularProjecaoAsync(request, "test");

        Assert.NotNull(result);
        Assert.Equal(10000, result.Receita);
        Assert.Equal(4000, result.Custos);
        Assert.NotEmpty(result.PontosRealizado);
        Assert.NotEmpty(result.PontosProjetado);
        Assert.Equal(6, result.PontosProjetado.Count);
    }

    [Fact]
    public async Task CalcularSparklineAsync_ReturnsPoints()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 5000, Date = DateTime.UtcNow },
            new() { Type = TransactionType.Expense, Value = 2000, Date = DateTime.UtcNow },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.CalcularSparklineAsync(3, "test");

        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task GerarNotaCFOAsync_ReturnsNote()
    {
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 50000m, expenses: 30000m, balance: 20000m));

        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 25000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 25000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 15000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 15000, CategoryId = Guid.NewGuid() },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.GerarNotaCFOAsync("test");

        Assert.NotNull(result);
        Assert.NotEmpty(result.Resumo);
        Assert.NotEmpty(result.Nota);
    }

    [Fact]
    public async Task GerarAcoesRecomendadasAsync_ReturnsActions()
    {
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 10000m, expenses: 12000m, balance: -2000m));

        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 5000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 5000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 6000, CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 6000, CategoryId = Guid.NewGuid() },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);

        var result = await _service.GerarAcoesRecomendadasAsync("test");

        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.Contains(result, a => a.Prioridade == "alta");
    }
}
