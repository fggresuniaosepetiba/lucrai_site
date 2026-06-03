"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { CategoryRepository } from "@/database/repositories/categories";
import { useAuthStore } from "@/store/auth-store";
import type { Transaction, Category } from "@/types";
import { formatCurrencyInput, parseCurrencyInput, valorPorExtenso, validateTransactionDate } from "@/lib/utils";
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

export function TransactionForm({
  transaction,
  categories,
  onCreateCategory,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const { user } = useAuthStore();
  const company = user?.company ?? "";
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type || "expense"
  );
  const [valueDisplay, setValueDisplay] = useState(
    transaction ? formatCurrencyInput(String(Math.round(transaction.value * 100))) : ""
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().slice(0, 10)
  );
  const [observation, setObservation] = useState(transaction?.observation || "");
  const [submitting, setSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (company) {
      CategoryRepository.getAll(company).then((cats) => {
        if (cats.length > 0) setLocalCategories(cats);
      });
    }
  }, [company]);

  const filteredCategories = localCategories.filter((c) => c.type === type);

  const amountValue = valueDisplay ? parseCurrencyInput(valueDisplay) : 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = "Campo obrigatório";
    if (!valueDisplay) errs.value = "Campo obrigatório";
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
      return;
    }
    setValueDisplay(formatCurrencyInput(digits));
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
              variant={type === "expense" ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleTypeChange("expense")}
              className="flex-1"
            >
              Saída
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange("income")}
              className="flex-1"
            >
              Entrada
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
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-400" : ""}
            />
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
            ) : (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria cadastrada para {type === "income" ? "Entrada" : "Saída"}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Crie uma nova categoria na página{" "}
                  <Link href="/categories" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                    Categorias
                  </Link>.
                </p>
              </div>
            )}
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
              {submitting ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
