"use client";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Printer, X, ExternalLink, Ban } from "lucide-react";
import type { Receipt } from "@/types";

interface ReciboViewModalProps {
  recibo: Receipt;
  open: boolean;
  onClose: () => void;
  onDownloadPdf: (recibo: Receipt) => void;
  onPrint: (recibo: Receipt) => void;
  logoUrl?: string;
  nomeEmpresa?: string;
  onVerLancamento?: (lancamentoId: string) => void;
}

export function ReciboViewModal({
  recibo,
  open,
  onClose,
  onDownloadPdf,
  onPrint,
  logoUrl,
  nomeEmpresa,
  onVerLancamento,
}: ReciboViewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const isRecebimento = recibo.tipo === "recebimento";
  const isCancelado = recibo.status === "cancelado";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Recibo {recibo.numero}</DialogTitle>
            {isCancelado && (
              <Badge variant="destructive" className="gap-1">
                <Ban className="h-3 w-3" />
                Cancelado
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isCancelado && recibo.cancelamento && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm">
            <p className="font-medium text-red-400">Cancelado em {formatDate(recibo.cancelamento.canceladoEm)}</p>
            <p className="text-muted-foreground mt-1">Motivo: {recibo.cancelamento.motivo}</p>
          </div>
        )}

        <div ref={previewRef} className="rounded-xl border bg-card p-6 space-y-4">
          {logoUrl && (
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={nomeEmpresa || "Logo"} className="h-12 object-contain" />
            </div>
          )}

          {nomeEmpresa && (
            <p className="text-center text-lg font-semibold">{nomeEmpresa}</p>
          )}

          <div className="text-center">
            <h1 className="text-xl font-bold text-primary">
              {isRecebimento ? "RECIBO DE RECEBIMENTO" : "RECIBO DE PAGAMENTO"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Nº {recibo.numero}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">{isRecebimento ? recibo.nomePagador : recibo.nomeRecebedor}</p>
              <p className="text-muted-foreground">
                {isRecebimento
                  ? (recibo.semDocumentoPagador ? "Documento não informado" : recibo.documentoPagador)
                  : (recibo.semDocumentoRecebedor ? "Documento não informado" : recibo.documentoRecebedor)}
              </p>
            </div>
            <div>
              <p className="font-medium">{isRecebimento ? recibo.nomeRecebedor : recibo.nomePagador}</p>
              <p className="text-muted-foreground">
                {isRecebimento
                  ? (recibo.semDocumentoRecebedor ? "Documento não informado" : recibo.documentoRecebedor)
                  : (recibo.semDocumentoPagador ? "Documento não informado" : recibo.documentoPagador)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-primary">{formatCurrency(recibo.valor)}</p>
            <p className="text-sm text-muted-foreground mt-2 italic">{recibo.valorPorExtenso}</p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Referente a</p>
              <p>{recibo.referente}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Data</p>
                <p>{formatDate(recibo.data)}</p>
              </div>
              {recibo.formaPagamento && (
                <div>
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Forma de Pagamento</p>
                  <p>{recibo.formaPagamento}</p>
                </div>
              )}
            </div>
            {recibo.parcelaAtual && recibo.parcelasTotal ? (
              <div>
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Parcelamento</p>
                <p>{recibo.parcelaAtual}/{recibo.parcelasTotal}</p>
              </div>
            ) : null}
            {recibo.observacoes && (
              <div>
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Observações</p>
                <p>{recibo.observacoes}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Emitido eletronicamente pelo LUCRAÍ</span>
            <span>{formatDate(recibo.criadoEm)}</span>
            <span>{recibo.numero}</span>
          </div>
        </div>

        {recibo.lancamentoId && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
            <span className="text-sm font-medium">Recibo vinculado ao lançamento financeiro</span>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => onVerLancamento?.(recibo.lancamentoId!)}>
              <ExternalLink className="h-3 w-3" />
              Ver Lançamento
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            Fechar
          </Button>
          <Button variant="outline" onClick={() => onPrint(recibo)} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={() => onDownloadPdf(recibo)} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
