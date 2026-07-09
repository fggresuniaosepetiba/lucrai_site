using FluentValidation;
using Lucrai.Core.DTOs.Insumos;

namespace Lucrai.API.Validators;

public class CreateInsumoRequestValidator : AbstractValidator<CreateInsumoRequest>
{
    public CreateInsumoRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Categoria).MaximumLength(100);
        RuleFor(x => x.UnidadeMedida).NotEmpty();
        RuleFor(x => x.QuantidadeComprada).GreaterThan(0);
        RuleFor(x => x.ValorPago).GreaterThan(0);
    }
}

public class UpdateInsumoRequestValidator : AbstractValidator<UpdateInsumoRequest>
{
    public UpdateInsumoRequestValidator()
    {
        When(x => x.Nome != null, () => RuleFor(x => x.Nome!).MaximumLength(200));
        When(x => x.Categoria != null, () => RuleFor(x => x.Categoria!).MaximumLength(100));
        When(x => x.QuantidadeComprada.HasValue, () => RuleFor(x => x.QuantidadeComprada!).GreaterThan(0));
        When(x => x.ValorPago.HasValue, () => RuleFor(x => x.ValorPago!).GreaterThan(0));
    }
}
