"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { CashForecastRepository } from "@/database/repositories/cash-forecast";
import { TransactionRepository } from "@/database/repositories/transactions";
import { migrateDisplayIds, fixCompanyName } from "@/database/dexie";
import type { CashForecast, ForecastStatus, TransactionType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, formatCurrencyInput, parseCurrencyInput, valorPorExtenso, validateForecastDate } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, CalendarCheck, Plus,
  AlertTriangle, Search, Pencil, CheckCircle2, XCircle, Trash2,
  Target, BarChart3, Hash, History, Clock, Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const statusLabels: Record<ForecastStatus, string> = {
  predicted: "Previsto",
  received: "Recebido",
  paid: "Pago",
  cancelled: "Cancelado",
};

const statusVariants: Record<ForecastStatus, "secondary" | "success" | "destructive" | "outline"> = {
  predicted: "secondary",
  received: "success",
  paid: "destructive",
  cancelled: "outline",
};

function CashForecastContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [items, setItems] = useState<CashForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get("filter") || "all");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CashForecast | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const company = user?.company ?? "";
  const userName = user?.name ?? "Sistema";

  const [formType, setFormType] = useState<TransactionType>("income");
  const [formDescription, setFormDescription] = useState("");
  const [formAmountDisplay, setFormAmountDisplay] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "received" | "paid" | "cancelled" | "delete" | "clear_history";
    item: CashForecast | null;
  }>({ open: false, type: "received", item: null });

  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const initialized = useRef(false);

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

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) setFilterStatus(f);
  }, [searchParams]);

  const runStartup = async () => {
    try { await migrateDisplayIds(); } catch (e) { console.error("migrateDisplayIds:", e); }
    try { await fixCompanyName(); } catch (e) { console.error("fixCompanyName:", e); }
    try { await useAuthStore.getState().refreshUser(); } catch (e) { console.error("refreshUser:", e); }
    loadData();
  };

  const loadData = async () => {
    try {
      const [forecasts, balanceData] = await Promise.all([
        CashForecastRepository.getAll(company),
        TransactionRepository.getAllBalance(company),
      ]);
      setItems(forecasts);
      setCurrentBalance(balanceData.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeItems = useMemo(() => items.filter((i) => i.status === "predicted"), [items]);
  const historyItems = useMemo(() => items.filter((i) => i.status !== "predicted"), [items]);

  const totals = useMemo(() => {
    const predicted = activeItems.filter((i) => i.status === "predicted");
    const incomes = predicted.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
    const expenses = predicted.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
    return { predictedIncomes: incomes, predictedExpenses: expenses };
  }, [activeItems]);

  const projectedBalance = currentBalance + totals.predictedIncomes - totals.predictedExpenses;
  const hasCashAlert = totals.predictedExpenses > currentBalance;

  const sourceItems = activeTab === "active" ? activeItems : historyItems;

  const filtered = useMemo(() => {
    return sourceItems.filter((i) => {
      if (filterStatus !== "all" && i.status !== filterStatus && filterStatus !== "income" && filterStatus !== "expense") return false;
      if (filterStatus === "income" && i.type !== "income") return false;
      if (filterStatus === "expense" && i.type !== "expense") return false;
      if (search) {
        const q = search.toLowerCase();
        return i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.displayId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sourceItems, filterStatus, search]);

  const chartData = useMemo(() => {
    const sorted = [...activeItems]
      .filter((i) => i.status !== "cancelled")
      .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());
    let running = currentBalance;
    const points: { date: string; balance: number }[] = [
      { date: "Hoje", balance: running },
    ];
    for (const item of sorted) {
      const multiplier = item.type === "income" ? 1 : -1;
      const factor = item.status === "received" || item.status === "paid" ? 0 : 1;
      running += item.amount * multiplier * factor;
      points.push({ date: formatDate(item.expectedDate), balance: running });
    }
    return points;
  }, [activeItems, currentBalance]);

  const formAmountValue = formAmountDisplay ? parseCurrencyInput(formAmountDisplay) : 0;

  const openCreate = () => {
    setEditingItem(null);
    setFormType("income");
    setFormDescription("");
    setFormAmountDisplay("");
    setFormCategory("");
    setFormDate("");
    setFormNotes("");
    setShowForm(true);
  };

  const openEdit = (item: CashForecast) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormDescription(item.description);
    setFormAmountDisplay(formatCurrencyInput(String(Math.round(item.amount * 100))));
    setFormCategory(item.category);
    setFormDate(item.expectedDate);
    setFormNotes(item.notes || "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formDescription.trim() || !formAmountDisplay || !formDate) return;
    const dateCheck = validateForecastDate(formDate);
    if (!dateCheck.valid) { toast("Data inválida", dateCheck.message, "destructive"); return; }
    const amount = formAmountValue;
    if (isNaN(amount) || amount <= 0) { toast("Valor inválido", "", "destructive"); return; }

    try {
      if (editingItem) {
        await CashForecastRepository.update(editingItem.id, {
          type: formType,
          description: formDescription.trim(),
          amount,
          category: formCategory.trim(),
          expectedDate: formDate,
          notes: formNotes.trim(),
        }, userName);
        toast("Previsão atualizada", "", "success");
      } else {
        await CashForecastRepository.create(
          { type: formType, description: formDescription.trim(), amount, category: formCategory.trim(), expectedDate: formDate, notes: formNotes.trim(), status: "predicted" },
          company,
          userName
        );
        toast("Previsão criada", "Lançamento previsto registrado", "success");
      }
      setShowForm(false);
      await loadData();
    } catch { toast("Erro", "Não foi possível salvar", "destructive"); }
  };

  const handleFormAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      setFormAmountDisplay("");
      return;
    }
    setFormAmountDisplay(formatCurrencyInput(digits));
  };

  const openConfirmDialog = (item: CashForecast, type: "received" | "paid" | "cancelled") => {
    setConfirmDialog({ open: true, type, item });
    setCancelReason("");
    setCancelError("");
  };

  const handleConfirmAction = async () => {
    const { type, item } = confirmDialog;
    if (!item) return;

    try {
      if (type === "cancelled") {
        if (!cancelReason.trim()) {
          setCancelError("O motivo do cancelamento é obrigatório.");
          return;
        }
        await CashForecastRepository.markAsCancelled(item.id, cancelReason.trim(), userName);
        toast("Previsão cancelada", "", "success");
      } else if (type === "received") {
        await CashForecastRepository.markAsReceived(item.id, company, userName);
        toast("Previsão marcada como recebida", "", "success");
      } else if (type === "paid") {
        await CashForecastRepository.markAsPaid(item.id, company, userName);
        toast("Previsão marcada como paga", "", "success");
      } else if (type === "delete") {
        await CashForecastRepository.softDelete(item.id, "Excluído pelo usuário", userName);
        toast("Previsão movida para lixeira", "Ela ficará disponível por 30 dias", "success");
      }
      setConfirmDialog({ open: false, type: "received", item: null });
      await loadData();
    } catch { toast("Erro", "Não foi possível atualizar", "destructive"); }
  };

  const handleClearHistory = async () => {
    try {
      const toDelete = items.filter((i) => i.status !== "predicted");
      for (const item of toDelete) {
        await CashForecastRepository.delete(item.id);
      }
      toast("Histórico limpo", `${toDelete.length} registro(s) removido(s) permanentemente`, "success");
      setConfirmDialog({ open: false, type: "clear_history", item: null });
      await loadData();
    } catch { toast("Erro", "Não foi possível limpar o histórico", "destructive"); }
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Previsão de Caixa</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-9">
            Acompanhe recebimentos e pagamentos futuros para entender como ficará o caixa da empresa nos próximos dias.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Caixa Atual (Realizado)</p>
                  <p className="text-lg font-bold">{formatCurrency(currentBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recebimentos Previstos</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(totals.predictedIncomes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-3">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pagamentos Previstos</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(totals.predictedExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-3 ${projectedBalance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <Target className={`h-5 w-5 ${projectedBalance >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo Projetado</p>
                  <p className={`text-lg font-bold ${projectedBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(projectedBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasCashAlert && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              Seu caixa atual ({formatCurrency(currentBalance)}) não cobre todos os pagamentos previstos ({formatCurrency(totals.predictedExpenses)}).
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Evolução do Caixa Projetado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [formatCurrency(value), "Saldo"]}
                    />
                    <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mb-2" />
                <p className="text-sm">Adicione previsões para ver o gráfico</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs: Ativos / Histórico */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                <Clock className="h-4 w-4" />
                Previsões Ativas
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>
            {activeTab === "active" && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Novo Lançamento Previsto
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Pesquisar previsões..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-1 rounded-lg border p-1 flex-wrap">
                {[
                  { value: "all", label: "Todos" },
                  { value: "income", label: "Recebimentos" },
                  { value: "expense", label: "Pagamentos" },
                  ...(activeTab === "active" ? [
                    { value: "predicted", label: "Previstos" },
                  ] : [
                    { value: "received", label: "Recebidos" },
                    { value: "paid", label: "Pagos" },
                    { value: "cancelled", label: "Cancelados" },
                  ]),
                ].map((f) => (
                  <button key={f.value} onClick={() => setFilterStatus(f.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      filterStatus === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >{f.label}</button>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="active" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left font-medium text-muted-foreground p-4">ID</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Tipo</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Descrição</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Categoria</th>
                        <th className="text-right font-medium text-muted-foreground p-4">Valor</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Data Prevista</th>
                        <th className="text-center font-medium text-muted-foreground p-4">Status</th>
                        <th className="text-right font-medium text-muted-foreground p-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted-foreground">
                            Nenhuma previsão encontrada
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <tr key={item.id} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-mono text-muted-foreground">{item.displayId}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {item.type === "income" ? (
                                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-400" />
                                )}
                                <span className="text-xs">{item.type === "income" ? "Entrada" : "Saída"}</span>
                              </div>
                            </td>
                            <td className="p-4 font-medium">{item.description}</td>
                            <td className="p-4 text-muted-foreground">{item.category || "—"}</td>
                            <td className={`p-4 text-right font-medium tabular-nums ${
                              item.type === "income" ? "text-emerald-400" : "text-red-400"
                            }`}>{item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(item.expectedDate)}</td>
                            <td className="p-4 text-center">
                              <Badge variant={statusVariants[item.status]} className="text-[10px]">
                                {statusLabels[item.status]}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {item.status === "predicted" && (
                                  <>
                                    {item.type === "income" && (
                                      <button onClick={() => openConfirmDialog(item, "received")}
                                        className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                        title="Marcar como Recebido"
                                      ><CheckCircle2 className="h-3.5 w-3.5" /></button>
                                    )}
                                    {item.type === "expense" && (
                                      <button onClick={() => openConfirmDialog(item, "paid")}
                                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Marcar como Pago"
                                      ><DollarSign className="h-3.5 w-3.5" /></button>
                                    )}
                                    <button onClick={() => openConfirmDialog(item, "cancelled")}
                                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                                      title="Cancelar"
                                    ><XCircle className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => openEdit(item)}
                                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                                      title="Editar"
                                    ><Pencil className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => setConfirmDialog({ open: true, type: "delete", item })}
                                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                                      title="Excluir"
                                    ><Trash2 className="h-3.5 w-3.5" /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {historyItems.length > 0 && (
              <div className="flex justify-end mb-3">
                <Button variant="destructive" size="sm" onClick={() => setConfirmDialog({ open: true, type: "clear_history", item: null })} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Limpar Histórico
                </Button>
              </div>
            )}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left font-medium text-muted-foreground p-4">ID</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Tipo</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Descrição</th>
                        <th className="text-right font-medium text-muted-foreground p-4">Valor</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Data Prevista</th>
                        <th className="text-center font-medium text-muted-foreground p-4">Status</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Data da Ação</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted-foreground">
                            Nenhum registro no histórico
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <tr key={item.id} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-mono text-muted-foreground">{item.displayId}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {item.type === "income" ? (
                                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-400" />
                                )}
                                <span className="text-xs">{item.type === "income" ? "Entrada" : "Saída"}</span>
                              </div>
                            </td>
                            <td className="p-4 font-medium">{item.description}</td>
                            <td className={`p-4 text-right font-medium tabular-nums ${
                              item.type === "income" ? "text-emerald-400" : "text-red-400"
                            }`}>{item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(item.expectedDate)}</td>
                            <td className="p-4 text-center">
                              <Badge variant={statusVariants[item.status]} className="text-[10px]">
                                {statusLabels[item.status]}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground text-xs">
                              {item.status === "cancelled" && item.cancelledAt
                                ? formatDate(item.cancelledAt)
                                : formatDate(item.updatedAt)}
                            </td>
                            <td className="p-4 text-muted-foreground text-xs max-w-[200px] truncate" title={item.cancelledReason || ""}>
                              {item.status === "cancelled" ? (item.cancelledReason || "—") : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingItem(null); } }}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? `Editar Previsão ${editingItem.displayId}` : "Novo Lançamento Previsto"}</DialogTitle>
              <DialogDescription>
                Registre valores futuros que ainda não entraram ou saíram do caixa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={formType === "income" ? "default" : "outline"} size="sm" onClick={() => setFormType("income")} className="flex-1 gap-2">
                    <TrendingUp className="h-4 w-4" /> Entrada
                  </Button>
                  <Button type="button" variant={formType === "expense" ? "destructive" : "outline"} size="sm" onClick={() => setFormType("expense")} className="flex-1 gap-2">
                    <TrendingDown className="h-4 w-4" /> Saída
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="flex items-center gap-1">
                  Descrição <span className="text-red-400">*</span>
                </Label>
                <Input id="desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Ex: Pagamento cliente X" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-1">
                    Valor <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    value={formAmountDisplay ? `R$ ${formAmountDisplay}` : ""}
                    onChange={handleFormAmountChange}
                    placeholder="R$ 0,00"
                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    Data Prevista <span className="text-red-400">*</span>
                  </Label>
                  <Input id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecast-extenso">Valor por Extenso</Label>
                <Textarea
                  id="forecast-extenso"
                  value={formAmountValue > 0 ? valorPorExtenso(formAmountValue) : ""}
                  disabled
                  readOnly
                  rows={3}
                  className="bg-muted/50 text-muted-foreground cursor-default resize-none leading-relaxed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat">Categoria</Label>
                <Input id="cat" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Ex: Vendas, Aluguel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <Textarea id="notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Informações adicionais..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!formDescription.trim() || !formAmountDisplay || !formDate}>
                {editingItem ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog for Received/Paid/Cancelled */}
        <Dialog open={confirmDialog.open && ["received", "paid", "cancelled"].includes(confirmDialog.type)} onOpenChange={(open) => { if (!open) setConfirmDialog({ open: false, type: "received", item: null }); }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  confirmDialog.type === "cancelled" ? "bg-amber-500/15" : "bg-blue-500/15"
                }`}>
                  {confirmDialog.type === "cancelled" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  ) : confirmDialog.type === "received" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <DialogTitle>
                    {confirmDialog.type === "received" ? "Confirmar Recebimento" :
                     confirmDialog.type === "paid" ? "Confirmar Pagamento" : "Cancelar Previsão"}
                  </DialogTitle>
                  <DialogDescription>
                    {confirmDialog.type === "cancelled"
                      ? "Esta ação removerá o lançamento das previsões ativas e o moverá para o Histórico."
                      : "Esta ação impactará relatórios, indicadores financeiros e saldo realizado."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {confirmDialog.item && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{confirmDialog.item.displayId}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      confirmDialog.item.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      {confirmDialog.item.type === "income" ? "Entrada" : "Saída"}
                    </span>
                    <span className="text-sm font-medium">{confirmDialog.item.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatCurrency(confirmDialog.item.amount)}</span>
                    <span>{formatDate(confirmDialog.item.expectedDate)}</span>
                  </div>
                </div>
              )}

              {confirmDialog.type === "cancelled" && (
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason" className="flex items-center gap-1">
                    Motivo do Cancelamento <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Descreva o motivo do cancelamento..."
                    value={cancelReason}
                    onChange={(e) => { setCancelReason(e.target.value); setCancelError(""); }}
                    rows={3}
                  />
                  {cancelError && <p className="text-xs text-red-400">{cancelError}</p>}
                </div>
              )}

              {confirmDialog.type !== "cancelled" && (
                <p className="text-sm font-semibold">
                  ATENÇÃO: Você está marcando o lançamento {confirmDialog.item?.displayId} como {confirmDialog.type === "received" ? "RECEBIDO" : "PAGO"}. Deseja continuar?
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmDialog({ open: false, type: "received", item: null })}>
                Cancelar
              </Button>
              <Button variant={confirmDialog.type === "cancelled" ? "destructive" : "default"} onClick={handleConfirmAction}>
                {confirmDialog.type === "received" ? "Confirmar Recebimento" :
                 confirmDialog.type === "paid" ? "Confirmar Pagamento" : "Confirmar Cancelamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation - moves to trash */}
        <Dialog open={confirmDialog.type === "delete" && !!confirmDialog.item} onOpenChange={(open) => { if (!open) setConfirmDialog({ open: false, type: "received", item: null }); }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <DialogTitle>Excluir Previsão</DialogTitle>
                  <DialogDescription>
                    Esta ação moverá o lançamento para a lixeira.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {confirmDialog.item && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{confirmDialog.item.displayId}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      confirmDialog.item.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      {confirmDialog.item.type === "income" ? "Entrada" : "Saída"}
                    </span>
                    <span className="text-sm font-medium">{confirmDialog.item.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatCurrency(confirmDialog.item.amount)}</span>
                    <span>{formatDate(confirmDialog.item.expectedDate)}</span>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Atenção</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Esta previsão será enviada para a lixeira, onde ficará disponível por 30 dias. 
                      Após este prazo, será removida permanentemente e não será possível recuperá-la 
                      nem auditá-la.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmDialog({ open: false, type: "received", item: null })}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmAction} className="gap-2">
                <Trash2 className="h-4 w-4" /> Mover para Lixeira
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear History confirmation - permanent */}
        <Dialog open={confirmDialog.type === "clear_history"} onOpenChange={(open) => { if (!open) setConfirmDialog({ open: false, type: "received", item: null }); }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <DialogTitle>Limpar Histórico</DialogTitle>
                  <DialogDescription>
                    Esta ação removerá permanentemente todo o histórico de previsões.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Isso não poderá ser desfeito!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {historyItems.length} registro(s) serão excluídos permanentemente. 
                      Eles <strong className="text-red-300">não irão para a lixeira</strong> e 
                      <strong className="text-red-300"> não poderão ser recuperados</strong> nem auditados futuramente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Serão removidos: {historyItems.slice(0, 5).map((i) => i.displayId).join(", ")}
                  {historyItems.length > 5 && ` e mais ${historyItems.length - 5} registro(s)`}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmDialog({ open: false, type: "received", item: null })}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleClearHistory} className="gap-2">
                <Trash2 className="h-4 w-4" /> Sim, Limpar Histórico
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}

export default function CashForecastPage() {
  return (
    <Suspense fallback={
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </Shell>
    }>
      <CashForecastContent />
    </Suspense>
  );
}
