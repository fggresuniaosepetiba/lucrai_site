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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction, Category } from "@/types";

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export function TransactionForm({
  transaction,
  categories,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type || "expense"
  );
  const [value, setValue] = useState(transaction?.value?.toString() || "");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().slice(0, 10)
  );
  const [observation, setObservation] = useState(transaction?.observation || "");
  const [submitting, setSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const filteredCategories = categories.filter((c) => c.type === type);
  const [selectedCategoryName, setSelectedCategoryName] = useState(
    transaction?.categoryName || ""
  );

  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId);
      setSelectedCategoryName(cat?.name || "");
    }
  }, [categoryId, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const finalCategoryName =
      categoryId === "custom"
        ? customCategory
        : selectedCategoryName || "Sem categoria";

    const finalCategoryId = categoryId === "custom" ? "custom" : categoryId;

    try {
      await onSubmit({
        type,
        value: parseFloat(value.replace(",", ".")),
        categoryId: finalCategoryId,
        categoryName: finalCategoryName,
        description,
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
    setSelectedCategoryName("");
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Lançamento" : "Novo Lançamento"}
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
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="text"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Venda de serviço"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            {filteredCategories.length > 0 ? (
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setCustomCategory("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Nova categoria</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value="custom" onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma categoria cadastrada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">+ Criar categoria</SelectItem>
                </SelectContent>
              </Select>
            )}
            {(categoryId === "custom" || filteredCategories.length === 0) && (
              <Input
                placeholder="Nome da nova categoria"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
                required={filteredCategories.length === 0}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observação (opcional)</Label>
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
