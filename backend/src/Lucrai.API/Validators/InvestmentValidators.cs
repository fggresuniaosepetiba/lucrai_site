using FluentValidation;
using Lucrai.Core.DTOs.Investments;

namespace Lucrai.API.Validators;

public class CreateInvestmentRequestValidator : AbstractValidator<CreateInvestmentRequest>
{
    public CreateInvestmentRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "CAPEX" or "Project" or "Financial" or "Other");
        RuleFor(x => x.InvestedAmount).GreaterThan(0);
        RuleFor(x => x.CurrentValue).GreaterThanOrEqualTo(0).When(x => x.CurrentValue.HasValue);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.ExpectedROI).GreaterThanOrEqualTo(0).When(x => x.ExpectedROI.HasValue);
        RuleFor(x => x.ActualROI).GreaterThanOrEqualTo(0).When(x => x.ActualROI.HasValue);
        RuleFor(x => x.NPV).GreaterThanOrEqualTo(0).When(x => x.NPV.HasValue);
        RuleFor(x => x.PaybackMonths).GreaterThan(0).When(x => x.PaybackMonths.HasValue);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}

public class UpdateInvestmentRequestValidator : AbstractValidator<UpdateInvestmentRequest>
{
    public UpdateInvestmentRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "CAPEX" or "Project" or "Financial" or "Other");
        RuleFor(x => x.InvestedAmount).GreaterThan(0);
        RuleFor(x => x.CurrentValue).GreaterThanOrEqualTo(0).When(x => x.CurrentValue.HasValue);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().Must(x => x is "Active" or "Completed" or "Cancelled");
        RuleFor(x => x.ExpectedROI).GreaterThanOrEqualTo(0).When(x => x.ExpectedROI.HasValue);
        RuleFor(x => x.ActualROI).GreaterThanOrEqualTo(0).When(x => x.ActualROI.HasValue);
        RuleFor(x => x.NPV).GreaterThanOrEqualTo(0).When(x => x.NPV.HasValue);
        RuleFor(x => x.PaybackMonths).GreaterThan(0).When(x => x.PaybackMonths.HasValue);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}
