"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InsumoRepositoryApi } from "@/services/api-repositories/insumos";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import type { Insumo, UnidadeMedida } from "@/types";
import { UNIDADES_MEDIDA, UNIDADES_MEDIDA_LABELS } from "@/types";
import { Package, Plus, Trash2, Pencil, X, Check, Search, AlertTriangle } from "lucide-react";

export default function InsumosPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const company = user?.company ?? "";
  const [loading, setLoading] = useState(true);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Insumo | null>(null);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState<UnidadeMedida>("unidade");
  const [quantidade, setQuantidade] = useState(0);
  const [valor, setValor] = useState(0);
  const [valorDisplay, setValorDisplay] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadInsumos();
  }, [isAuthenticated, router, company]);

  useEffect(() => {
    if (valor <= 0) { setValorDisplay(""); return; }
    setValorDisplay(formatCurrency(valor));
  }, [valor]);

  const loadInsumos = async () => {
    try {
      const all = await InsumoRepositoryApi.getAll(company);
      setInsumos(all);
    } catch (err) {
      console.error("Error loading insumos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsumos = searchQuery
    ? insumos.filter(
        (i) =>
          i.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.categoria.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : insumos;

  const resetForm = () => {
    setNome("");
    setCategoria("");
    setUnidade("unidade");
    setQuantidade(0);
    setValor(0);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!nome.trim() || quantidade <= 0 || valor <= 0) {
      toast("Preencha todos os campos obrigatórios", undefined, "destructive");
      return;
    }

    try {
      if (editingId) {
        await InsumoRepositoryApi.update(editingId, {
          nome: nome.trim(),
          categoria: categoria.trim(),
          unidadeMedida: unidade,
          quantidadeComprada: quantidade,
          valorPago: valor,
        });
        toast("Insumo atualizado!", undefined, "success");
      } else {
        await InsumoRepositoryApi.create(
          {
            nome: nome.trim(),
            categoria: categoria.trim(),
            unidadeMedida: unidade,
            quantidadeComprada: quantidade,
            valorPago: valor,
          },
          company
        );
        toast("Insumo cadastrado!", undefined, "success");
      }
      resetForm();
      loadInsumos();
    } catch {
      toast("Erro ao salvar insumo", undefined, "destructive");
    }
  };

  const handleEdit = (insumo: Insumo) => {
    setNome(insumo.nome);
    setCategoria(insumo.categoria);
    setUnidade(insumo.unidadeMedida);
    setQuantidade(insumo.quantidadeComprada);
    setValor(insumo.valorPago);
    setEditingId(insumo.id);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await InsumoRepositoryApi.delete(deleteConfirm.id);
      toast("Insumo excluído", undefined, "success");
      loadInsumos();
    } catch {
      toast("Erro ao excluir insumo", undefined, "destructive");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-60 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Cadastro de Insumos</h2>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Insumo
          </Button>
        </div>

        {showForm && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{editingId ? "Editar Insumo" : "Novo Insumo"}</span>
                <button onClick={resetForm} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nome *</Label>
                  <Input
                    placeholder="Ex.: Farinha de Trigo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <Input
                    placeholder="Ex.: Farinhas"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Unidade de medida *</Label>
                  <Combobox
                    options={UNIDADES_MEDIDA.map((u) => ({ value: u, label: UNIDADES_MEDIDA_LABELS[u] }))}
                    value={unidade}
                    onValueChange={(v: string) => setUnidade(v as UnidadeMedida)}
                    placeholder="Selecione..."
                    searchPlaceholder="Pesquisar unidade..."
                    emptyText="Nenhuma unidade encontrada."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Quantidade comprada *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={quantidade > 0 ? quantidade : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                      setQuantidade(val ? parseFloat(val) : 0);
                    }}
                    placeholder="0"
                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                    }}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Valor pago *</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={valorDisplay}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      if (!raw) { setValorDisplay(""); setValor(0); return; }
                      const parsed = parseInt(raw);
                      if (parsed > 99999999) return;
                      const num = parsed / 100;
                      setValor(num);
                      setValorDisplay(formatCurrency(num));
                    }}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
              {quantidade > 0 && (
                <p className="text-xs text-muted-foreground">
                  Custo por {UNIDADES_MEDIDA_LABELS[unidade]}: {formatCurrency(valor / quantidade)}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleSave} className="gap-2">
                  <Check className="h-4 w-4" /> {editingId ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insumos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {filteredInsumos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Nenhum insumo encontrado" : "Nenhum insumo cadastrado"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {searchQuery ? "Tente outro termo de busca." : "Clique em \"Novo Insumo\" para começar."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredInsumos.map((insumo) => (
                  <div
                    key={insumo.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{insumo.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {insumo.categoria && `${insumo.categoria} · `}
                        {UNIDADES_MEDIDA_LABELS[insumo.unidadeMedida]} · Saldo: {insumo.quantidadeComprada}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(insumo.custoPorUnidade)}/{UNIDADES_MEDIDA_LABELS[insumo.unidadeMedida]}</p>
                      <p className="text-xs text-muted-foreground">Total: {formatCurrency(insumo.valorPago)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(insumo)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(insumo)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="pt-3">
                <p className="text-sm text-foreground mb-2">
                  Deseja realmente excluir este insumo?
                </p>
                <p className="text-xs text-muted-foreground">
                  Esta ação poderá impactar fichas técnicas que utilizam este item.
                </p>
                {deleteConfirm && (
                  <p className="text-sm font-medium mt-2 text-foreground">
                    {deleteConfirm.nome}
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
