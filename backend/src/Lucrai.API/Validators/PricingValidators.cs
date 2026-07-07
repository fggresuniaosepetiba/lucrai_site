using FluentValidation;
using Lucrai.Core.DTOs.Pricing;

namespace Lucrai.API.Validators;

public class CreatePricingRequestValidator : AbstractValidator<CreatePricingRequest>
{
    public CreatePricingRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Sku).MaximumLength(64).When(x => x.Sku != null);
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description != null);
        RuleFor(x => x.RawMaterial).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Packaging).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Labor).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Freight).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OtherCosts).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Taxes).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CardFee).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MarketplaceFee).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Commission).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OtherFees).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DesiredMargin).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public class UpdatePricingRequestValidator : AbstractValidator<UpdatePricingRequest>
{
    public UpdatePricingRequestValidator()
    {
        RuleFor(x => x.Name).MaximumLength(256).When(x => x.Name != null);
        RuleFor(x => x.Category).MaximumLength(128).When(x => x.Category != null);
        RuleFor(x => x.Sku).MaximumLength(64).When(x => x.Sku != null);
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description != null);
        When(x => x.RawMaterial.HasValue, () => RuleFor(x => x.RawMaterial!.Value).GreaterThanOrEqualTo(0));
        When(x => x.Packaging.HasValue, () => RuleFor(x => x.Packaging!.Value).GreaterThanOrEqualTo(0));
        When(x => x.Labor.HasValue, () => RuleFor(x => x.Labor!.Value).GreaterThanOrEqualTo(0));
        When(x => x.Freight.HasValue, () => RuleFor(x => x.Freight!.Value).GreaterThanOrEqualTo(0));
        When(x => x.OtherCosts.HasValue, () => RuleFor(x => x.OtherCosts!.Value).GreaterThanOrEqualTo(0));
        When(x => x.Taxes.HasValue, () => RuleFor(x => x.Taxes!.Value).GreaterThanOrEqualTo(0));
        When(x => x.CardFee.HasValue, () => RuleFor(x => x.CardFee!.Value).GreaterThanOrEqualTo(0));
        When(x => x.MarketplaceFee.HasValue, () => RuleFor(x => x.MarketplaceFee!.Value).GreaterThanOrEqualTo(0));
        When(x => x.Commission.HasValue, () => RuleFor(x => x.Commission!.Value).GreaterThanOrEqualTo(0));
        When(x => x.OtherFees.HasValue, () => RuleFor(x => x.OtherFees!.Value).GreaterThanOrEqualTo(0));
        When(x => x.DesiredMargin.HasValue, () => RuleFor(x => x.DesiredMargin!.Value).GreaterThan(0).LessThanOrEqualTo(100));
    }
}
