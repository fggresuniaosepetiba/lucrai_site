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
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface ReciboCancelDialogProps {
  open: boolean;
  numeroRecibo: string;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
}

export function ReciboCancelDialog({ open, numeroRecibo, onClose, onConfirm }: ReciboCancelDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!motivo.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(motivo.trim());
      setMotivo("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMotivo("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <DialogTitle>Cancelar Recibo</DialogTitle>
              <DialogDescription>
                Você está cancelando o recibo <strong>{numeroRecibo}</strong>. Deseja continuar?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Motivo do cancelamento <span className="text-red-400">*</span>
          </label>
          <Textarea
            placeholder="Descreva o motivo do cancelamento..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!motivo.trim() || submitting}
          >
            {submitting ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
