"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Combobox } from "@/components/ui/combobox";
import { formatCurrency } from "@/lib/utils";
import { InsumoRepositoryApi } from "@/services/api-repositories/insumos";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, Package, X, FileText } from "lucide-react";
import type { Insumo, FichaTecnicaItem, UnidadeMedida } from "@/types";
import { UNIDADES_MEDIDA, UNIDADES_MEDIDA_LABELS, COMPATIBLE_UNITS, getConversionFactor } from "@/types";

interface Props {
  onApply: (totalCost: number) => void;
}

function cleanModalState() {
  return {
    insumos: [] as Insumo[],
    selectedInsumoId: "",
    quantidadeUtilizada: 0,
    consumoUnidade: "unidade" as UnidadeMedida,
    items: [] as FichaTecnicaItem[],
    showQuickForm: false,
    quickNome: "",
    quickCategoria: "",
    quickUnidade: "unidade" as UnidadeMedida,
    quickQuantidade: 0,
    quickValor: 0,
  };
}

export function TechnicalSheetModal({ onApply }: Props) {
  const { user } = useAuthStore();
  const company = user?.company ?? "";

  const [open, setOpen] = useState(false);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [selectedInsumoId, setSelectedInsumoId] = useState("");
  const [quantidadeUtilizada, setQuantidadeUtilizada] = useState(0);
  const [consumoUnidade, setConsumoUnidade] = useState<UnidadeMedida>("unidade");
  const [items, setItems] = useState<FichaTecnicaItem[]>([]);

  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickNome, setQuickNome] = useState("");
  const [quickCategoria, setQuickCategoria] = useState("");
  const [quickUnidade, setQuickUnidade] = useState<UnidadeMedida>("unidade");
  const [quickQuantidade, setQuickQuantidade] = useState(0);
  const [quickValor, setQuickValor] = useState(0);

  const loadInsumos = useCallback(async () => {
    if (!company) return;
    const all = await InsumoRepositoryApi.getAll();
    setInsumos(all);
  }, [company]);

  useEffect(() => {
    if (open) loadInsumos();
  }, [open, loadInsumos]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      const clean = cleanModalState();
      setSelectedInsumoId(clean.selectedInsumoId);
      setQuantidadeUtilizada(clean.quantidadeUtilizada);
      setConsumoUnidade(clean.consumoUnidade);
      setItems(clean.items);
      setShowQuickForm(clean.showQuickForm);
      setQuickNome(clean.quickNome);
      setQuickCategoria(clean.quickCategoria);
      setQuickUnidade(clean.quickUnidade);
      setQuickQuantidade(clean.quickQuantidade);
      setQuickValor(clean.quickValor);
    }
  };

  const insumoOptions = insumos.map((i) => ({
    value: i.id,
    label: `${i.nome} — ${UNIDADES_MEDIDA_LABELS[i.unidadeMedida]}`,
  }));

  const selectedInsumo = insumos.find(i => i.id === selectedInsumoId);

  // Reset consumoUnidade when insumo changes
  useEffect(() => {
    const insumo = insumos.find(i => i.id === selectedInsumoId);
    if (insumo) {
      setConsumoUnidade(insumo.unidadeMedida);
    }
  }, [selectedInsumoId, insumos]);

  const compatibleUnitOptions = selectedInsumo
    ? COMPATIBLE_UNITS[selectedInsumo.unidadeMedida].map((u) => ({
        value: u,
        label: UNIDADES_MEDIDA_LABELS[u],
      }))
    : [];

  const handleAddItem = () => {
    if (!selectedInsumo || quantidadeUtilizada <= 0) return;

    const factor = getConversionFactor(consumoUnidade, selectedInsumo.unidadeMedida);
    const quantidadeEmBase = quantidadeUtilizada * factor;

    const custoCalculado =
      selectedInsumo.quantidadeComprada > 0
        ? (quantidadeEmBase / selectedInsumo.quantidadeComprada) * selectedInsumo.valorPago
        : 0;

    setItems(prev => [
      ...prev,
      {
        insumoId: selectedInsumo.id,
        insumoNome: selectedInsumo.nome,
        unidadeMedida: selectedInsumo.unidadeMedida,
        consumoUnidadeMedida: consumoUnidade,
        quantidadeUtilizada,
        custoCalculado,
      },
    ]);

    setSelectedInsumoId("");
    setQuantidadeUtilizada(0);
    setConsumoUnidade("unidade");
  };

  const handleRemoveItem = (insumoId: string) => {
    setItems(prev => prev.filter(i => i.insumoId !== insumoId));
  };

  const totalFicha = items.reduce((sum, i) => sum + i.custoCalculado, 0);

  const handleQuickSave = async () => {
    if (!quickNome.trim() || quickQuantidade <= 0 || quickValor <= 0) {
      toast("Preencha todos os campos obrigatórios", undefined, "destructive");
      return;
    }
    try {
      await InsumoRepositoryApi.create({
        nome: quickNome.trim(),
        categoria: quickCategoria.trim(),
        unidadeMedida: quickUnidade,
        quantidadeComprada: quickQuantidade,
        valorPago: quickValor,
      });
      toast("Insumo cadastrado com sucesso!", undefined, "success");
      setShowQuickForm(false);
      setQuickNome("");
      setQuickCategoria("");
      setQuickUnidade("unidade");
      setQuickQuantidade(0);
      setQuickValor(0);
      loadInsumos();
    } catch {
      toast("Erro ao cadastrar insumo", undefined, "destructive");
    }
  };

  const handleApply = () => {
    onApply(totalFicha);
    setOpen(false);
    const clean = cleanModalState();
    setSelectedInsumoId(clean.selectedInsumoId);
    setQuantidadeUtilizada(clean.quantidadeUtilizada);
    setConsumoUnidade(clean.consumoUnidade);
    setItems(clean.items);
    setShowQuickForm(clean.showQuickForm);
    setQuickNome(clean.quickNome);
    setQuickCategoria(clean.quickCategoria);
    setQuickUnidade(clean.quickUnidade);
    setQuickQuantidade(clean.quickQuantidade);
    setQuickValor(clean.quickValor);
  };

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
    const parsed = parseFloat(val);
    setQuantidadeUtilizada(isNaN(parsed) ? 0 : parsed);
  };

  const button = (
    <Button type="button" variant="outline" size="sm" className="w-8 px-0 shrink-0" title="Montar Ficha Técnica">
      <FileText className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {button}
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Ficha Técnica do Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-[3] space-y-1">
              <Label className="text-xs text-muted-foreground">Insumo</Label>
              <Combobox
                options={insumoOptions}
                value={selectedInsumoId}
                onValueChange={setSelectedInsumoId}
                placeholder="Selecione um insumo..."
                searchPlaceholder="Pesquisar insumo..."
                emptyText="Nenhum insumo encontrado."
              />
            </div>
            <div className="w-28 space-y-1">
              <Label className="text-xs text-muted-foreground">Quantidade</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={quantidadeUtilizada > 0 ? quantidadeUtilizada : ""}
                onChange={handleQuantidadeChange}
                placeholder="0"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            {selectedInsumo && compatibleUnitOptions.length > 1 && (
              <div className="w-32 space-y-1">
                <Label className="text-xs text-muted-foreground">Unidade</Label>
                <Combobox
                  options={compatibleUnitOptions}
                  value={consumoUnidade}
                  onValueChange={(v: string) => setConsumoUnidade(v as UnidadeMedida)}
                  placeholder="Unidade..."
                  searchPlaceholder="Pesquisar..."
                  emptyText="Nenhuma"
                />
              </div>
            )}
            <div className="flex items-end gap-1">
              <Button
                type="button"
                size="sm"
                onClick={handleAddItem}
                disabled={!selectedInsumoId || quantidadeUtilizada <= 0}
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            </div>
          </div>

          {selectedInsumo && (
            <p className="text-xs text-muted-foreground animate-fade-in">
              Custo por {UNIDADES_MEDIDA_LABELS[selectedInsumo.unidadeMedida]}: {formatCurrency(selectedInsumo.custoPorUnidade)}
              {" · "}Saldo: {selectedInsumo.quantidadeComprada} {UNIDADES_MEDIDA_LABELS[selectedInsumo.unidadeMedida]}
            </p>
          )}

          {items.length > 0 && (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Insumo</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Quantidade</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Custo</th>
                    <th className="w-8 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.insumoId} className="border-b border-border/30 last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium">{item.insumoNome}</p>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {item.quantidadeUtilizada} {UNIDADES_MEDIDA_LABELS[item.consumoUnidadeMedida]}
                      </td>
                      <td className="px-3 py-2 font-semibold">{formatCurrency(item.custoCalculado)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleRemoveItem(item.insumoId)}
                          className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center px-3 py-2 border-t border-border/50 bg-muted/20">
                <span className="text-sm font-semibold">Total da Ficha Técnica</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(totalFicha)}</span>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Package className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum insumo adicionado</p>
              <p className="text-xs text-muted-foreground/60">Selecione um insumo e informe a quantidade utilizada.</p>
            </div>
          )}

          <div className="border-t border-border/50 pt-3">
            {showQuickForm ? (
              <div className="space-y-3 animate-fade-in p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Novo Insumo</p>
                  <button
                    onClick={() => setShowQuickForm(false)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nome *</Label>
                    <Input
                      placeholder="Ex.: Farinha de Trigo"
                      value={quickNome}
                      onChange={(e) => setQuickNome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Categoria</Label>
                    <Input
                      placeholder="Ex.: Farinhas"
                      value={quickCategoria}
                      onChange={(e) => setQuickCategoria(e.target.value)}
                    />
                  </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unidade *</Label>
                      <Combobox
                        options={UNIDADES_MEDIDA.map((u) => ({ value: u, label: UNIDADES_MEDIDA_LABELS[u] }))}
                        value={quickUnidade}
                        onValueChange={(v: string) => setQuickUnidade(v as UnidadeMedida)}
                        placeholder="Selecione..."
                        searchPlaceholder="Pesquisar unidade..."
                        emptyText="Nenhuma unidade encontrada."
                      />
                    </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Qtd comprada *</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={quickQuantidade > 0 ? quickQuantidade : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                        setQuickQuantidade(val ? parseFloat(val) : 0);
                      }}
                      placeholder="0"
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs text-muted-foreground">Valor pago *</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={quickValor > 0 ? formatCurrency(quickValor) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        if (raw) { const p = parseInt(raw); if (p > 99999999) return; setQuickValor(p / 100); } else { setQuickValor(0); }
                      }}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
                <Button type="button" size="sm" onClick={handleQuickSave} className="w-full">
                  Salvar Insumo
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickForm(true)}
                className="w-full gap-2 text-muted-foreground"
              >
                <Plus className="h-4 w-4" /> Cadastrar novo insumo
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-2">
          <p className="text-xs text-muted-foreground">{items.length} insumo{items.length !== 1 ? "s" : ""} adicionado{items.length !== 1 ? "s" : ""}</p>
          <Button
            type="button"
            onClick={handleApply}
            disabled={items.length === 0}
          >
            Aplicar à Calculadora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
