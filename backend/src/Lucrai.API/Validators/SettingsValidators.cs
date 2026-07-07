using FluentValidation;
using Lucrai.Core.DTOs.Settings;

namespace Lucrai.API.Validators;

public class SettingsRequestValidator : AbstractValidator<SettingsRequest>
{
    public SettingsRequestValidator()
    {
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.LogoUrl).MaximumLength(2048).When(x => x.LogoUrl != null);
        RuleFor(x => x.PrimaryColor).NotEmpty().MaximumLength(7);
    }
}
