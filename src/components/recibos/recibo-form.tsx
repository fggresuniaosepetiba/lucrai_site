"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrencyInput, parseCurrencyInput, todayStr } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { valorPorExtenso } from "@/services/recibos/valorPorExtenso";
import { validarDocumento, formatarDocumento, validarEmail, detectarTipoDocumento } from "@/services/recibos/cpfCnpjValidator";
import type { ReciboTipo, ReciboOrigem, SignatureConfig } from "@/types";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const FORMAS_PAGAMENTO = ["Dinheiro", "PIX", "Transferência", "Boleto", "Cartão de Crédito", "Cartão de Débito", "Cheque", "Outro"];

export interface ReciboFormData {
  tipo: ReciboTipo;
  nomePagador: string;
  documentoPagador: string;
  semDocumentoPagador?: boolean;
  nomeRecebedor: string;
  documentoRecebedor: string;
  semDocumentoRecebedor?: boolean;
  data: string;
  valor: number;
  referente: string;
  formaPagamento?: string;
  observacoes?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  exibirAssinatura?: boolean;
  parcelaAtual?: number;
  parcelasTotal?: number;
  lancamentoId?: string;
}

interface ReciboFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReciboFormData, criarLancamento: boolean) => Promise<void>;
  prefill?: Partial<ReciboFormData>;
  assinatura?: SignatureConfig | null;
}

export function ReciboForm({ open, onClose, onSubmit, prefill, assinatura }: ReciboFormProps) {
  const [tipo, setTipo] = useState<ReciboTipo>("recebimento");
  const [nomePagador, setNomePagador] = useState("");
  const [documentoPagador, setDocumentoPagador] = useState("");
  const [semDocumentoPagador, setSemDocumentoPagador] = useState(false);
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [documentoRecebedor, setDocumentoRecebedor] = useState("");
  const [semDocumentoRecebedor, setSemDocumentoRecebedor] = useState(false);
  const [data, setData] = useState(todayStr());
  const [valorDisplay, setValorDisplay] = useState("");
  const [referente, setReferente] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [exibirAssinatura, setExibirAssinatura] = useState(true);
  const [parcelaAtual, setParcelaAtual] = useState("");
  const [parcelasTotal, setParcelasTotal] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showCriarLancamento, setShowCriarLancamento] = useState(false);

  useEffect(() => {
    if (open && prefill) {
      if (prefill.tipo) setTipo(prefill.tipo);
      if (prefill.nomePagador !== undefined) setNomePagador(prefill.nomePagador);
      if (prefill.documentoPagador !== undefined) setDocumentoPagador(prefill.documentoPagador);
      if (prefill.semDocumentoPagador !== undefined) setSemDocumentoPagador(prefill.semDocumentoPagador);
      if (prefill.nomeRecebedor !== undefined) setNomeRecebedor(prefill.nomeRecebedor);
      if (prefill.documentoRecebedor !== undefined) setDocumentoRecebedor(prefill.documentoRecebedor);
      if (prefill.semDocumentoRecebedor !== undefined) setSemDocumentoRecebedor(prefill.semDocumentoRecebedor);
      if (prefill.data) setData(prefill.data);
      if (prefill.valor) setValorDisplay(formatCurrencyInput(String(Math.round(prefill.valor * 100))));
      if (prefill.referente !== undefined) setReferente(prefill.referente);
      if (prefill.formaPagamento !== undefined) setFormaPagamento(prefill.formaPagamento);
      if (prefill.observacoes !== undefined) setObservacoes(prefill.observacoes);
      if (prefill.telefone !== undefined) setTelefone(prefill.telefone);
      if (prefill.email !== undefined) setEmail(prefill.email);
      if (prefill.cidade !== undefined) setCidade(prefill.cidade);
      if (prefill.estado !== undefined) setEstado(prefill.estado);
      if (prefill.exibirAssinatura !== undefined) setExibirAssinatura(prefill.exibirAssinatura);
      if (prefill.parcelaAtual !== undefined) setParcelaAtual(String(prefill.parcelaAtual));
      if (prefill.parcelasTotal !== undefined) setParcelasTotal(String(prefill.parcelasTotal));
      setShowCriarLancamento(false);
    }
  }, [open, prefill]);

  const handleClose = () => {
    setErrors({});
    setSubmitting(false);
    setShowCriarLancamento(false);
    setSemDocumentoPagador(false);
    setSemDocumentoRecebedor(false);
    onClose();
  };

  const amountValue = valorDisplay ? parseCurrencyInput(valorDisplay) : 0;

  const handleDocumentoChange = (value: string, campo: "pagador" | "recebedor") => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    const setter = campo === "pagador" ? setDocumentoPagador : setDocumentoRecebedor;
    setter(digits);
    setErrors((prev) => ({ ...prev, [`documento${campo === "pagador" ? "Pagador" : "Recebedor"}`]: "" }));
  };

  const handleDocumentoPaste = (e: React.ClipboardEvent<HTMLInputElement>, campo: "pagador" | "recebedor") => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, 14);
    const setter = campo === "pagador" ? setDocumentoPagador : setDocumentoRecebedor;
    setter(digits);
    setErrors((prev) => ({ ...prev, [`documento${campo === "pagador" ? "Pagador" : "Recebedor"}`]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!nomePagador.trim()) errs.nomePagador = "Campo obrigatório";
    if (!semDocumentoPagador) {
      if (!documentoPagador.trim()) {
        errs.documentoPagador = "Campo obrigatório";
      } else {
        const val = validarDocumento(documentoPagador);
        if (!val.valido) errs.documentoPagador = val.mensagem;
      }
    }

    if (!nomeRecebedor.trim()) errs.nomeRecebedor = "Campo obrigatório";
    if (!semDocumentoRecebedor) {
      if (!documentoRecebedor.trim()) {
        errs.documentoRecebedor = "Campo obrigatório";
      } else {
        const val = validarDocumento(documentoRecebedor);
        if (!val.valido) errs.documentoRecebedor = val.mensagem;
      }
    }

    if (!data) errs.data = "Campo obrigatório";

    if (!valorDisplay) {
      errs.valor = "Campo obrigatório";
    } else {
      const parsed = parseCurrencyInput(valorDisplay);
      if (parsed <= 0) errs.valor = "O valor deve ser maior que zero.";
    }

    if (!referente.trim()) errs.referente = "Campo obrigatório";

    if (email && !validarEmail(email)) errs.email = "E-mail inválido.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      setValorDisplay("");
      return;
    }
    setValorDisplay(formatCurrencyInput(digits));
    setErrors((prev) => ({ ...prev, valor: "" }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 11) {
      let formatted = digits;
      if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      setTelefone(formatted);
    }
  };

  const handleSubmit = async (criarLancamentoOverride?: boolean) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData: ReciboFormData = {
        tipo,
        nomePagador: nomePagador.trim(),
        documentoPagador: semDocumentoPagador ? "" : formatarDocumento(documentoPagador),
        semDocumentoPagador,
        nomeRecebedor: nomeRecebedor.trim(),
        documentoRecebedor: semDocumentoRecebedor ? "" : formatarDocumento(documentoRecebedor),
        semDocumentoRecebedor,
        data: data,
        valor: amountValue,
        referente: referente.trim(),
        formaPagamento: formaPagamento || undefined,
        observacoes: observacoes.trim() || undefined,
        telefone: telefone || undefined,
        email: email.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado || undefined,
        exibirAssinatura,
        parcelaAtual: parcelaAtual ? parseInt(parcelaAtual, 10) : undefined,
        parcelasTotal: parcelasTotal ? parseInt(parcelasTotal, 10) : undefined,
        lancamentoId: prefill?.lancamentoId,
      };
      await onSubmit(formData, criarLancamentoOverride ?? showCriarLancamento);
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveClick = () => {
    if (!validate()) return;
    if (!prefill?.lancamentoId) {
      setShowCriarLancamento(true);
    } else {
      handleSubmit();
    }
  };

  const handleSaveWithLancamento = (criar: boolean) => {
    handleSubmit(criar);
  };

  const getDocumentoPreview = (documento: string) => {
    const digits = documento.replace(/\D/g, "");
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return documento;
  };

  const inputStyle = (field: string) => (errors[field] ? "border-red-400" : "");

  return (
    <>
      <Dialog open={open && !showCriarLancamento} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[680px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Recibo</DialogTitle>
            <DialogDescription>Preencha os dados do recibo profissional</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex gap-3">
              <Button
                type="button"
                variant={tipo === "recebimento" ? "default" : "outline"}
                size="sm"
                onClick={() => { setTipo("recebimento"); setErrors({}); }}
                className="flex-1 h-auto py-3"
              >
                <div className="text-center">
                  <p className="font-semibold">RECIBO DE RECEBIMENTO</p>
                  <p className="text-[10px] opacity-80">A empresa RECEBEU dinheiro</p>
                </div>
              </Button>
              <Button
                type="button"
                variant={tipo === "pagamento" ? "destructive" : "outline"}
                size="sm"
                onClick={() => { setTipo("pagamento"); setErrors({}); }}
                className="flex-1 h-auto py-3"
              >
                <div className="text-center">
                  <p className="font-semibold">RECIBO DE PAGAMENTO</p>
                  <p className="text-[10px] opacity-80">A empresa PAGOU alguém</p>
                </div>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomePagador" className="flex items-center gap-1">
                  Nome do Pagador
                  <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nomePagador"
                  placeholder="Nome completo"
                  value={nomePagador}
                  onChange={(e) => { setNomePagador(e.target.value); setErrors((p) => ({ ...p, nomePagador: "" })); }}
                  className={inputStyle("nomePagador")}
                />
                {errors.nomePagador && <p className="text-xs text-red-400">{errors.nomePagador}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentoPagador" className="flex items-center gap-1">
                  CPF/CNPJ do Pagador {!semDocumentoPagador && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="documentoPagador"
                  placeholder="999.999.999-99"
                  value={getDocumentoPreview(documentoPagador)}
                  onChange={(e) => handleDocumentoChange(e.target.value, "pagador")}
                  onPaste={(e) => handleDocumentoPaste(e, "pagador")}
                  disabled={semDocumentoPagador}
                  className={`${semDocumentoPagador ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""} ${inputStyle("documentoPagador")}`}
                />
                {errors.documentoPagador && <p className="text-xs text-red-400">{errors.documentoPagador}</p>}
                {!semDocumentoPagador && documentoPagador.replace(/\D/g, "").length > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {detectarTipoDocumento(documentoPagador) === "cpf" ? "CPF detectado" : "CNPJ detectado"}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="semDocumentoPagador"
                    checked={semDocumentoPagador}
                    onCheckedChange={(checked) => {
                      setSemDocumentoPagador(!!checked);
                      if (checked) setDocumentoPagador("");
                    }}
                  />
                  <Label htmlFor="semDocumentoPagador" className="text-xs cursor-pointer font-normal">
                    Não informar
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeRecebedor" className="flex items-center gap-1">
                  Nome do Recebedor
                  <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nomeRecebedor"
                  placeholder="Nome completo"
                  value={nomeRecebedor}
                  onChange={(e) => { setNomeRecebedor(e.target.value); setErrors((p) => ({ ...p, nomeRecebedor: "" })); }}
                  className={inputStyle("nomeRecebedor")}
                />
                {errors.nomeRecebedor && <p className="text-xs text-red-400">{errors.nomeRecebedor}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentoRecebedor" className="flex items-center gap-1">
                  CPF/CNPJ do Recebedor {!semDocumentoRecebedor && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="documentoRecebedor"
                  placeholder="99.999.999/9999-99"
                  value={getDocumentoPreview(documentoRecebedor)}
                  onChange={(e) => handleDocumentoChange(e.target.value, "recebedor")}
                  onPaste={(e) => handleDocumentoPaste(e, "recebedor")}
                  disabled={semDocumentoRecebedor}
                  className={`${semDocumentoRecebedor ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""} ${inputStyle("documentoRecebedor")}`}
                />
                {errors.documentoRecebedor && <p className="text-xs text-red-400">{errors.documentoRecebedor}</p>}
                {!semDocumentoRecebedor && documentoRecebedor.replace(/\D/g, "").length > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {detectarTipoDocumento(documentoRecebedor) === "cpf" ? "CPF detectado" : "CNPJ detectado"}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="semDocumentoRecebedor"
                    checked={semDocumentoRecebedor}
                    onCheckedChange={(checked) => {
                      setSemDocumentoRecebedor(!!checked);
                      if (checked) setDocumentoRecebedor("");
                    }}
                  />
                  <Label htmlFor="semDocumentoRecebedor" className="text-xs cursor-pointer font-normal">
                    Não informar
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-1">
                  Data <span className="text-red-400">*</span>
                </Label>
                <DatePicker
                  id="data"
                  value={data}
                  onChange={(v) => { setData(v); setErrors((p) => ({ ...p, data: "" })); }}
                  error={errors.data}
                  disabled={{ after: new Date() }}
                />
                {errors.data && <p className="text-xs text-red-400">{errors.data}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor" className="flex items-center gap-1">
                  Valor (R$) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="valor"
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={valorDisplay ? `R$ ${valorDisplay}` : ""}
                  onChange={handleValueChange}
                  className={inputStyle("valor")}
                />
                {errors.valor && <p className="text-xs text-red-400">{errors.valor}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor-extenso">Valor por Extenso</Label>
              <Textarea
                id="valor-extenso"
                value={amountValue > 0 ? valorPorExtenso(amountValue) : ""}
                disabled
                readOnly
                rows={2}
                className="bg-muted/50 text-muted-foreground cursor-default resize-none leading-relaxed min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referente" className="flex items-center gap-1">
                Referente a <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="referente"
                placeholder="Descrição do serviço, produto ou motivo"
                value={referente}
                onChange={(e) => { setReferente(e.target.value); setErrors((p) => ({ ...p, referente: "" })); }}
                rows={2}
                className={inputStyle("referente")}
              />
              {errors.referente && <p className="text-xs text-red-400">{errors.referente}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger id="formaPagamento">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={handleTelefoneChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  className={inputStyle("email")}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecionar UF" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parcelaAtual">Parcela atual</Label>
                <Input
                  id="parcelaAtual"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 1"
                  value={parcelaAtual}
                  onChange={(e) => setParcelaAtual(e.target.value.replace(/\D/g, ""))}
                  className="[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parcelasTotal">Total de parcelas</Label>
                <Input
                  id="parcelasTotal"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 12"
                  value={parcelasTotal}
                  onChange={(e) => setParcelasTotal(e.target.value.replace(/\D/g, ""))}
                  className="[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                />
              </div>
            </div>

            {assinatura?.permitirUso && (
              <div className="flex items-center gap-3">
                <Switch
                  id="exibirAssinatura"
                  checked={exibirAssinatura}
                  onCheckedChange={setExibirAssinatura}
                />
                <Label htmlFor="exibirAssinatura" className="cursor-pointer">
                  Exibir assinatura neste recibo
                </Label>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais (opcional)"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveClick} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Recibo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCriarLancamento} onOpenChange={(open) => { if (!open) setShowCriarLancamento(false); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Gerar Lançamento Financeiro?</DialogTitle>
            <DialogDescription>
              Deseja gerar automaticamente um lançamento financeiro com base neste recibo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleSaveWithLancamento(false)}>
              Não, apenas o recibo
            </Button>
            <Button onClick={() => handleSaveWithLancamento(true)}>
              Sim, criar lançamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
