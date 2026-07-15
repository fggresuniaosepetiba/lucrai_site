using FluentValidation;
using Lucrai.Core.DTOs.AccountsPayable;

namespace Lucrai.API.Validators;

public class CreateAccountPayableRequestValidator : AbstractValidator<CreateAccountPayableRequest>
{
    public CreateAccountPayableRequestValidator()
    {
        RuleFor(x => x.SupplierName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SupplierDocument).MaximumLength(20).When(x => x.SupplierDocument != null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.DueDate).NotEmpty();
        RuleFor(x => x.Category).MaximumLength(120).When(x => x.Category != null);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}

public class UpdateAccountPayableRequestValidator : AbstractValidator<UpdateAccountPayableRequest>
{
    public UpdateAccountPayableRequestValidator()
    {
        RuleFor(x => x.SupplierName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SupplierDocument).MaximumLength(20).When(x => x.SupplierDocument != null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.DueDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().Must(x => x is "Pending" or "Paid" or "Overdue" or "Cancelled");
        RuleFor(x => x.Category).MaximumLength(120).When(x => x.Category != null);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}
