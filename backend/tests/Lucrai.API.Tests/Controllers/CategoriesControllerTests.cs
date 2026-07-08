using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Categories;

namespace Lucrai.API.Tests.Controllers;

public class CategoriesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CategoriesControllerTests(CustomWebApplicationFactory factory)
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
    public async Task CreateCategory_ReturnsOk()
    {
        var request = new CreateCategoryRequest("Test Cat", "#ff0000", "tag", "Income");

        var response = await _client.PostAsJsonAsync("/api/categories", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.NotNull(result);
        Assert.Equal("Test Cat", result.Name);
    }

    [Fact]
    public async Task GetAllCategories_ReturnsList()
    {
        var response = await _client.GetAsync("/api/categories");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<CategoryResponse>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetByType_ReturnsFiltered()
    {
        var response = await _client.GetAsync("/api/categories/type/Income");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<CategoryResponse>>();
        Assert.NotNull(result);
    }
}
