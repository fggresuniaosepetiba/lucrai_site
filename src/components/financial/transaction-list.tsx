"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "./delete-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import type { Transaction, Category } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, reason: string) => Promise<void>;
  categories: Category[];
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const handleDeleteConfirm = async (reason: string) => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id, reason);
    toast("Lançamento enviado para a lixeira com sucesso.");
    setDeleteTarget(null);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ArrowDownRight className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">Nenhum lançamento encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie seu primeiro lançamento financeiro
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                  <th className="text-left font-medium text-muted-foreground p-4">Data</th>
                  <th className="text-right font-medium text-muted-foreground p-4">Valor</th>
                  <th className="text-right font-medium text-muted-foreground p-4 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/25 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{t.displayId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {t.type === "income" ? (
                        <Badge variant="success" className="gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <ArrowDownRight className="h-3 w-3" />
                          Saída
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 font-medium">{t.description}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {t.categoryName}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(t.date)}</td>
                    <td className={`p-4 text-right font-medium tabular-nums ${
                      t.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.value)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(t)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(t)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {deleteTarget && (
        <DeleteDialog
          transaction={deleteTarget}
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
