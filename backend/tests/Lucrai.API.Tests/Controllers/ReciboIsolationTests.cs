using System.Net;
using System.Net.Http.Json;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.DTOs.Recibos;

namespace Lucrai.API.Tests.Controllers;

public class ReciboIsolationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ReciboIsolationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> LoginGetToken(string email, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest(email, password));
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.AccessToken;
    }

    [Fact]
    public async Task Recibos_Are_Strictly_Isolated_By_Company()
    {
        // Create an anonymous client for registration
        var anonClient = _factory.CreateClient();

        // Register User from CompanyA
        var regA = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User Alpha",
            email = "alpha@test.com",
            telefone = "11911111111",
            senha = "Test@123",
            empresa = "CompanyA",
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regA.StatusCode);

        // Register User from CompanyB
        var regB = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User Beta",
            email = "beta@test.com",
            telefone = "11922222222",
            senha = "Test@123",
            empresa = "CompanyB",
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regB.StatusCode);

        // Login as User A (CompanyA)
        var tokenA = await LoginGetToken("alpha@test.com", "Test@123");
        var clientA = _factory.CreateClient();
        clientA.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenA);

        // Login as User B (CompanyB)
        var tokenB = await LoginGetToken("beta@test.com", "Test@123");
        var clientB = _factory.CreateClient();
        clientB.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenB);

        // User A creates a recibo
        var createA = await clientA.PostAsJsonAsync("/api/recibos", new
        {
            tipo = "Recebimento",
            origem = "Manual",
            data = "2026-07-27",
            valor = 1500.00m,
            nomePagador = "Pagador A",
            documentoPagador = (string?)null,
            semDocumentoPagador = false,
            nomeRecebedor = "Recebedor A",
            documentoRecebedor = (string?)null,
            semDocumentoRecebedor = false,
            referente = "Servicos A",
            formaPagamento = (string?)null,
            observacoes = (string?)null,
            telefone = (string?)null,
            email = (string?)null,
            cidade = (string?)null,
            estado = (string?)null,
            exibirAssinatura = false,
            parcelaAtual = (int?)null,
            parcelasTotal = (int?)null,
            lancamentoId = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, createA.StatusCode);
        var reciboA = await createA.Content.ReadFromJsonAsync<ReciboResponse>();
        Assert.NotNull(reciboA);
        Assert.Equal("CompanyA", reciboA.Company);

        // User B creates a recibo
        var createB = await clientB.PostAsJsonAsync("/api/recibos", new
        {
            tipo = "Pagamento",
            origem = "Manual",
            data = "2026-07-27",
            valor = 750.00m,
            nomePagador = "Pagador B",
            documentoPagador = (string?)null,
            semDocumentoPagador = false,
            nomeRecebedor = "Recebedor B",
            documentoRecebedor = (string?)null,
            semDocumentoRecebedor = false,
            referente = "Servicos B",
            formaPagamento = (string?)null,
            observacoes = (string?)null,
            telefone = (string?)null,
            email = (string?)null,
            cidade = (string?)null,
            estado = (string?)null,
            exibirAssinatura = false,
            parcelaAtual = (int?)null,
            parcelasTotal = (int?)null,
            lancamentoId = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, createB.StatusCode);
        var reciboB = await createB.Content.ReadFromJsonAsync<ReciboResponse>();
        Assert.NotNull(reciboB);
        Assert.Equal("CompanyB", reciboB.Company);

        // User A lists recibos — should see only A's recibo
        var getA = await clientA.GetAsync("/api/recibos");
        Assert.Equal(HttpStatusCode.OK, getA.StatusCode);
        var recibosA = await getA.Content.ReadFromJsonAsync<List<ReciboResponse>>();

        Assert.Contains(recibosA, r => r.Id == reciboA.Id);
        Assert.DoesNotContain(recibosA, r => r.Id == reciboB.Id);

        // User B lists recibos — should see only B's recibo
        var getB = await clientB.GetAsync("/api/recibos");
        Assert.Equal(HttpStatusCode.OK, getB.StatusCode);
        var recibosB = await getB.Content.ReadFromJsonAsync<List<ReciboResponse>>();

        Assert.Contains(recibosB, r => r.Id == reciboB.Id);
        Assert.DoesNotContain(recibosB, r => r.Id == reciboA.Id);
    }

    [Fact]
    public async Task Recibo_Cannot_Be_Fetched_Across_Companies()
    {
        var anonClient = _factory.CreateClient();

        // Register User from CompanyX
        var regX = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User X",
            email = "userx@test.com",
            telefone = "11933333333",
            senha = "Test@123",
            empresa = "CompanyX",
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regX.StatusCode);

        // Login as User X and create recibo
        var tokenX = await LoginGetToken("userx@test.com", "Test@123");
        var clientX = _factory.CreateClient();
        clientX.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenX);

        var createX = await clientX.PostAsJsonAsync("/api/recibos", new
        {
            tipo = "Recebimento",
            origem = "Manual",
            data = "2026-07-27",
            valor = 999.99m,
            nomePagador = "Pagador X",
            documentoPagador = (string?)null,
            semDocumentoPagador = false,
            nomeRecebedor = "Recebedor X",
            documentoRecebedor = (string?)null,
            semDocumentoRecebedor = false,
            referente = "Teste",
            formaPagamento = (string?)null,
            observacoes = (string?)null,
            telefone = (string?)null,
            email = (string?)null,
            cidade = (string?)null,
            estado = (string?)null,
            exibirAssinatura = false,
            parcelaAtual = (int?)null,
            parcelasTotal = (int?)null,
            lancamentoId = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, createX.StatusCode);
        var reciboX = await createX.Content.ReadFromJsonAsync<ReciboResponse>();
        Assert.NotNull(reciboX);

        // Login as lucrai.adm (Company = "Lucraí") and try to fetch the recibo by ID
        var tokenAdm = await LoginGetToken("lucrai.adm", "123");
        var clientAdm = _factory.CreateClient();
        clientAdm.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenAdm);

        var getById = await clientAdm.GetAsync($"/api/recibos/{reciboX.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getById.StatusCode);

        // Also verify admin's list does not contain it
        var getList = await clientAdm.GetAsync("/api/recibos");
        var adminRecibos = await getList.Content.ReadFromJsonAsync<List<ReciboResponse>>();
        Assert.DoesNotContain(adminRecibos, r => r.Id == reciboX.Id);
    }

    [Fact]
    public async Task Recibos_Are_Strictly_Isolated_By_User_Within_Same_Company()
    {
        var anonClient = _factory.CreateClient();
        var sameCompany = $"SharedCompany_{Guid.NewGuid():N}";
        var emailA = $"usera_{Guid.NewGuid():N}@test.com";
        var emailB = $"userb_{Guid.NewGuid():N}@test.com";

        // Register User A in SharedCompany
        var regA = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User A",
            email = emailA,
            telefone = "11911111111",
            senha = "Test@123",
            empresa = sameCompany,
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regA.StatusCode);

        // Register User B in the SAME company
        var regB = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User B",
            email = emailB,
            telefone = "11922222222",
            senha = "Test@123",
            empresa = sameCompany,
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regB.StatusCode);

        // Login as User A and create a recibo
        var tokenA = await LoginGetToken(emailA, "Test@123");
        var clientA = _factory.CreateClient();
        clientA.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenA);

        var createA = await clientA.PostAsJsonAsync("/api/recibos", new
        {
            tipo = "Recebimento",
            origem = "Manual",
            data = "2026-07-27",
            valor = 1000m,
            nomePagador = "Pagador A",
            documentoPagador = (string?)null,
            semDocumentoPagador = false,
            nomeRecebedor = "Recebedor A",
            documentoRecebedor = (string?)null,
            semDocumentoRecebedor = false,
            referente = "Servicos A",
            formaPagamento = (string?)null,
            observacoes = (string?)null,
            telefone = (string?)null,
            email = (string?)null,
            cidade = (string?)null,
            estado = (string?)null,
            exibirAssinatura = false,
            parcelaAtual = (int?)null,
            parcelasTotal = (int?)null,
            lancamentoId = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, createA.StatusCode);
        var reciboA = await createA.Content.ReadFromJsonAsync<ReciboResponse>();
        Assert.NotNull(reciboA);

        // Login as User B and create a recibo
        var tokenB = await LoginGetToken(emailB, "Test@123");
        var clientB = _factory.CreateClient();
        clientB.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenB);

        var createB = await clientB.PostAsJsonAsync("/api/recibos", new
        {
            tipo = "Pagamento",
            origem = "Manual",
            data = "2026-07-27",
            valor = 2000m,
            nomePagador = "Pagador B",
            documentoPagador = (string?)null,
            semDocumentoPagador = false,
            nomeRecebedor = "Recebedor B",
            documentoRecebedor = (string?)null,
            semDocumentoRecebedor = false,
            referente = "Servicos B",
            formaPagamento = (string?)null,
            observacoes = (string?)null,
            telefone = (string?)null,
            email = (string?)null,
            cidade = (string?)null,
            estado = (string?)null,
            exibirAssinatura = false,
            parcelaAtual = (int?)null,
            parcelasTotal = (int?)null,
            lancamentoId = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, createB.StatusCode);
        var reciboB = await createB.Content.ReadFromJsonAsync<ReciboResponse>();
        Assert.NotNull(reciboB);

        // User A lists recibos — should see only A's
        var getA = await clientA.GetAsync("/api/recibos");
        Assert.Equal(HttpStatusCode.OK, getA.StatusCode);
        var recibosA = await getA.Content.ReadFromJsonAsync<List<ReciboResponse>>();

        Assert.Contains(recibosA, r => r.Id == reciboA.Id);
        Assert.DoesNotContain(recibosA, r => r.Id == reciboB.Id);

        // User B lists recibos — should see only B's
        var getB = await clientB.GetAsync("/api/recibos");
        Assert.Equal(HttpStatusCode.OK, getB.StatusCode);
        var recibosB = await getB.Content.ReadFromJsonAsync<List<ReciboResponse>>();

        Assert.Contains(recibosB, r => r.Id == reciboB.Id);
        Assert.DoesNotContain(recibosB, r => r.Id == reciboA.Id);
    }

    [Fact]
    public async Task Recibo_Cannot_Be_Fetched_Across_Users_In_Same_Company()
    {
        var anonClient = _factory.CreateClient();
        var sameCompany = $"SharedCompany_{Guid.NewGuid():N}";
        var emailA = $"usera_{Guid.NewGuid():N}@test.com";
        var emailB = $"userb_{Guid.NewGuid():N}@test.com";

        // Register User A
        var regA = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User A",
            email = emailA,
            telefone = "11911111111",
            senha = "Test@123",
            empresa = sameCompany,
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regA.StatusCode);

        // Register User B
        var regB = await anonClient.PostAsJsonAsync("/api/contas", new
        {
            nome = "User B",
            email = emailB,
            telefone = "11922222222",
            senha = "Test@123",
            empresa = sameCompany,
            porte = "MEI",
            faturamento = "ATE_50K",
            origem = "site",
            plano = "trial"
        });
        Assert.Equal(HttpStatusCode.OK, regB.StatusCode);

        // User A creates a recibo
        var tokenA = await LoginGetToken(emailA, "Test@123");
        var clientA = _factory.CreateClient();
        clientA.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenA);

        var createA = await clientA.PostAsJsonAsync("/api/recibos", new
        {
            tipo = "Recebimento",
            origem = "Manual",
            data = "2026-07-27",
            valor = 1500m,
            nomePagador = "Pagador A",
            documentoPagador = (string?)null,
            semDocumentoPagador = false,
            nomeRecebedor = "Recebedor A",
            documentoRecebedor = (string?)null,
            semDocumentoRecebedor = false,
            referente = "Servicos A",
            formaPagamento = (string?)null,
            observacoes = (string?)null,
            telefone = (string?)null,
            email = (string?)null,
            cidade = (string?)null,
            estado = (string?)null,
            exibirAssinatura = false,
            parcelaAtual = (int?)null,
            parcelasTotal = (int?)null,
            lancamentoId = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, createA.StatusCode);
        var reciboA = await createA.Content.ReadFromJsonAsync<ReciboResponse>();
        Assert.NotNull(reciboA);

        // User B tries to fetch User A's recibo by ID — should get 404
        var tokenB = await LoginGetToken(emailB, "Test@123");
        var clientB = _factory.CreateClient();
        clientB.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenB);

        var getById = await clientB.GetAsync($"/api/recibos/{reciboA.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getById.StatusCode);
    }
}
