"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FixedCostsRepository } from "@/database/repositories/fixed-costs";
import { toast } from "@/components/ui/toast";
import { formatCurrency, generateId } from "@/lib/utils";
import type { FixedCostField, CustomCostItem } from "@/types";
import { FIXED_COST_FIELDS, FIXED_COST_LABELS } from "@/types";
import { Building2, Save, DollarSign, Plus, Trash2, Pencil, X } from "lucide-react";

export default function FixedCostsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const company = user?.company ?? "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<FixedCostField, number>>(() => {
    const initial: Record<string, number> = {};
    for (const f of FIXED_COST_FIELDS) initial[f] = 0;
    return initial as Record<FixedCostField, number>;
  });
  const [customCosts, setCustomCosts] = useState<CustomCostItem[]>([]);
  const [originalValues, setOriginalValues] = useState<Record<FixedCostField, number>>(() => {
    const initial: Record<string, number> = {};
    for (const f of FIXED_COST_FIELDS) initial[f] = 0;
    return initial as Record<FixedCostField, number>;
  });
  const [originalCustomCosts, setOriginalCustomCosts] = useState<CustomCostItem[]>([]);

  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomValue, setNewCustomValue] = useState(0);
  const [newCustomDisplay, setNewCustomDisplay] = useState("");
  const [showNewCustom, setShowNewCustom] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, router, company]);

  const loadData = async () => {
    try {
      const data = await FixedCostsRepository.getByCompany(company);
      if (data) {
        const vals: Record<string, number> = {};
        for (const f of FIXED_COST_FIELDS) vals[f] = data[f] || 0;
        setValues(vals as Record<FixedCostField, number>);
        setOriginalValues(vals as Record<FixedCostField, number>);
        setCustomCosts(data.customCosts ?? []);
        setOriginalCustomCosts(data.customCosts ?? []);
      } else {
        const initial: Record<string, number> = {};
        for (const f of FIXED_COST_FIELDS) initial[f] = 0;
        setValues(initial as Record<FixedCostField, number>);
        setOriginalValues(initial as Record<FixedCostField, number>);
      }
    } catch (err) {
      console.error("Error loading fixed costs:", err);
    } finally {
      setLoading(false);
    }
  };

  const valuesChanged = FIXED_COST_FIELDS.some((f) => values[f] !== originalValues[f]);
  const customChanged = customCosts.length !== originalCustomCosts.length ||
    customCosts.some((c, i) => c.name !== originalCustomCosts[i]?.name || c.value !== originalCustomCosts[i]?.value);
  const hasChanges = isEditing && (valuesChanged || customChanged);

  const customCostsTotal = customCosts.reduce((sum, c) => sum + c.value, 0);
  const total = FIXED_COST_FIELDS.reduce((sum, f) => sum + values[f], 0) + customCostsTotal;

  const handleValueChange = (field: FixedCostField, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits && parseInt(digits) > 99999999) return;
    const num = digits ? parseInt(digits) / 100 : 0;
    setValues((prev) => ({ ...prev, [field]: num }));
  };

  const handleSave = async () => {
    if (!company || !isEditing) return;
    setSaving(true);
    try {
      await FixedCostsRepository.upsert({
        company,
        aluguel: values.aluguel,
        energia: values.energia,
        agua: values.agua,
        internet: values.internet,
        contador: values.contador,
        proLabore: values.proLabore,
        softwares: values.softwares,
        telefone: values.telefone,
        marketing: values.marketing,
        limpeza: values.limpeza,
        outros: values.outros,
        customCosts,
        total,
      });
      toast("Custos fixos salvos com sucesso!", undefined, "success");
      setIsEditing(false);
      setOriginalValues({ ...values });
      setOriginalCustomCosts([...customCosts]);
    } catch {
      toast("Erro ao salvar custos fixos", undefined, "destructive");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setValues({ ...originalValues });
    setCustomCosts([...originalCustomCosts]);
    setIsEditing(false);
    setShowNewCustom(false);
  };

  const handleAddCustom = () => {
    if (!newCustomName.trim() || newCustomValue <= 0) return;
    const item: CustomCostItem = {
      id: generateId(),
      name: newCustomName.trim(),
      value: newCustomValue,
    };
    setCustomCosts((prev) => [...prev, item]);
    setNewCustomName("");
    setNewCustomValue(0);
    setNewCustomDisplay("");
    setShowNewCustom(false);
  };

  const handleRemoveCustom = (id: string) => {
    setCustomCosts((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-72 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Custos Fixos da Empresa</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Custos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FIXED_COST_FIELDS.map((field) => (
              <div key={field} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{FIXED_COST_LABELS[field]}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values[field] > 0 ? formatCurrency(values[field]) : ""}
                  onChange={(e) => handleValueChange(field, e.target.value)}
                  placeholder="R$ 0,00"
                  disabled={!isEditing}
                  className="flex h-8 w-36 rounded-lg border border-input bg-background px-3 py-2 text-right text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            {customCosts.length > 0 && (
              <div className="border-t border-border/50 pt-3 mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Custos Personalizados</p>
                {customCosts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-sm text-muted-foreground">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(c.value)}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCustom(c.id)}
                          className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isEditing && showNewCustom ? (
              <div className="border-t border-border/50 pt-3 mt-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Nome do custo *</label>
                    <Input
                      placeholder="Ex.: Seguro"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                    />
                  </div>
                  <div className="w-36 space-y-1">
                    <label className="text-xs text-muted-foreground">Valor mensal *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newCustomDisplay}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        if (!raw) { setNewCustomDisplay(""); setNewCustomValue(0); return; }
                        const parsed = parseInt(raw);
                        if (parsed > 99999999) return;
                        const num = parsed / 100;
                        setNewCustomValue(num);
                        setNewCustomDisplay(formatCurrency(num));
                      }}
                      placeholder="R$ 0,00"
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-right text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="button" size="sm" onClick={handleAddCustom}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewCustom(true)}
                className="w-full gap-2 text-muted-foreground mt-2"
              >
                <Plus className="h-4 w-4" /> Novo custo fixo
              </Button>
            ) : null}

            <div className="border-t border-border/50 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">TOTAL MENSAL</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {isEditing ? (
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" /> Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end pt-3">
                <Button size="sm" onClick={handleEdit} className="gap-2">
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

