using FluentValidation;
using Lucrai.Core.DTOs.Transactions;

namespace Lucrai.API.Validators;

public class CreateTransactionRequestValidator : AbstractValidator<CreateTransactionRequest>
{
    public CreateTransactionRequestValidator()
    {
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "Income" or "Expense");
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.CategoryName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Observation).MaximumLength(2000).When(x => x.Observation != null);
    }
}

public class UpdateTransactionRequestValidator : AbstractValidator<UpdateTransactionRequest>
{
    public UpdateTransactionRequestValidator()
    {
        RuleFor(x => x.Type).NotEmpty().Must(x => x is "Income" or "Expense");
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.CategoryName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Observation).MaximumLength(2000).When(x => x.Observation != null);
    }
}
