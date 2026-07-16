"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { TrashRepositoryApi } from "@/services/api-repositories/trash";
import { DocumentoRepositoryApi } from "@/services/api-repositories/documents";
import { DocumentoService } from "@/services/documentos/documentos.service";
import type { DeletedTransaction, DocumentoTrashItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate, parseLocalDate } from "@/lib/utils";
import { Trash2, RotateCcw, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TrashPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [items, setItems] = useState<DeletedTransaction[]>([]);
  const [docItems, setDocItems] = useState<DocumentoTrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoreTarget, setRestoreTarget] = useState<DeletedTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeletedTransaction | null>(null);
  const [docRestoreTarget, setDocRestoreTarget] = useState<DocumentoTrashItem | null>(null);
  const [docDeleteTarget, setDocDeleteTarget] = useState<DocumentoTrashItem | null>(null);
  const [docDeleteReason, setDocDeleteReason] = useState("");
  const [docDeleting, setDocDeleting] = useState(false);
  const company = user?.company ?? "";
  const userName = user?.name ?? "Sistema";
  const usuario_id = user?.email ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    load();
  }, [isAuthenticated, router, company]);

  const load = async () => {
    try {
      await TrashRepositoryApi.cleanup();
      await DocumentoRepositoryApi.cleanupTrash();
      const [data, docData] = await Promise.all([
        TrashRepositoryApi.getAll(),
        DocumentoRepositoryApi.getTrash(),
      ]);
      setItems(data);
      setDocItems(docData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      await TrashRepositoryApi.restore(restoreTarget.id);
      const restored = true;
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
      await TrashRepositoryApi.permanentlyDelete(deleteTarget.id);
      toast("Excluído permanentemente", "", "success");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Erro", "Não foi possível excluir", "destructive");
    }
  };

  const handleDocRestore = async () => {
    if (!docRestoreTarget) return;
    try {
      await DocumentoService.restaurarDaTrash(docRestoreTarget.documento_id, company, usuario_id);
      toast("Documento restaurado", "Voltou para a Central de Documentos", "success");
      setDocRestoreTarget(null);
      load();
    } catch {
      toast("Erro", "Não foi possível restaurar o documento", "destructive");
    }
  };

  const handleDocPermanentDelete = async () => {
    if (!docDeleteTarget || !docDeleteReason.trim()) return;
    setDocDeleting(true);
    try {
      await DocumentoService.excluirPermanentemente(
        docDeleteTarget.documento_id,
        company,
        docDeleteReason,
        usuario_id,
        userName
      );
      toast("Documento excluído permanentemente", "", "success");
      setDocDeleteTarget(null);
      setDocDeleteReason("");
      load();
    } catch {
      toast("Erro", "Não foi possível excluir permanentemente", "destructive");
    } finally {
      setDocDeleting(false);
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

        {items.length === 0 && docItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Trash2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Lixeira vazia</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nenhum item foi excluído ainda
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                Todos ({items.length + docItems.length})
              </TabsTrigger>
              <TabsTrigger value="financial">
                Financeiro ({items.length})
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documentos ({docItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {items.map((item) => (
                <TrashItemCard
                  key={item.id}
                  item={item}
                  onRestore={() => setRestoreTarget(item)}
                  onDelete={() => setDeleteTarget(item)}
                  getDaysRemaining={getDaysRemaining}
                />
              ))}
              {docItems.map((item) => (
                <DocTrashItemCard
                  key={item.id}
                  item={item}
                  onRestore={() => setDocRestoreTarget(item)}
                  onDelete={() => setDocDeleteTarget(item)}
                  getDaysRemaining={getDaysRemaining}
                />
              ))}
            </TabsContent>

            <TabsContent value="financial" className="space-y-3 mt-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum item financeiro na lixeira</p>
              ) : items.map((item) => (
                <TrashItemCard
                  key={item.id}
                  item={item}
                  onRestore={() => setRestoreTarget(item)}
                  onDelete={() => setDeleteTarget(item)}
                  getDaysRemaining={getDaysRemaining}
                />
              ))}
            </TabsContent>

            <TabsContent value="documents" className="space-y-3 mt-4">
              {docItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento na lixeira</p>
              ) : docItems.map((item) => (
                <DocTrashItemCard
                  key={item.id}
                  item={item}
                  onRestore={() => setDocRestoreTarget(item)}
                  onDelete={() => setDocDeleteTarget(item)}
                  getDaysRemaining={getDaysRemaining}
                />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Restore dialog (transactions/forecasts) */}
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

      {/* Permanent delete dialog (transactions/forecasts) */}
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

      {/* Restore dialog (documents) */}
      <Dialog open={!!docRestoreTarget} onOpenChange={(open) => { if (!open) setDocRestoreTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
                <RotateCcw className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle>Restaurar Documento</DialogTitle>
                <DialogDescription>
                  O documento será restaurado para a Central de Documentos.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{docRestoreTarget?.nome_arquivo_original}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">{docRestoreTarget?.tipo_arquivo}</Badge>
                <span>{docRestoreTarget ? `${(docRestoreTarget.tamanho_bytes / 1024).toFixed(1)}KB` : ""}</span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 p-2 mt-2">
                <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5" />
                <p className="text-xs text-muted-foreground">Motivo: {docRestoreTarget?.motivo_exclusao}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-center">Deseja restaurar este documento?</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDocRestoreTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleDocRestore} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent delete dialog (documents) */}
      <Dialog open={!!docDeleteTarget} onOpenChange={(open) => { if (!open) { setDocDeleteTarget(null); setDocDeleteReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <DialogTitle>Excluir Documento Permanentemente</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. O documento será removido permanentemente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{docDeleteTarget?.nome_arquivo_original}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">{docDeleteTarget?.tipo_arquivo}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-permanent-delete-reason" className="text-sm font-medium">
                Motivo da Exclusão Permanente *
              </Label>
              <Textarea
                id="doc-permanent-delete-reason"
                value={docDeleteReason}
                onChange={(e) => setDocDeleteReason(e.target.value)}
                placeholder="Informe o motivo da exclusão permanente..."
                rows={3}
              />
            </div>
            <p className="text-sm font-semibold text-center text-red-400">
              Deseja excluir permanentemente este documento?
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDocDeleteTarget(null); setDocDeleteReason(""); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDocPermanentDelete}
              disabled={docDeleting || !docDeleteReason.trim()}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {docDeleting ? "Excluindo..." : "Excluir Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

function TrashItemCard({
  item, onRestore, onDelete, getDaysRemaining,
}: {
  item: DeletedTransaction;
  onRestore: () => void;
  onDelete: () => void;
  getDaysRemaining: (restoreUntil: string) => number;
}) {
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
              <span className="text-xs font-mono text-muted-foreground">{item.displayId}</span>
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
            <Button variant="outline" size="sm" onClick={onRestore} className="gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="gap-1.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocTrashItemCard({
  item, onRestore, onDelete, getDaysRemaining,
}: {
  item: DocumentoTrashItem;
  onRestore: () => void;
  onDelete: () => void;
  getDaysRemaining: (restoreUntil: string) => number;
}) {
  const days = getDaysRemaining(item.restore_until);
  return (
    <Card key={item.id} className="group hover:shadow-md transition-all border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1">
                <FileText className="h-3 w-3" />
                Documento
              </Badge>
              <Badge variant="secondary" className="text-[10px]">{item.tipo_arquivo}</Badge>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-base">{item.nome_arquivo_original}</span>
              <span className="text-xs text-muted-foreground">
                {(item.tamanho_bytes / 1024).toFixed(1)}KB
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-amber-300 font-medium">Motivo da exclusão:</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.motivo_exclusao}</p>
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
            <Button variant="outline" size="sm" onClick={onRestore} className="gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="gap-1.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
