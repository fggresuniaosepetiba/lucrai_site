using FluentValidation;
using Lucrai.Core.DTOs.BalanceAccounts;

namespace Lucrai.API.Validators;

public class CreateBalanceAccountRequestValidator : AbstractValidator<CreateBalanceAccountRequest>
{
    public CreateBalanceAccountRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nature).NotEmpty().Must(x => x is "Asset" or "Liability" or "Equity" or "Revenue" or "Expense");
        RuleFor(x => x.Year).GreaterThan(2000);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}

public class UpdateBalanceAccountRequestValidator : AbstractValidator<UpdateBalanceAccountRequest>
{
    public UpdateBalanceAccountRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nature).NotEmpty().Must(x => x is "Asset" or "Liability" or "Equity" or "Revenue" or "Expense");
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
    }
}
