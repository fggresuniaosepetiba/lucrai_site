using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Forecasts;

namespace Lucrai.API.Tests.Controllers;

public class CashForecastsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CashForecastsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GetToken());
    }

    private string GetToken()
    {
        var loginResponse = _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("lucrai.adm", "Lucrai@1")).GetAwaiter().GetResult();
        var loginResult = loginResponse.Content.ReadFromJsonAsync<LoginResponse>().GetAwaiter().GetResult();
        return loginResult!.AccessToken;
    }

    [Fact]
    public async Task GetAll_ReturnsList()
    {
        var response = await _client.GetAsync("/api/forecasts");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<ForecastResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task CreateForecast_ReturnsOk()
    {
        var request = new CreateForecastRequest(
            "Income", "Test forecast", 5000, "Vendas",
            DateTime.UtcNow.AddDays(30), null, false, null, null
        );

        var response = await _client.PostAsJsonAsync("/api/forecasts", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ForecastResponse>();
        Assert.NotNull(result);
        Assert.Equal(5000, result.Amount);
    }

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        var createReq = new CreateForecastRequest(
            "Expense", "Test find", 3000, "Aluguel",
            DateTime.UtcNow.AddDays(15), null, false, null, null
        );
        var created = await _client.PostAsJsonAsync("/api/forecasts", createReq);
        var createdForecast = await created.Content.ReadFromJsonAsync<ForecastResponse>()!;

        var response = await _client.GetAsync($"/api/forecasts/{createdForecast!.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ForecastResponse>();
        Assert.NotNull(result);
        Assert.Equal(createdForecast.Id, result.Id);
    }

    [Fact]
    public async Task GetById_NonExistent_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/forecasts/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateForecast_ReturnsOk()
    {
        var createReq = new CreateForecastRequest(
            "Income", "To update", 1000, "Servicos",
            DateTime.UtcNow.AddDays(10), null, false, null, null
        );
        var created = await _client.PostAsJsonAsync("/api/forecasts", createReq);
        var createdForecast = await created.Content.ReadFromJsonAsync<ForecastResponse>()!;

        var updateReq = new UpdateForecastRequest(
            null, "Updated description", 2000, null, null, null, null, null, null
        );
        var response = await _client.PutAsJsonAsync($"/api/forecasts/{createdForecast!.Id}", updateReq);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ForecastResponse>();
        Assert.NotNull(result);
        Assert.Equal("Updated description", result.Description);
        Assert.Equal(2000, result.Amount);
    }

    [Fact]
    public async Task DeleteForecast_ReturnsOk()
    {
        var createReq = new CreateForecastRequest(
            "Expense", "To delete", 500, "Outros",
            DateTime.UtcNow.AddDays(5), null, false, null, null
        );
        var created = await _client.PostAsJsonAsync("/api/forecasts", createReq);
        var createdForecast = await created.Content.ReadFromJsonAsync<ForecastResponse>()!;

        var response = await _client.DeleteAsync($"/api/forecasts/{createdForecast!.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetByStatus_ReturnsFiltered()
    {
        var response = await _client.GetAsync("/api/forecasts/status/Predicted");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<ForecastResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task MarkAsReceived_ReturnsOk()
    {
        var createReq = new CreateForecastRequest(
            "Income", "To receive", 3000, "Vendas",
            DateTime.UtcNow.AddDays(5), null, false, null, null
        );
        var created = await _client.PostAsJsonAsync("/api/forecasts", createReq);
        var createdForecast = await created.Content.ReadFromJsonAsync<ForecastResponse>()!;

        var response = await _client.PostAsync($"/api/forecasts/{createdForecast!.Id}/mark-as-received", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<MarkActionResponse>();
        Assert.NotNull(result);
        Assert.Equal("Received", result.Status);
    }

    [Fact]
    public async Task MarkAsPaid_ReturnsOk()
    {
        var createReq = new CreateForecastRequest(
            "Expense", "To pay", 2000, "Aluguel",
            DateTime.UtcNow.AddDays(3), null, false, null, null
        );
        var created = await _client.PostAsJsonAsync("/api/forecasts", createReq);
        var createdForecast = await created.Content.ReadFromJsonAsync<ForecastResponse>()!;

        var response = await _client.PostAsync($"/api/forecasts/{createdForecast!.Id}/mark-as-paid", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<MarkActionResponse>();
        Assert.NotNull(result);
        Assert.Equal("Paid", result.Status);
    }

    [Fact]
    public async Task MarkAsCancelled_ReturnsOk()
    {
        var createReq = new CreateForecastRequest(
            "Expense", "To cancel", 1500, "Outros",
            DateTime.UtcNow.AddDays(2), null, false, null, null
        );
        var created = await _client.PostAsJsonAsync("/api/forecasts", createReq);
        var createdForecast = await created.Content.ReadFromJsonAsync<ForecastResponse>()!;

        var response = await _client.PostAsJsonAsync($"/api/forecasts/{createdForecast!.Id}/mark-as-cancelled", "\"Motivo teste\"");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<MarkActionResponse>();
        Assert.NotNull(result);
        Assert.Equal("Cancelled", result.Status);
    }

    [Fact]
    public async Task GetTotals_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/forecasts/totals");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ForecastTotalsResponse>();
        Assert.NotNull(result);
    }
}
