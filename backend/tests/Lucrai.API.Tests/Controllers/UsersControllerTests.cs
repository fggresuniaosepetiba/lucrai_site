using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Users;

namespace Lucrai.API.Tests.Controllers;

public class UsersControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersControllerTests(CustomWebApplicationFactory factory)
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
        var response = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }

    [Fact]
    public async Task GetActive_ReturnsActiveUsers()
    {
        var response = await _client.GetAsync("/api/users/active");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.NotNull(result);
        Assert.All(result, u => Assert.True(u.Active));
    }

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        var allResponse = await _client.GetAsync("/api/users");
        var allUsers = await allResponse.Content.ReadFromJsonAsync<List<UserResponse>>();
        var first = allUsers!.First();

        var response = await _client.GetAsync($"/api/users/{first.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(result);
        Assert.Equal(first.Id, result.Id);
    }

    [Fact]
    public async Task GetById_NonExistent_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/users/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_ReturnsOk()
    {
        var request = new CreateUserRequest("Test User", "test@test.com", "Test@123", "Viewer", null);

        var response = await _client.PostAsJsonAsync("/api/users", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(result);
        Assert.Equal("Test User", result.Name);
        Assert.Equal("Viewer", result.Role);
    }

    [Fact]
    public async Task CreateUser_DuplicateEmail_ReturnsBadRequest()
    {
        var request = new CreateUserRequest("Dup User", "lucrai.adm", "Test@123", "Viewer", null);

        var response = await _client.PostAsJsonAsync("/api/users", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_ReturnsOk()
    {
        var allResponse = await _client.GetAsync("/api/users");
        var allUsers = await allResponse.Content.ReadFromJsonAsync<List<UserResponse>>();
        var target = allUsers!.First(u => u.Role != "Admin");

        var updateReq = new UpdateUserRequest("Updated Name", null, null, null);
        var response = await _client.PutAsJsonAsync($"/api/users/{target.Id}", updateReq);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.Name);
    }

    [Fact]
    public async Task SoftDeleteUser_ReturnsOk()
    {
        var createReq = new CreateUserRequest("Delete Me", "delete.me@test.com", "Test@123", "Viewer", null);
        var created = await _client.PostAsJsonAsync("/api/users", createReq);
        var createdUser = (await created.Content.ReadFromJsonAsync<UserResponse>())!;

        var response = await _client.DeleteAsync($"/api/users/{createdUser!.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task SoftDelete_NonExistent_ReturnsNotFound()
    {
        var response = await _client.DeleteAsync($"/api/users/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
