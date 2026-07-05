using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Core.Services;
using Moq;

namespace Lucrai.API.Tests.Services;

public class AlertasServiceTests
{
    private readonly Mock<ITransactionRepository> _transactionRepoMock;
    private readonly Mock<ICashForecastRepository> _forecastRepoMock;
    private readonly Mock<IDismissedAlertRepository> _dismissedRepoMock;
    private readonly AlertasService _service;

    public AlertasServiceTests()
    {
        _transactionRepoMock = new Mock<ITransactionRepository>();
        _forecastRepoMock = new Mock<ICashForecastRepository>();
        _dismissedRepoMock = new Mock<IDismissedAlertRepository>();
        _service = new AlertasService(
            _transactionRepoMock.Object,
            _forecastRepoMock.Object,
            _dismissedRepoMock.Object
        );
    }

    [Fact]
    public async Task GetAlertsAsync_NegativeBalance_ReturnsNegativeBalanceAlert()
    {
        SetupBaseMocks(balance: -5000);

        var alerts = await _service.GetAlertsAsync("test");

        Assert.Contains(alerts, a => a.Id == "negative-balance");
    }

    [Fact]
    public async Task GetAlertsAsync_TightMargin_ReturnsTightMarginAlert()
    {
        SetupBaseMocks(incomes: 10000, expenses: 9500);

        var alerts = await _service.GetAlertsAsync("test");

        Assert.Contains(alerts, a => a.Id == "tight-margin");
    }

    [Fact]
    public async Task GetAlertsAsync_NoIssues_ReturnsOnlyInsights()
    {
        var transactions = new List<Core.Entities.Transaction>
        {
            new() { Type = TransactionType.Income, Value = 10000, Date = DateTime.UtcNow.AddMonths(-1), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 1000, Date = DateTime.UtcNow.AddMonths(-1), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 12000, Date = DateTime.UtcNow.AddMonths(-2), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 2000, Date = DateTime.UtcNow.AddMonths(-2), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 8000, Date = DateTime.UtcNow.AddMonths(-3), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 1500, Date = DateTime.UtcNow.AddMonths(-3), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Income, Value = 9000, Date = DateTime.UtcNow.AddMonths(-4), CategoryId = Guid.NewGuid() },
            new() { Type = TransactionType.Expense, Value = 1800, Date = DateTime.UtcNow.AddMonths(-4), CategoryId = Guid.NewGuid() },
        };
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 39000m, expenses: 6300m, balance: 32700m));
        _forecastRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<Core.Entities.CashForecast>());
        _dismissedRepoMock.Setup(r => r.GetDismissedIdsAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<string>());

        var alerts = await _service.GetAlertsAsync("test");

        Assert.DoesNotContain(alerts, a => a.Tipo == "critical" || a.Tipo == "warning");
        Assert.Contains(alerts, a => a.Tipo == "success");
    }

    [Fact]
    public async Task GetAlertsAsync_OverdueForecasts_ReturnsOverdueAlerts()
    {
        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<Core.Entities.Transaction>());
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes: 0m, expenses: 0m, balance: 0m));
        _forecastRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<Core.Entities.CashForecast>
            {
                new()
                {
                    Status = ForecastStatus.Predicted,
                    ExpectedDate = DateTime.UtcNow.AddDays(-10),
                    Description = "Overdue forecast",
                    Amount = 5000,
                }
            });
        _dismissedRepoMock.Setup(r => r.GetDismissedIdsAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<string>());

        var alerts = await _service.GetAlertsAsync("test");

        Assert.Contains(alerts, a => a.Id.Contains("overdue"));
    }

    [Fact]
    public async Task DismissAlertAsync_CallsDismiss()
    {
        _dismissedRepoMock.Setup(r => r.ExistsAsync(It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string>()))
            .ReturnsAsync(false);

        await _service.DismissAlertAsync("test-alert", "test", "user");

        _dismissedRepoMock.Verify(r => r.DismissAsync("test", "alert", "test", "user"), Times.Once);
    }

    [Fact]
    public async Task DismissAlertAsync_AlreadyDismissed_Skips()
    {
        _dismissedRepoMock.Setup(r => r.ExistsAsync(It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string>()))
            .ReturnsAsync(true);

        await _service.DismissAlertAsync("test-alert", "test", "user");

        _dismissedRepoMock.Verify(r => r.DismissAsync(It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RestoreAlertAsync_CallsRestore()
    {
        await _service.RestoreAlertAsync("test-alert", "test");

        _dismissedRepoMock.Verify(r => r.RestoreAsync("test", "alert", "test"), Times.Once);
    }

    [Fact]
    public async Task GetAlertsAsync_DismissedAlerts_AreFilteredOut()
    {
        SetupBaseMocks(balance: -5000);
        _dismissedRepoMock.Setup(r => r.GetDismissedIdsAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<string> { "negative-balance" });

        var alerts = await _service.GetAlertsAsync("test");

        Assert.DoesNotContain(alerts, a => a.Id == "negative-balance");
    }

    private void SetupBaseMocks(decimal incomes = 50000, decimal expenses = 20000, decimal balance = 30000)
    {
        var transactions = new List<Core.Entities.Transaction>();
        var now = DateTime.UtcNow;
        for (int i = 0; i < 4; i++)
        {
            transactions.AddRange(new[]
            {
                new Core.Entities.Transaction { Type = TransactionType.Income, Value = incomes / 4, Date = now.AddMonths(-i), CategoryId = Guid.NewGuid() },
                new Core.Entities.Transaction { Type = TransactionType.Expense, Value = expenses / 4, Date = now.AddMonths(-i), CategoryId = Guid.NewGuid() },
            });
        }

        _transactionRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(transactions);
        _transactionRepoMock.Setup(r => r.GetAllBalanceAsync(It.IsAny<string>()))
            .ReturnsAsync((incomes, expenses, balance));
        _forecastRepoMock.Setup(r => r.GetAllAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<Core.Entities.CashForecast>());
        _dismissedRepoMock.Setup(r => r.GetDismissedIdsAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<string>());
    }
}
