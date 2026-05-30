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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, RotateCcw, AlertTriangle, Clock } from "lucide-react";
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
      const restored = await TrashRepository.restore(restoreTarget.id);
      if (restored) {
        toast("Lançamento restaurado", "Voltou para o financeiro", "success");
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
      await TrashRepository.permanentlyDelete(deleteTarget.id);
      toast("Excluído permanentemente", "", "success");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Erro", "Não foi possível excluir", "destructive");
    }
  };

  const getDaysRemaining = (restoreUntil: string): number => {
    const diff = new Date(restoreUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Trash2 className="h-6 w-6 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Lixeira</h2>
            <p className="text-sm text-muted-foreground">
              Itens excluídos ficam disponíveis por 30 dias
            </p>
          </div>
        </div>

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
                <Card key={item.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={item.type === "income" ? "success" : "destructive"} className="gap-1">
                            {item.type === "income" ? "Entrada" : "Saída"}
                          </Badge>
                          <span className="font-medium">{item.description}</span>
                          <span className={`text-sm font-semibold ${
                            item.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {item.type === "income" ? "+" : "-"}{formatCurrency(item.value)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>{item.categoryName}</span>
                          <span>{formatDate(item.date)}</span>
                        </div>

                        <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">Motivo:</span> {item.reason}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={days <= 5 ? "text-amber-400 font-medium" : "text-muted-foreground"}>
                            {days} dia{days !== 1 ? "s" : ""} restante{days !== 1 ? "s" : ""} para restaurar
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
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
                          className="gap-1.5 text-xs text-muted-foreground hover:text-red-400"
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
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Restaurar Lançamento
            </DialogTitle>
            <DialogDescription className="pt-2">
              <p>ESSE LANÇAMENTO FOI REMOVIDO PARA A LIXEIRA PELO MOTIVO:</p>
              <p className="mt-2 p-3 rounded-lg bg-muted text-sm font-medium text-foreground">
                {restoreTarget?.reason}
              </p>
              <p className="mt-4 text-foreground font-semibold">DESEJA RESTAURAR MESMO ASSIM?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>
              NÃO
            </Button>
            <Button onClick={handleRestore}>
              SIM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Permanentemente
            </DialogTitle>
            <DialogDescription className="pt-2">
              <p>
                ESTE LANÇAMENTO FOI REMOVIDO EM{" "}
                <span className="font-bold text-foreground">
                  {deleteTarget ? 30 - getDaysRemaining(deleteTarget.restoreUntil) : ""}
                </span>{" "}
                DIA{deleteTarget && 30 - getDaysRemaining(deleteTarget.restoreUntil) !== 1 ? "S" : ""}
                , DESEJA EXCLUIR PERMANENTEMENTE ANTES DO PERÍODO DE 30 DIAS?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              NÃO
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete}>
              SIM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
