"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { CategoryRepository } from "@/database/repositories/categories";
import { seedDefaultCategories } from "@/database/seed";
import type { Category, TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Palette, Tag, AlertTriangle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const COLORS = [
  "#0ea5e9", "#22c55e", "#eab308", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16", "#06b6d4", "#d946ef",
];

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [type, setType] = useState<TransactionType>("income");
  const [duplicates, setDuplicates] = useState<{ name: string; type: TransactionType; ids: string[]; keepId: string; count: number }[]>([]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const company = user?.company ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    init();
  }, [isAuthenticated, router, company]);

  const init = async () => {
    try {
      await seedDefaultCategories(company);
      await loadCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const cats = await CategoryRepository.getAll(company);
    setCategories(cats);
  };

  const handleCheckDuplicates = async () => {
    const dups = await CategoryRepository.findDuplicates(company);
    setDuplicates(dups);
    setShowDuplicatesDialog(true);
  };

  const handleRemoveDuplicates = async () => {
    setRemovingDuplicates(true);
    try {
      const removed = await CategoryRepository.removeDuplicates(company);
      toast("Duplicatas removidas", `${removed} categoria(s) duplicada(s) removida(s) com sucesso`, "success");
      setShowDuplicatesDialog(false);
      setDuplicates([]);
      await loadCategories();
    } catch {
      toast("Erro", "Não foi possível remover duplicatas", "destructive");
    } finally {
      setRemovingDuplicates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await CategoryRepository.update(editingCategory.id, { name: name.trim(), color, type });
        toast("Categoria atualizada", "", "success");
      } else {
        await CategoryRepository.create({ name: name.trim(), color, type, icon: "tag" }, company);
        toast("Categoria criada", "Categoria criada com sucesso", "success");
      }
      setShowForm(false);
      setEditingCategory(null);
      setName("");
      await loadCategories();
    } catch {
      toast("Erro", "Não foi possível salvar", "destructive");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await CategoryRepository.delete(deleteConfirm.id);
      toast("Categoria excluída", "", "success");
      setDeleteConfirm(null);
      await loadCategories();
    } catch {
      toast("Erro", "Não foi possível excluir", "destructive");
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setType(cat.type);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setColor("#0ea5e9");
    setType("income");
    setShowForm(true);
  };

  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Categorias</h2>
            <p className="text-sm text-muted-foreground">Gerencie suas categorias de entrada e saída</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCheckDuplicates} variant="outline" size="sm" className="gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Remover Duplicadas
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Nova Categoria
            </Button>
          </div>
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Nenhuma categoria</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie categorias para organizar seus lançamentos
              </p>
            </CardContent>
          </Card>
        )}

        {incomeCats.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Entradas</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incomeCats.map((cat) => (
                <Card key={cat.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <Palette className="h-5 w-5" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            Entrada
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => setDeleteConfirm(cat)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {expenseCats.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Saídas</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expenseCats.map((cat) => (
                <Card key={cat.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <Palette className="h-5 w-5" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Saída
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => setDeleteConfirm(cat)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={showDuplicatesDialog} onOpenChange={(open) => { if (!open) { setShowDuplicatesDialog(false); } }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Remover Categorias Duplicadas
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {duplicates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma categoria duplicada encontrada
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    As seguintes categorias aparecem mais de uma vez. Será mantida apenas a mais antiga e as
                    transações serão reassociadas automaticamente.
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {duplicates.map((dup) => (
                      <div key={`${dup.name}-${dup.type}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{dup.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {dup.type === "income" ? "Entrada" : "Saída"} &middot; {dup.count} ocorrências
                          </p>
                        </div>
                        <Badge variant={dup.type === "income" ? "success" : "destructive"} className="text-[10px]">
                          manter 1 de {dup.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDuplicatesDialog(false)}>
                Cancelar
              </Button>
              {duplicates.length > 0 && (
                <Button variant="destructive" onClick={handleRemoveDuplicates} disabled={removingDuplicates}>
                  {removingDuplicates ? "Removendo..." : `Remover ${duplicates.reduce((a, d) => a + d.count - 1, 0)} duplicata(s)`}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Excluir Categoria
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir a categoria <strong>{deleteConfirm?.name}</strong>?
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Transações vinculadas a esta categoria perderão a referência.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingCategory(null); } }}>
          <DialogContent className="sm:max-w-[400px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nome</Label>
                  <Input
                    id="cat-name"
                    placeholder="Nome da categoria"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-8 w-8 rounded-lg border-2 transition-all ${
                          color === c ? "border-foreground scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={type === "income" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setType("income")}
                      className="flex-1"
                    >
                      Entrada
                    </Button>
                    <Button
                      type="button"
                      variant={type === "expense" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setType("expense")}
                      className="flex-1"
                    >
                      Saída
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingCategory(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!name.trim()}>
                  {editingCategory ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
