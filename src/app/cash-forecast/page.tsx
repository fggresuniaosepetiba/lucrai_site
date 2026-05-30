"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { CashForecastRepository } from "@/database/repositories/cash-forecast";
import { TransactionRepository } from "@/database/repositories/transactions";
import type { CashForecast, ForecastStatus, TransactionType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, CalendarCheck, Plus,
  AlertTriangle, Search, Pencil, EyeOff, CheckCircle2, XCircle,
  ArrowUpDown, Wallet, Target, BarChart3,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const company = user?.company ?? "";

  const [formType, setFormType] = useState<TransactionType>("income");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<ForecastStatus>("predicted");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, router, company]);

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) setFilterStatus(f);
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [forecasts, summary] = await Promise.all([
        CashForecastRepository.getAll(company),
        TransactionRepository.getYearlySummary(new Date().getFullYear(), company),
      ]);
      setItems(forecasts);
      setCurrentBalance(summary.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const predicted = items.filter((i) => i.status === "predicted");
    const incomes = predicted.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
    const expenses = predicted.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
    return { predictedIncomes: incomes, predictedExpenses: expenses };
  }, [items]);

  const projectedBalance = currentBalance + totals.predictedIncomes - totals.predictedExpenses;
  const hasCashAlert = totals.predictedExpenses > currentBalance;

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filterStatus !== "all" && i.status !== filterStatus && filterStatus !== "income" && filterStatus !== "expense") return false;
      if (filterStatus === "income" && i.type !== "income") return false;
      if (filterStatus === "expense" && i.type !== "expense") return false;
      if (search) {
        const q = search.toLowerCase();
        return i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, filterStatus, search]);

  const chartData = useMemo(() => {
    const sorted = [...items]
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
  }, [items, currentBalance]);

  const openCreate = () => {
    setEditingItem(null);
    setFormType("income");
    setFormDescription("");
    setFormAmount("");
    setFormCategory("");
    setFormDate("");
    setFormNotes("");
    setFormStatus("predicted");
    setShowForm(true);
  };

  const openEdit = (item: CashForecast) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormDescription(item.description);
    setFormAmount(String(item.amount));
    setFormCategory(item.category);
    setFormDate(item.expectedDate);
    setFormNotes(item.notes || "");
    setFormStatus(item.status);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formDescription.trim() || !formAmount || !formDate) return;
    const amount = parseFloat(formAmount);
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
          status: formStatus,
        });
        toast("Previsão atualizada", "", "success");
      } else {
        await CashForecastRepository.create(
          { type: formType, description: formDescription.trim(), amount, category: formCategory.trim(), expectedDate: formDate, notes: formNotes.trim(), status: "predicted" },
          company
        );
        toast("Previsão criada", "Lançamento previsto registrado", "success");
      }
      setShowForm(false);
      loadData();
    } catch { toast("Erro", "Não foi possível salvar", "destructive"); }
  };

  const handleStatusChange = async (id: string, status: ForecastStatus) => {
    try {
      if (status === "received") await CashForecastRepository.markAsReceived(id, company);
      else if (status === "paid") await CashForecastRepository.markAsPaid(id, company);
      else if (status === "cancelled") await CashForecastRepository.markAsCancelled(id);
      toast("Status atualizado", "", "success");
      loadData();
    } catch { toast("Erro", "", "destructive"); }
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
                  <p className="text-xs text-muted-foreground">Caixa Atual</p>
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
              Seu caixa atual não cobre todos os compromissos futuros.
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                { value: "predicted", label: "Previstos" },
                { value: "received", label: "Recebidos" },
                { value: "paid", label: "Pagos" },
                { value: "cancelled", label: "Cancelados" },
              ].map((f) => (
                <button key={f.value} onClick={() => setFilterStatus(f.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterStatus === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >{f.label}</button>
              ))}
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Lançamento Previsto
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
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
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Nenhuma previsão encontrada
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
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
                                <button onClick={() => handleStatusChange(item.id, "received")}
                                  className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                  title="Marcar como Recebido"
                                ><CheckCircle2 className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleStatusChange(item.id, "paid")}
                                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Marcar como Pago"
                                ><DollarSign className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleStatusChange(item.id, "cancelled")}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                                  title="Cancelar"
                                ><XCircle className="h-3.5 w-3.5" /></button>
                              </>
                            )}
                            <button onClick={() => openEdit(item)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                              title="Editar"
                            ><Pencil className="h-3.5 w-3.5" /></button>
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

        <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingItem(null); } }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Previsão" : "Novo Lançamento Previsto"}</DialogTitle>
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
                <Label htmlFor="desc">Descrição</Label>
                <Input id="desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Ex: Pagamento cliente X" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input id="amount" type="number" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat">Categoria</Label>
                  <Input id="cat" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Ex: Vendas, Aluguel" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data Prevista</Label>
                <Input id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observação</Label>
                <Textarea id="notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Informações adicionais..." rows={2} />
              </div>
              {editingItem && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ForecastStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="predicted">Previsto</SelectItem>
                      <SelectItem value="received">Recebido</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!formDescription.trim() || !formAmount || !formDate}>
                {editingItem ? "Atualizar" : "Criar"}
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
