using FluentValidation;
using Lucrai.Core.DTOs.Signature;

namespace Lucrai.API.Validators;

public class SignatureRequestValidator : AbstractValidator<SignatureRequest>
{
    public SignatureRequestValidator()
    {
        RuleFor(x => x.NomeResponsavel).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Cargo).NotEmpty().MaximumLength(200);
    }
}
