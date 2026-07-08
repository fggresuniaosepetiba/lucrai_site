using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Trash;

namespace Lucrai.API.Tests.Controllers;

public class TrashControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TrashControllerTests(CustomWebApplicationFactory factory)
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
    public async Task GetAll_ReturnsList()
    {
        var response = await _client.GetAsync("/api/trash");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<TrashResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Cleanup_ReturnsOk()
    {
        var response = await _client.PostAsync("/api/trash/cleanup", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CleanupResponse>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Restore_NonExistent_ReturnsNotFound()
    {
        var response = await _client.PostAsync($"/api/trash/{Guid.NewGuid()}/restore", null);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PermanentlyDelete_NonExistent_ReturnsOk()
    {
        var response = await _client.DeleteAsync($"/api/trash/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
