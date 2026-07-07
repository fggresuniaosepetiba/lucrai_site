using FluentValidation;
using Lucrai.Core.DTOs.Dashboard;

namespace Lucrai.API.Validators;

public class ProjectionRequestValidator : AbstractValidator<ProjectionRequest>
{
    public ProjectionRequestValidator()
    {
        RuleFor(x => x.Horizonte).InclusiveBetween(1, 365);
        When(x => x.CrescimentoReceita.HasValue, () =>
        {
            RuleFor(x => x.CrescimentoReceita!.Value).InclusiveBetween(-100, 1000);
        });
        When(x => x.VariacaoCustos.HasValue, () =>
        {
            RuleFor(x => x.VariacaoCustos!.Value).InclusiveBetween(-100, 1000);
        });
        When(x => x.NovoCustoFixo.HasValue, () =>
        {
            RuleFor(x => x.NovoCustoFixo!.Value).GreaterThanOrEqualTo(0);
        });
        When(x => x.DespesaPontual.HasValue, () =>
        {
            RuleFor(x => x.DespesaPontual!.Value).GreaterThanOrEqualTo(0);
        });
        When(x => x.DespesaPontualMes.HasValue, () =>
        {
            RuleFor(x => x.DespesaPontualMes!.Value).InclusiveBetween(1, 12);
        });
    }
}
