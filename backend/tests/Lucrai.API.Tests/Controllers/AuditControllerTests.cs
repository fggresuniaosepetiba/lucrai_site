using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Audit;

namespace Lucrai.API.Tests.Controllers;

public class AuditControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuditControllerTests(CustomWebApplicationFactory factory)
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
        var response = await _client.GetAsync("/api/audit");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<AuditResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetByAction_ValidAction_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/audit/action/Created");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<AuditResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetByAction_InvalidAction_ReturnsBadRequest()
    {
        var response = await _client.GetAsync("/api/audit/action/InvalidAction");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetByEntity_NonExistent_ReturnsEmpty()
    {
        var response = await _client.GetAsync($"/api/audit/entity/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<AuditResponse>>();
        Assert.NotNull(result);
        Assert.Empty(result);
    }
}
