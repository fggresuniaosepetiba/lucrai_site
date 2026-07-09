using FluentValidation;
using Lucrai.Core.DTOs.FixedCosts;

namespace Lucrai.API.Validators;

public class FixedCostRequestValidator : AbstractValidator<FixedCostRequest>
{
    public FixedCostRequestValidator()
    {
        RuleFor(x => x.Aluguel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Energia).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Agua).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Internet).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Contador).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ProLabore).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Softwares).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Telefone).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Marketing).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Limpeza).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Outros).GreaterThanOrEqualTo(0);
    }
}
