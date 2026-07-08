using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Pricing;

namespace Lucrai.API.Tests.Controllers;

public class PricingControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PricingControllerTests(CustomWebApplicationFactory factory)
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
    public async Task CreateProduct_ReturnsOk()
    {
        var request = new CreatePricingRequest(
            "Test Product", "Geral", null, null,
            10, 2, 5, 3, 1,
            5, 2, 3, 1, 1, 30
        );

        var response = await _client.PostAsJsonAsync("/api/pricing", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PricingResponse>();
        Assert.NotNull(result);
        Assert.Equal("Test Product", result.Name);
        Assert.True(result.MinPrice > 0);
    }

    [Fact]
    public async Task GetAllProducts_ReturnsList()
    {
        var response = await _client.GetAsync("/api/pricing");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PricingResponse>>();
        Assert.NotNull(result);
    }
}
