"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { CategoryRepositoryApi } from "@/services/api-repositories/categories";
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
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [type, setType] = useState<TransactionType>("income");
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    init();
  }, [isAuthenticated, router]);

  const init = async () => {
    try {
      await loadCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const cats = await CategoryRepositoryApi.getAll();
    setCategories(cats);
  };

  const handleRemoveDuplicates = async () => {
    try {
      const removed = await CategoryRepositoryApi.removeDuplicates();
      toast("Duplicatas removidas", `${removed} categoria(s) duplicada(s) removida(s) com sucesso`, "success");
      await loadCategories();
    } catch {
      toast("Erro", "Não foi possível remover duplicatas", "destructive");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await CategoryRepositoryApi.update(editingCategory.id, { name: name.trim(), color, type });
        toast("Categoria atualizada", "", "success");
      } else {
        await CategoryRepositoryApi.create({ name: name.trim(), color, type, icon: "tag" });
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
      await CategoryRepositoryApi.delete(deleteConfirm.id);
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
            <Button onClick={() => setDuplicateConfirmOpen(true)} variant="outline" size="sm" className="gap-2 text-xs">
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

        <Dialog open={duplicateConfirmOpen} onOpenChange={setDuplicateConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Remover Categorias Duplicadas
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja remover todas as categorias duplicadas?
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Categorias com mesmo nome e tipo serão consolidadas, mantendo apenas a mais antiga.
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDuplicateConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => { setDuplicateConfirmOpen(false); handleRemoveDuplicates(); }}>
                Remover Duplicatas
              </Button>
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
