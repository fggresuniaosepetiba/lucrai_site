using FluentValidation;
using Lucrai.Core.DTOs.Contas;

namespace Lucrai.API.Validators;

public class CreateContaRequestValidator : AbstractValidator<CreateContaRequest>
{
    public CreateContaRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MinimumLength(3).MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(6).MaximumLength(128);
        RuleFor(x => x.Empresa).NotEmpty().MinimumLength(2).MaximumLength(128);
        RuleFor(x => x.Porte).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Faturamento).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Origem).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Plano).NotEmpty().MaximumLength(32);
    }
}
