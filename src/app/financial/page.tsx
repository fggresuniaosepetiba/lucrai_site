"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { TransactionList } from "@/components/financial/transaction-list";
import { TransactionForm } from "@/components/financial/transaction-form";
import { TransactionRepositoryApi } from "@/services/api-repositories/transactions";
import { CategoryRepositoryApi } from "@/services/api-repositories/categories";

import type { Transaction, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ArrowUpDown, Download, Hash, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseLocalDate } from "@/lib/utils";

export default function FinancialPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const initialized = useRef(false);
  const company = user?.company ?? "";

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach((t) => {
      const d = parseLocalDate(t.date);
      years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      runStartup();
    } else {
      loadData();
    }
  }, [isAuthenticated, router, company]);

  const runStartup = async () => {
    try { await useAuthStore.getState().refreshUser(); } catch (e) { console.error("refreshUser:", e); }
    loadData();
  };

  const loadData = async () => {
    try {
      const [txs, cats] = await Promise.all([
        TransactionRepositoryApi.getAll(),
        CategoryRepositoryApi.getAll(),
      ]);
      setTransactions(txs);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Parameters<typeof TransactionRepositoryApi.create>[0]) => {
    try {
      await TransactionRepositoryApi.create(data);
      toast("Lançamento criado", "Registrado com sucesso", "success");
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast("Erro", "Não foi possível criar o lançamento", "destructive");
    }
  };

  const handleCreateCategory = async (data: { name: string; type: "income" | "expense" }) => {
    const color = data.type === "income" ? "#22c55e" : "#ef4444";
    const created = await CategoryRepositoryApi.create({
      name: data.name.trim(),
      type: data.type,
      color,
      icon: "tag",
    });
    setCategories((prev) => [...prev, created]);
    return created;
  };
  const handleUpdate = async (id: string, data: Partial<Transaction>) => {
    await TransactionRepositoryApi.update(id, data);
    setEditingTransaction(null);
    setShowForm(false);
    await loadData();
  };

  const handleDelete = async (id: string, reason: string) => {
    await TransactionRepositoryApi.delete(id, reason);
    await loadData();
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setShowForm(true);
  };

  const filtered = transactions
    .filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterMonth !== "all") {
        const d = parseLocalDate(t.date);
        if (d.getMonth() + 1 !== parseInt(filterMonth)) return false;
      }
      if (filterYear !== "all") {
        const d = parseLocalDate(t.date);
        if (d.getFullYear() !== parseInt(filterYear)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.displayId.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = parseLocalDate(a.date).getTime();
      const dateB = parseLocalDate(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleExportCSV = () => {
    const headers = ["ID", "Tipo", "Valor", "Categoria", "Descrição", "Data", "Observação"];
    const rows = filtered.map((t) => [
      t.displayId,
      t.type === "income" ? "Entrada" : "Saída",
      t.value.toFixed(2),
      t.categoryName,
      t.description,
      t.date,
      t.observation || "",
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lucrai-lancamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar lançamentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-lg border p-1">
              {(["all", "income", "expense"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterType === type
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "Todos" : type === "income" ? "Entradas" : "Saídas"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="rounded-lg border p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Ordenar por data"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => { setEditingTransaction(null); setShowForm(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Lançamento
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span>{filtered.length} lançamento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <TransactionList
          transactions={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGerarRecibo={(tx) => {
            const params = new URLSearchParams({
              acao: "gerar-recibo",
              lancamentoId: tx.id,
              valor: String(tx.value),
              data: tx.date,
              referente: tx.description,
              tipo: tx.type === "income" ? "recebimento" : "pagamento",
              nomePagador: "",
              nomeRecebedor: "",
            });
            router.push(`/recibos?${params.toString()}`);
          }}
          categories={categories}
        />

        {showForm && (
          <TransactionForm
            transaction={editingTransaction}
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onSubmit={editingTransaction ? (data) => handleUpdate(editingTransaction.id, data) : handleCreate}
            onClose={() => { setShowForm(false); setEditingTransaction(null); }}
          />
        )}
      </div>
    </Shell>
  );
}
