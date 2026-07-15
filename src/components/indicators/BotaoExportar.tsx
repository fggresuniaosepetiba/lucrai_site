"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FilePieChart, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface BotaoExportarProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
}

export function BotaoExportar({ onExportPDF, onExportExcel, onExportCSV }: BotaoExportarProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: FileText, label: "Exportar como PDF", onClick: onExportPDF, desc: "Relatório completo formatado" },
    { icon: FileSpreadsheet, label: "Exportar como Excel", onClick: onExportExcel, desc: "Planilha com dados brutos" },
    { icon: FilePieChart, label: "Exportar como CSV", onClick: onExportCSV, desc: "Arquivo separado por vírgulas" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-14 right-0 w-64 rounded-xl border border-border/50 bg-popover shadow-xl p-2 space-y-1 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 mb-1">
            <span className="text-xs font-medium text-muted-foreground">Exportar dados</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground/50 hover:text-muted-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                a.onClick?.();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <a.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
}
