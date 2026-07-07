using FluentValidation;
using Lucrai.Core.DTOs.Forecasts;

namespace Lucrai.API.Validators;

public class CreateForecastRequestValidator : AbstractValidator<CreateForecastRequest>
{
    public CreateForecastRequestValidator()
    {
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "Income" or "Expense");
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(120);
        RuleFor(x => x.ExpectedDate).NotEmpty();
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        RuleFor(x => x.RecurrenceType).MaximumLength(32).When(x => x.RecurrenceType != null);
    }
}

public class UpdateForecastRequestValidator : AbstractValidator<UpdateForecastRequest>
{
    public UpdateForecastRequestValidator()
    {
        When(x => x.Type != null, () =>
        {
            RuleFor(x => x.Type!).Must(x => x is "Income" or "Expense");
        });
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        When(x => x.Amount.HasValue, () =>
        {
            RuleFor(x => x.Amount!.Value).GreaterThan(0);
        });
        RuleFor(x => x.Category).MaximumLength(120).When(x => x.Category != null);
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        RuleFor(x => x.RecurrenceType).MaximumLength(32).When(x => x.RecurrenceType != null);
    }
}
