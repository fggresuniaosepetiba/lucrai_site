using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Settings;

namespace Lucrai.API.Tests.Controllers;

public class SettingsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SettingsControllerTests(CustomWebApplicationFactory factory)
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
    public async Task SaveSettings_ReturnsOk()
    {
        var request = new SettingsRequest("Test Company", "https://logo.test", "#ff0000");

        var response = await _client.PostAsJsonAsync("/api/settings", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<SettingsResponse>();
        Assert.NotNull(result);
        Assert.Equal("Test Company", result.CompanyName);
    }

    [Fact]
    public async Task GetSettings_ReturnsSaved()
    {
        var saveReq = new SettingsRequest("Get Test Co", null, "#00ff00");
        await _client.PostAsJsonAsync("/api/settings", saveReq);

        var response = await _client.GetAsync("/api/settings");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<SettingsResponse>();
        Assert.NotNull(result);
        Assert.Equal("Get Test Co", result.CompanyName);
    }

    [Fact]
    public async Task UpdateSettings_ReturnsOk()
    {
        var saveReq = new SettingsRequest("Update Co", null, "#0000ff");
        await _client.PostAsJsonAsync("/api/settings", saveReq);

        var updateReq = new SettingsRequest("Updated Co", "https://new.logo", "#ffffff");
        var response = await _client.PutAsJsonAsync("/api/settings", updateReq);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<SettingsResponse>();
        Assert.NotNull(result);
        Assert.Equal("Updated Co", result.CompanyName);
    }

    [Fact]
    public async Task GetSettings_NotSaved_ReturnsNotFound()
    {
        var newUserClient = _client;
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("lucrai.adm", "123"));
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();

        var registerReq = new Lucrai.Core.DTOs.Auth.RegisterRequest("New User Co", "newco@test.com", "Test@123", "NewCo");
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerReq);
        var registerResult = (await registerResponse.Content.ReadFromJsonAsync<LoginResponse>())!;

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/settings");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", registerResult.AccessToken);
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
