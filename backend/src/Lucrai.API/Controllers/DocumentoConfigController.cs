using Lucrai.Core.DTOs.Documentos;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/documentos/config")]
[Authorize]
public class DocumentoConfigController : ControllerBase
{
    private readonly IDocumentoConfigRepository _repo;

    public DocumentoConfigController(IDocumentoConfigRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var config = await _repo.GetByCompanyAsync(Company);
        if (config == null)
        {
            config = new DocumentoConfiguracao
            {
                Company = Company,
                CategorizacaoAutomatica = true,
                CriarLancamentoAutomatico = false,
                DiasRetencaoLixeira = 30
            };
            config = await _repo.UpsertAsync(config);
        }

        return Ok(new DocumentoConfigResponse(
            config.Id, config.Company, config.CategorizacaoAutomatica,
            config.CriarLancamentoAutomatico, config.DiasRetencaoLixeira
        ));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpsertConfigRequest request)
    {
        var existing = await _repo.GetByCompanyAsync(Company);
        DocumentoConfiguracao config;

        if (existing != null)
        {
            config = existing;
            if (request.CategorizacaoAutomatica.HasValue)
                config.CategorizacaoAutomatica = request.CategorizacaoAutomatica.Value;
            if (request.CriarLancamentoAutomatico.HasValue)
                config.CriarLancamentoAutomatico = request.CriarLancamentoAutomatico.Value;
            if (request.DiasRetencaoLixeira.HasValue)
                config.DiasRetencaoLixeira = request.DiasRetencaoLixeira.Value;
        }
        else
        {
            config = new DocumentoConfiguracao
            {
                Company = Company,
                CategorizacaoAutomatica = request.CategorizacaoAutomatica ?? true,
                CriarLancamentoAutomatico = request.CriarLancamentoAutomatico ?? false,
                DiasRetencaoLixeira = request.DiasRetencaoLixeira ?? 30
            };
        }

        var result = await _repo.UpsertAsync(config);
        return Ok(new DocumentoConfigResponse(
            result.Id, result.Company, result.CategorizacaoAutomatica,
            result.CriarLancamentoAutomatico, result.DiasRetencaoLixeira
        ));
    }
}
