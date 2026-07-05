using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Contas;

namespace Lucrai.API.Tests.Controllers;

public class ContasControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ContasControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateRegistration_Anonymous_ReturnsOk()
    {
        var request = new CreateContaRequest(
            "João Silva", "joao@test.com", "11999999999",
            "Senha@123", "João Tech", "MEI", "50000",
            "Google", "Premium"
        );

        var response = await _client.PostAsJsonAsync("/api/contas", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ContaResponse>();
        Assert.NotNull(result);
        Assert.Equal("João Silva", result.Nome);
        Assert.Equal("MEI", result.Porte);
    }

    [Fact]
    public async Task CreateRegistration_InvalidPorte_ReturnsBadRequest()
    {
        var request = new CreateContaRequest(
            "Maria", "maria@test.com", "11888888888",
            "Senha@123", "Maria Ltda", "InvalidPorte",
            "100000", "Indicacao", "Basico"
        );

        var response = await _client.PostAsJsonAsync("/api/contas", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_Unauthenticated_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/contas");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_AsAdmin_ReturnsList()
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("lucrai.adm", "Lucrai@1"));
        var loginResult = (await loginResponse.Content.ReadFromJsonAsync<LoginResponse>())!;

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/contas");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginResult.AccessToken);

        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<ContaResponse>>();
        Assert.NotNull(result);
    }
}
