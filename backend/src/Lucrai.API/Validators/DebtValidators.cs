using FluentValidation;
using Lucrai.Core.DTOs.Debts;

namespace Lucrai.API.Validators;

public class CreateDebtRequestValidator : AbstractValidator<CreateDebtRequest>
{
    public CreateDebtRequestValidator()
    {
        RuleFor(x => x.Creditor).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.TotalAmount).GreaterThan(0);
        RuleFor(x => x.OutstandingBalance).GreaterThanOrEqualTo(0);
        RuleFor(x => x.InterestRate).GreaterThanOrEqualTo(0);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.InstallmentCount).GreaterThan(0);
        RuleFor(x => x.InstallmentValue).GreaterThan(0);
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "Loan" or "Financing" or "CreditCard" or "Other");
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}

public class UpdateDebtRequestValidator : AbstractValidator<UpdateDebtRequest>
{
    public UpdateDebtRequestValidator()
    {
        RuleFor(x => x.Creditor).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.TotalAmount).GreaterThan(0);
        RuleFor(x => x.OutstandingBalance).GreaterThanOrEqualTo(0);
        RuleFor(x => x.InterestRate).GreaterThanOrEqualTo(0);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.InstallmentCount).GreaterThan(0);
        RuleFor(x => x.InstallmentValue).GreaterThan(0);
        RuleFor(x => x.Status).NotEmpty().Must(x => x is "Active" or "Paid" or "Renegotiated");
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "Loan" or "Financing" or "CreditCard" or "Other");
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}
