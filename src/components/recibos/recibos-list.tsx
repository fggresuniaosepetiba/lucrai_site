"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Download,
  Printer,
  Ban,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { Receipt } from "@/types";

interface RecibosListProps {
  recibos: Receipt[];
  onView: (recibo: Receipt) => void;
  onEdit: (recibo: Receipt) => void;
  onDownloadPdf: (recibo: Receipt) => void;
  onPrint: (recibo: Receipt) => void;
  onCancel: (recibo: Receipt) => void;
  onDelete: (recibo: Receipt) => void;
  onVerLancamento: (lancamentoId: string) => void;
}

export function RecibosList({
  recibos,
  onView,
  onEdit,
  onDownloadPdf,
  onPrint,
  onCancel,
  onDelete,
  onVerLancamento,
}: RecibosListProps) {
  if (recibos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">Nenhum recibo encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie seu primeiro recibo profissional
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left font-medium text-muted-foreground p-4">Número</th>
                <th className="text-left font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left font-medium text-muted-foreground p-4">Tipo</th>
                <th className="text-left font-medium text-muted-foreground p-4">Pagador / Recebedor</th>
                <th className="text-right font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left font-medium text-muted-foreground p-4">Origem</th>
                <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                <th className="text-right font-medium text-muted-foreground p-4 w-16">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => {
                const isCancelado = recibo.status === "cancelado";
                return (
                  <tr
                    key={recibo.id}
                    className={`border-b border-border/25 hover:bg-muted/30 transition-colors ${
                      isCancelado ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-xs font-mono text-muted-foreground ${isCancelado ? "line-through" : ""}`}>
                          {recibo.numero}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(recibo.data)}</td>
                    <td className="p-4">
                      {recibo.tipo === "recebimento" ? (
                        <Badge variant="success" className="gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          Recebimento
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <ArrowDownRight className="h-3 w-3" />
                          Pagamento
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      {recibo.nomePagador} / {recibo.nomeRecebedor}
                    </td>
                    <td className={`p-4 text-right font-medium tabular-nums ${
                      recibo.tipo === "recebimento" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {recibo.tipo === "recebimento" ? "+" : "-"}
                      {formatCurrency(recibo.valor)}
                    </td>
                    <td className="p-4">
                      {recibo.origem === "lancamento" && recibo.lancamentoId ? (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs gap-1"
                          onClick={() => onVerLancamento(recibo.lancamentoId!)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Lançamento
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs">Manual</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {isCancelado ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Ban className="h-3 w-3" />
                          Cancelado
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">Emitido</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => onView(recibo)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          {!isCancelado && (
                            <DropdownMenuItem onClick={() => onEdit(recibo)} className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onDownloadPdf(recibo)} className="gap-2">
                            <Download className="h-4 w-4" />
                            Baixar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPrint(recibo)} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Imprimir
                          </DropdownMenuItem>
                          {!isCancelado && (
                            <DropdownMenuItem onClick={() => onCancel(recibo)} className="gap-2 text-red-400">
                              <Ban className="h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                          {isCancelado && (
                            <DropdownMenuItem onClick={() => onDelete(recibo)} className="gap-2 text-red-400">
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
