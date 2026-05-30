"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface DeleteDialogProps {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function DeleteDialog({ transaction, open, onClose, onConfirm }: DeleteDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("O motivo da exclusão é obrigatório.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
      setReason("");
      onClose();
    } catch {
      setError("Erro ao excluir. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setReason("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <DialogTitle>Excluir Lançamento</DialogTitle>
              <DialogDescription>
                Esta ação moverá o lançamento para a lixeira.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                transaction.type === "income"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }`}>
                {transaction.type === "income" ? "Entrada" : "Saída"}
              </span>
              <span className="text-sm font-medium">{transaction.description}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{transaction.categoryName}</span>
              <span>{formatDate(transaction.date)}</span>
              <span className={`font-semibold ${
                transaction.type === "income" ? "text-emerald-400" : "text-red-400"
              }`}>
                {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.value)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-1">
              Motivo da exclusão
              <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo da exclusão..."
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              rows={3}
              required
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {submitting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
