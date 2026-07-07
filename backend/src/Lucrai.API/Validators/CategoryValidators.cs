using FluentValidation;
using Lucrai.Core.DTOs.Categories;

namespace Lucrai.API.Validators;

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(7);
        RuleFor(x => x.Icon).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "Income" or "Expense");
    }
}

public class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).MaximumLength(120).When(x => x.Name != null);
        RuleFor(x => x.Color).MaximumLength(7).When(x => x.Color != null);
        RuleFor(x => x.Icon).MaximumLength(64).When(x => x.Icon != null);
        When(x => x.Type != null, () =>
        {
            RuleFor(x => x.Type!).Must(x => x is "Income" or "Expense");
        });
    }
}
