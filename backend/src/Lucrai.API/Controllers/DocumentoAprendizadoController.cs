using Lucrai.Core.DTOs.Documentos;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/documentos/aprendizado")]
[Authorize]
public class DocumentoAprendizadoController : ControllerBase
{
    private readonly IDocumentoAprendizadoRepository _repo;

    public DocumentoAprendizadoController(IDocumentoAprendizadoRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserId => HttpContext.Items["UserId"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetByCompanyAsync(Company);
        var result = items.Select(a => new DocumentoAprendizadoResponse(
            a.Id, a.Chave, a.CategoriaId, a.TipoMovimentacao,
            a.ConfiancaMinima, a.Ativo, a.CriadoEm, a.AtualizadoEm
        ));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertAprendizadoRequest request)
    {
        var aprendizado = new DocumentoAprendizado
        {
            Company = Company,
            Chave = request.Chave,
            CategoriaId = request.CategoriaId,
            TipoMovimentacao = request.TipoMovimentacao,
            ConfiancaMinima = request.ConfiancaMinima ?? 70,
            Ativo = request.Ativo ?? true,
            CriadoPor = UserId
        };

        var result = await _repo.UpsertAsync(aprendizado);
        return Ok(new DocumentoAprendizadoResponse(
            result.Id, result.Chave, result.CategoriaId, result.TipoMovimentacao,
            result.ConfiancaMinima, result.Ativo, result.CriadoEm, result.AtualizadoEm
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _repo.GetByCompanyAsync(Company);
        var match = item.FirstOrDefault(a => a.Id == id);
        if (match == null)
            return NotFound(new { error = "Regra de aprendizado não encontrada" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Regra de aprendizado removida" });
    }
}
