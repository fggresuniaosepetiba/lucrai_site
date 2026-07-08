using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Transactions;

namespace Lucrai.API.Tests.Controllers;

public class TransactionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TransactionsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GetToken());
    }

    private string GetToken()
    {
        var loginResponse = _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("lucrai.adm", "123")).GetAwaiter().GetResult();
        var loginResult = loginResponse.Content.ReadFromJsonAsync<LoginResponse>().GetAwaiter().GetResult();
        return loginResult!.AccessToken;
    }

    [Fact]
    public async Task CreateTransaction_ReturnsOk()
    {
        var request = new CreateTransactionRequest(
            "Income", 1500, Guid.NewGuid(), "Vendas",
            "Venda de produto", DateTime.UtcNow, null
        );

        var response = await _client.PostAsJsonAsync("/api/transactions", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<TransactionResponse>();
        Assert.NotNull(result);
        Assert.Equal(1500, result.Value);
    }

    [Fact]
    public async Task GetAllTransactions_ReturnsList()
    {
        var response = await _client.GetAsync("/api/transactions");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetBalance_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/transactions/balance");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<BalanceResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetSummary_ReturnsOk()
    {
        var year = DateTime.UtcNow.Year;

        var response = await _client.GetAsync($"/api/transactions/summary/{year}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<TransactionSummaryResponse>();
        Assert.NotNull(result);
    }
}
