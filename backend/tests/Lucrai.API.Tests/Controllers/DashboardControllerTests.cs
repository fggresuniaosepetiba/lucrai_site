using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Dashboard;

namespace Lucrai.API.Tests.Controllers;

public class DashboardControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DashboardControllerTests(CustomWebApplicationFactory factory)
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
    public async Task GetRunway_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/dashboard/runway");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<RunwayResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetBreakEven_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/dashboard/breakeven");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<BreakEvenResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/dashboard/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HealthResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetAlerts_ReturnsList()
    {
        var response = await _client.GetAsync("/api/dashboard/alerts");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<AlertResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task PostProjection_ReturnsOk()
    {
        var request = new ProjectionRequest(12, null, null, null, null, null);

        var response = await _client.PostAsJsonAsync("/api/dashboard/projection", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ProjectionResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetSparkline_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/dashboard/sparkline?months=6");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<SparklinePoint>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetNotaCFO_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/dashboard/nota-cfo");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<NotaCFOResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetRecommendedActions_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/dashboard/recommended-actions");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<AcaoRecomendada>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task DismissAlert_ReturnsOk()
    {
        var alertsResponse = await _client.GetAsync("/api/dashboard/alerts");
        var alerts = await alertsResponse.Content.ReadFromJsonAsync<List<AlertResponse>>();
        if (alerts != null && alerts.Count > 0)
        {
            var alertId = alerts[0].Id;
            var response = await _client.PostAsync($"/api/dashboard/alerts/{alertId}/dismiss", null);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task RestoreAlert_ReturnsOk()
    {
        var response = await _client.PostAsync($"/api/dashboard/alerts/some-alert-id/restore", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
