using FluentValidation;
using Lucrai.Core.DTOs.Recibos;

namespace Lucrai.API.Validators;

public class CreateReciboRequestValidator : AbstractValidator<CreateReciboRequest>
{
    public CreateReciboRequestValidator()
    {
        RuleFor(x => x.Tipo).NotEmpty().Must(t => t == "Recebimento" || t == "Pagamento");
        RuleFor(x => x.Origem).NotEmpty().Must(o => o == "Manual" || o == "Lancamento");
        RuleFor(x => x.Data).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Valor).GreaterThan(0);
        RuleFor(x => x.NomePagador).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DocumentoPagador).MaximumLength(20);
        RuleFor(x => x.NomeRecebedor).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DocumentoRecebedor).MaximumLength(20);
        RuleFor(x => x.Referente).NotEmpty().MaximumLength(500);
        RuleFor(x => x.FormaPagamento).MaximumLength(50);
        RuleFor(x => x.Observacoes).MaximumLength(1000);
        RuleFor(x => x.Telefone).MaximumLength(20);
        RuleFor(x => x.Email).MaximumLength(200);
        RuleFor(x => x.Cidade).MaximumLength(100);
        RuleFor(x => x.Estado).MaximumLength(2);
        RuleFor(x => x.CriadoPor).NotEmpty().MaximumLength(200);
    }
}

public class UpdateReciboRequestValidator : AbstractValidator<UpdateReciboRequest>
{
    public UpdateReciboRequestValidator()
    {
        When(x => x.Tipo != null, () => RuleFor(x => x.Tipo!).Must(t => t == "Recebimento" || t == "Pagamento"));
        When(x => x.Data != null, () => RuleFor(x => x.Data!).MaximumLength(10));
        When(x => x.Valor.HasValue, () => RuleFor(x => x.Valor!).GreaterThan(0));
        When(x => x.NomePagador != null, () => RuleFor(x => x.NomePagador!).MaximumLength(200));
        When(x => x.DocumentoPagador != null, () => RuleFor(x => x.DocumentoPagador!).MaximumLength(20));
        When(x => x.NomeRecebedor != null, () => RuleFor(x => x.NomeRecebedor!).MaximumLength(200));
        When(x => x.DocumentoRecebedor != null, () => RuleFor(x => x.DocumentoRecebedor!).MaximumLength(20));
        When(x => x.Referente != null, () => RuleFor(x => x.Referente!).MaximumLength(500));
        When(x => x.FormaPagamento != null, () => RuleFor(x => x.FormaPagamento!).MaximumLength(50));
        When(x => x.Observacoes != null, () => RuleFor(x => x.Observacoes!).MaximumLength(1000));
        When(x => x.Telefone != null, () => RuleFor(x => x.Telefone!).MaximumLength(20));
        When(x => x.Email != null, () => RuleFor(x => x.Email!).MaximumLength(200));
        When(x => x.Cidade != null, () => RuleFor(x => x.Cidade!).MaximumLength(100));
        When(x => x.Estado != null, () => RuleFor(x => x.Estado!).MaximumLength(2));
    }
}

public class CancelarReciboRequestValidator : AbstractValidator<CancelarReciboRequest>
{
    public CancelarReciboRequestValidator()
    {
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(500);
    }
}

public class CreateAuditRequestValidator : AbstractValidator<CreateAuditRequest>
{
    public CreateAuditRequestValidator()
    {
        RuleFor(x => x.Action).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.User).NotEmpty().MaximumLength(200);
    }
}
