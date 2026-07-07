using FluentValidation;
using Lucrai.Core.DTOs.Users;

namespace Lucrai.API.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(128);
        RuleFor(x => x.Role).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Avatar).MaximumLength(2048).When(x => x.Avatar != null);
    }
}

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.Name).MinimumLength(2).MaximumLength(128).When(x => x.Name != null);
        RuleFor(x => x.Role).MaximumLength(32).When(x => x.Role != null);
        RuleFor(x => x.Avatar).MaximumLength(2048).When(x => x.Avatar != null);
    }
}
