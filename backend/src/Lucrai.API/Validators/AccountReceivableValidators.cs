using FluentValidation;
using Lucrai.Core.DTOs.AccountsReceivable;

namespace Lucrai.API.Validators;

public class CreateAccountReceivableRequestValidator : AbstractValidator<CreateAccountReceivableRequest>
{
    public CreateAccountReceivableRequestValidator()
    {
        RuleFor(x => x.ClientName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ClientDocument).MaximumLength(20).When(x => x.ClientDocument != null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.DueDate).NotEmpty();
        RuleFor(x => x.Category).MaximumLength(120).When(x => x.Category != null);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}

public class UpdateAccountReceivableRequestValidator : AbstractValidator<UpdateAccountReceivableRequest>
{
    public UpdateAccountReceivableRequestValidator()
    {
        RuleFor(x => x.ClientName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ClientDocument).MaximumLength(20).When(x => x.ClientDocument != null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.DueDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().Must(x => x is "Pending" or "Received" or "Overdue" or "Cancelled");
        RuleFor(x => x.Category).MaximumLength(120).When(x => x.Category != null);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}
