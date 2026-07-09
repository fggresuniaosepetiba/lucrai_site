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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryRepositoryApi } from "@/services/api-repositories/categories";
import type { Transaction, Category } from "@/types";
import { formatCurrencyInput, parseCurrencyInput, valorPorExtenso, validateTransactionDate, todayStr } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  onCreateCategory: (data: { name: string; type: "income" | "expense" }) => Promise<Category>;
  onSubmit: (data: {
    type: "income" | "expense";
    value: number;
    categoryId: string;
    categoryName: string;
    description: string;
    date: string;
    observation?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const MAX_DESC_LENGTH = 300;
const MAX_CAT_NAME_LENGTH = 120;
const MAX_VALUE_CENTS = 99999999999999;

export function TransactionForm({
  transaction,
  categories,
  onCreateCategory,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type || "income"
  );
  const [valueDisplay, setValueDisplay] = useState(
    transaction ? formatCurrencyInput(String(Math.round(transaction.value * 100))) : ""
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [date, setDate] = useState(
    transaction?.date || todayStr()
  );
  const [observation, setObservation] = useState(transaction?.observation || "");
  const [submitting, setSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    CategoryRepositoryApi.getAll().then((cats) => {
      if (cats.length > 0) setLocalCategories(cats);
    });
  }, []);

  const filteredCategories = localCategories.filter((c) => c.type === type);

  const amountValue = valueDisplay ? parseCurrencyInput(valueDisplay) : 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = "Campo obrigatório";
    if (!valueDisplay) {
      errs.value = "Campo obrigatório";
    } else {
      const parsedValue = parseCurrencyInput(valueDisplay);
      if (parsedValue > MAX_VALUE_CENTS / 100) {
        errs.value = "Limite máximo atingido.";
      }
    }
    if (!date) { errs.date = "Campo obrigatório"; } else {
      const dateCheck = validateTransactionDate(date);
      if (!dateCheck.valid) errs.date = dateCheck.message;
    }
    if (!categoryId) errs.category = "Campo obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      setValueDisplay("");
      setErrors((prev) => ({ ...prev, value: "" }));
      return;
    }
    const numericValue = parseInt(digits, 10);
    if (numericValue > MAX_VALUE_CENTS) {
      setErrors((prev) => ({
        ...prev,
        value: "Limite máximo atingido.",
      }));
      return;
    }
    setValueDisplay(formatCurrencyInput(digits));
    setErrors((prev) => ({ ...prev, value: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const selectedCat = categories.find((c) => c.id === categoryId);

    try {
      await onSubmit({
        type,
        value: amountValue,
        categoryId: categoryId,
        categoryName: selectedCat?.name || "Sem categoria",
        description: description.trim(),
        date,
        observation: observation || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategoryId("");
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setCreatingCategory(true);
    try {
      const created = await onCreateCategory({ name, type });
      setCategoryId(created.id);
      setNewCategoryName("");
      setShowCreateCategory(false);
      setNewCategoryError("");
      setErrors((prev) => ({ ...prev, category: "" }));
      toast("Categoria criada", "Categoria adicionada e selecionada", "success");
    } catch {
      toast("Erro", "Nao foi possivel criar categoria", "destructive");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? `Editar Lançamento ${transaction.displayId}` : "Novo Lançamento"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do lançamento financeiro
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange("income")}
              className="flex-1"
            >
              Entrada
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleTypeChange("expense")}
              className="flex-1"
            >
              Saída
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value" className="flex items-center gap-1">
                Valor (R$)
                <span className="text-red-400">*</span>
              </Label>
              <Input
                id="value"
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={valueDisplay ? `R$ ${valueDisplay}` : ""}
                onChange={handleValueChange}
                className={errors.value ? "border-red-400" : ""}
              />
              {errors.value && <p className="text-xs text-red-400">{errors.value}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                Data
                <span className="text-red-400">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? "border-red-400" : ""}
              />
              {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor-extenso">Valor por Extenso</Label>
            <Textarea
              id="valor-extenso"
              value={amountValue > 0 ? valorPorExtenso(amountValue) : ""}
              disabled
              readOnly
              rows={3}
              className="bg-muted/50 text-muted-foreground cursor-default resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              Descrição
              <span className="text-red-400">*</span>
            </Label>
            <Input
              id="description"
              placeholder="Ex: Venda de serviço"
              value={description}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= MAX_DESC_LENGTH) {
                  setDescription(val);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    description: "Limite máximo de 300 caracteres atingido.",
                  }));
                }
              }}
              className={errors.description ? "border-red-400" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {description.length} / {MAX_DESC_LENGTH} caracteres
            </p>
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-1">
              Categoria
              <span className="text-red-400">*</span>
            </Label>
            {filteredCategories.length > 0 ? (
              <Select
                key={type + (transaction?.id || "new")}
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setErrors((prev) => ({ ...prev, category: "" }));
                }}
              >
                <SelectTrigger className={errors.category ? "border-red-400" : ""}>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <div className="space-y-2">
              {showCreateCategory ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Nome da nova categoria"
                        value={newCategoryName}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.length <= MAX_CAT_NAME_LENGTH) {
                            setNewCategoryName(val);
                            if (val.length === MAX_CAT_NAME_LENGTH) {
                              setNewCategoryError("Limite máximo de 120 caracteres atingido.");
                            } else {
                              setNewCategoryError("");
                            }
                          }
                        }}
                        disabled={creatingCategory}
                      />
                      <p className="text-xs text-muted-foreground">
                        {newCategoryName.length} / {MAX_CAT_NAME_LENGTH} caracteres
                      </p>
                      {newCategoryError && <p className="text-xs text-red-400">{newCategoryError}</p>}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                    >
                      {creatingCategory ? "Criando..." : "Criar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                    onClick={() => { setShowCreateCategory(false); setNewCategoryName(""); setNewCategoryError(""); }}
                    disabled={creatingCategory}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowCreateCategory(true)}
                >
                  + Criar nova categoria
                </Button>
              )}
            </div>
            {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              id="observation"
              placeholder="Informações adicionais"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : transaction ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
