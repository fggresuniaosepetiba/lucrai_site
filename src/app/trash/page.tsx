"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { TrashRepository } from "@/database/repositories/trash";
import type { DeletedTransaction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate, parseLocalDate } from "@/lib/utils";
import { Trash2, RotateCcw, AlertTriangle, Clock, Hash, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TrashPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [items, setItems] = useState<DeletedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoreTarget, setRestoreTarget] = useState<DeletedTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeletedTransaction | null>(null);
  const company = user?.company ?? "";
  const userName = user?.name ?? "Sistema";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    load();
  }, [isAuthenticated, router, company]);

  const load = async () => {
    try {
      await TrashRepository.cleanup();
      const data = await TrashRepository.getAll(company);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      const restored = await TrashRepository.restore(restoreTarget.id, userName);
      if (restored) {
        const label = restoreTarget.entryType === "forecast" ? "Previsão" : "Lançamento";
        toast(`${label} restaurado${label === "Previsão" ? "a" : ""}`, `Voltou para ${label === "Previsão" ? "a Previsão de Caixa" : "o financeiro"}`, "success");
        setRestoreTarget(null);
        load();
      }
    } catch {
      toast("Erro", "Não foi possível restaurar", "destructive");
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    try {
      await TrashRepository.permanentlyDelete(deleteTarget.id, userName);
      toast("Excluído permanentemente", "", "success");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Erro", "Não foi possível excluir", "destructive");
    }
  };

  const getDaysRemaining = (restoreUntil: string): number => {
    const diff = parseLocalDate(restoreUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-500/10 p-3">
            <Trash2 className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Lixeira</h2>
            <p className="text-sm text-muted-foreground">
              Itens excluídos ficam disponíveis por 30 dias antes da remoção automática
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trash2 className="h-3 w-3" />
            <span>{items.length} item{items.length !== 1 ? "ns" : ""} na lixeira</span>
          </div>
        )}

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Trash2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Lixeira vazia</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nenhum lançamento foi excluído ainda
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const days = getDaysRemaining(item.restoreUntil);
              return (
                <Card key={item.id} className="group hover:shadow-md transition-all border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            {item.entryType === "forecast" ? "Previsão" : "Lançamento"}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono">{item.displayId}</span>
                          </div>
                          <Badge variant={item.type === "income" ? "success" : "destructive"} className="gap-1 text-[10px]">
                            {item.type === "income" ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {item.type === "income" ? "Entrada" : "Saída"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-base">{item.description}</span>
                          <span className={`text-base font-semibold ${
                            item.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {item.type === "income" ? "+" : "-"}{formatCurrency(item.value ?? item.amount ?? 0)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="rounded-md bg-muted px-2 py-0.5">{item.categoryName || item.category || "—"}</span>
                          <span>{formatDate(item.date || item.expectedDate || "")}</span>
                        </div>

                        <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-amber-300 font-medium">Motivo da exclusão:</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={days <= 5 ? "text-amber-400 font-medium" : "text-muted-foreground"}>
                            {days} dia{days !== 1 ? "s" : ""} restante{days !== 1 ? "s" : ""} para restaurar
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestoreTarget(item)}
                          className="gap-1.5 text-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restaurar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="gap-1.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!restoreTarget} onOpenChange={(open) => { if (!open) setRestoreTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
                <RotateCcw className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle>Restaurar {restoreTarget?.entryType === "forecast" ? "Previsão" : "Lançamento"}</DialogTitle>
                <DialogDescription>
                  {restoreTarget?.entryType === "forecast"
                    ? `A previsão ${restoreTarget?.displayId} será restaurada para a Previsão de Caixa.`
                    : `O lançamento ${restoreTarget?.displayId} será restaurado para o financeiro.`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  restoreTarget?.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                }`}>
                  {restoreTarget?.type === "income" ? "Entrada" : "Saída"}
                </span>
                <span className="text-sm font-medium">{restoreTarget?.description}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{restoreTarget?.categoryName || restoreTarget?.category || "—"}</span>
                <span>{restoreTarget ? formatDate(restoreTarget.date || restoreTarget.expectedDate || "") : ""}</span>
                <span className={`font-semibold ${
                  restoreTarget?.type === "income" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {restoreTarget?.type === "income" ? "+" : "-"}{restoreTarget ? formatCurrency(restoreTarget.value ?? restoreTarget.amount ?? 0) : ""}
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 p-2 mt-2">
                <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5" />
                <p className="text-xs text-muted-foreground">Motivo: {restoreTarget?.reason}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-center">Deseja restaurar {restoreTarget?.entryType === "forecast" ? "esta previsão" : "este lançamento"}?</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleRestore} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <DialogTitle>Excluir Permanentemente</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. {deleteTarget?.entryType === "forecast" ? "A previsão" : "O lançamento"} será removido permanentemente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  deleteTarget?.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                }`}>
                  {deleteTarget?.type === "income" ? "Entrada" : "Saída"}
                </span>
                <span className="text-sm font-medium">{deleteTarget?.description}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{deleteTarget?.categoryName || deleteTarget?.category || "—"}</span>
                <span>{deleteTarget ? formatDate(deleteTarget.date || deleteTarget.expectedDate || "") : ""}</span>
                <span className={`font-semibold ${
                  deleteTarget?.type === "income" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {deleteTarget?.type === "income" ? "+" : "-"}{deleteTarget ? formatCurrency(deleteTarget.value ?? deleteTarget.amount ?? 0) : ""}
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-center text-red-400">
              Deseja excluir permanentemente {deleteTarget?.entryType === "forecast" ? "esta previsão" : "este lançamento"}?
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
