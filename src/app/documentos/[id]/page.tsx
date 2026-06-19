"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { DocumentoRepository, DocumentoLogRepository } from "@/database/repositories/documentos";
import { DocumentoStorageService } from "@/services/documentos/documentos-storage.service";
import { DocumentoService } from "@/services/documentos/documentos.service";
import type { DocumentoFinanceiro, DocumentoLog } from "@/types";
import type { DadosDocumento } from "@/services/documentos/parser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft, FileText, Download, RefreshCw, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Loader2,
  Building2, ShoppingCart, Calculator, FileJson,
} from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  NOVO: { label: "Novo", color: "text-gray-400" },
  PROCESSANDO: { label: "Processando", color: "text-blue-400" },
  AGUARDANDO_CONFERENCIA: { label: "Aguardando Conferência", color: "text-amber-400" },
  CONVERTIDO: { label: "Convertido", color: "text-emerald-400" },
  REJEITADO: { label: "Rejeitado", color: "text-red-400" },
  ERRO: { label: "Erro", color: "text-red-400" },
};

const acaoLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  UPLOAD: { label: "Upload realizado", icon: <FileText className="h-4 w-4" /> },
  PROCESSAMENTO_INICIADO: { label: "Processamento iniciado", icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  PROCESSAMENTO_CONCLUIDO: { label: "Processamento concluído", icon: <CheckCircle className="h-4 w-4" /> },
  PROCESSAMENTO_ERRO: { label: "Erro no processamento", icon: <AlertTriangle className="h-4 w-4" /> },
  CONFIRMADO: { label: "Confirmado", icon: <CheckCircle className="h-4 w-4" /> },
  REJEITADO: { label: "Rejeitado", icon: <XCircle className="h-4 w-4" /> },
  REPROCESSADO: { label: "Reprocessado", icon: <RefreshCw className="h-4 w-4" /> },
  EXCLUIDO: { label: "Excluído", icon: <Trash2 className="h-4 w-4" /> },
};

export default function DetalheDocumentoPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const empresa_id = user?.company ?? "";
  const documentoId = params.id as string;

  const [doc, setDoc] = useState<DocumentoFinanceiro | null>(null);
  const [logs, setLogs] = useState<DocumentoLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadData();
  }, [isAuthenticated, router, documentoId]);

  const loadData = async () => {
    try {
      const [d, l] = await Promise.all([
        DocumentoRepository.getById(documentoId),
        DocumentoLogRepository.getByDocumento(documentoId),
      ]);
      if (!d) { toast("Documento não encontrado", "", "destructive"); router.push("/documentos"); return; }
      setDoc(d);
      setLogs(l.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()));

      if (d.arquivo_data) {
        setFileUrl(DocumentoStorageService.getFileUrl(d.arquivo_data, d.tipo_arquivo));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async () => {
    if (!doc) return;
    try {
      await DocumentoService.reprocessar(documentoId, empresa_id);
      toast("Reprocessando", "Documento será processado novamente", "success");
      loadData();
    } catch (err) {
      toast("Erro", err instanceof Error ? err.message : "Erro ao reprocessar", "destructive");
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = doc?.nome_arquivo_original || "documento";
      a.click();
    }
  };

  const tipoLabel: Record<string, string> = { PDF: "PDF", XML: "XML", JPG: "Imagem JPG", JPEG: "Imagem JPEG", PNG: "Imagem PNG" };

  if (loading) {
    return (
      <Shell>
        <Skeleton className="h-96 w-full rounded-xl" />
      </Shell>
    );
  }

  if (!doc) return null;

  const rawData = doc.dados_extraidos_raw ? JSON.parse(doc.dados_extraidos_raw) : null;
  let dados: DadosDocumento | null = null;
  if (doc.dados_estruturados) {
    try { dados = JSON.parse(doc.dados_estruturados); } catch { dados = null; }
  }

  function InfoRow({ label, value, className }: { label: string; value: string | null | undefined; className?: string }) {
    return (
      <div className={`flex justify-between py-1.5 text-sm ${className || ""}`}>
        <span className="text-muted-foreground shrink-0 mr-4">{label}</span>
        <span className="font-medium text-right">{value || "—"}</span>
      </div>
    );
  }

  function formatBRL(valor: number | null): string {
    if (valor === null || valor === undefined) return "—";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatPct(confianca: number | null): string {
    if (confianca === null || confianca === undefined) return "—";
    const pct = Math.round(confianca * 100);
    if (pct >= 95) return "99%";
    if (pct <= 5) return "5%";
    return `${Math.max(5, Math.min(99, pct))}%`;
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => router.push("/documentos")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{doc.nome_arquivo_original}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{tipoLabel[doc.tipo_arquivo] || doc.tipo_arquivo}</Badge>
              <span className={statusLabels[doc.status]?.color || ""}>
                {statusLabels[doc.status]?.label}
              </span>
              <Badge variant="outline" className="text-xs">{formatPct(doc.confianca_extracao)}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {fileUrl && (
              <Button variant="outline" size="sm" className="gap-1" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Baixar Original
              </Button>
            )}
            {(doc.status === "ERRO" || doc.status === "AGUARDANDO_CONFERENCIA") && (
              <Button variant="outline" size="sm" className="gap-1" onClick={handleReprocess}>
                <RefreshCw className="h-4 w-4" /> Reprocessar
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document viewer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Documento Original</CardTitle>
            </CardHeader>
            <CardContent>
              {fileUrl && doc.tipo_arquivo === "PDF" && (
                <iframe src={fileUrl} className="w-full h-[400px] rounded-lg border border-border/50" title="PDF" />
              )}
              {fileUrl && ["JPG", "JPEG", "PNG"].includes(doc.tipo_arquivo) && (
                <img src={fileUrl} alt="Documento" className="w-full rounded-lg border border-border/50" />
              )}
              {!fileUrl && (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted data - structured */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  Dados Extraídos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{dados?.documento?.tipo || doc.tipo_documento_detectado?.replace(/_/g, " ") || "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium">{formatBRL(dados?.financeiro?.valor_total ?? doc.valor_extraido)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{dados?.documento?.data_emissao || doc.data_extraida || "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nº Nota</span>
                  <span className="font-medium">{dados?.documento?.numero_nota || "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emitente</span>
                  <span className="font-medium text-right">{dados?.emitente?.razao_social || doc.emitente_extraido || "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinatário</span>
                  <span className="font-medium text-right">{dados?.destinatario?.razao_social || doc.favorecido_extraido || "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confiança</span>
                  <span className="font-medium">{formatPct(doc.confianca_extracao)}</span>
                </div>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Descrição</span>
                  <p className="font-medium mt-1">{doc.descricao_extraida || "—"}</p>
                </div>
              </CardContent>
            </Card>

            {dados?.produtos && dados.produtos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    Produtos ({dados.produtos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground">
                          <th className="text-left px-4 py-2 font-medium">Descrição</th>
                          <th className="text-right px-2 py-2 font-medium">Qtd</th>
                          <th className="text-right px-2 py-2 font-medium">Vl. Unit.</th>
                          <th className="text-right px-4 py-2 font-medium">Vl. Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.produtos.map((p, i) => (
                          <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                            <td className="px-4 py-2 max-w-[200px] truncate" title={p.descricao || ""}>{p.descricao || "—"}</td>
                            <td className="px-2 py-2 text-right">{p.quantidade ?? "—"}</td>
                            <td className="px-2 py-2 text-right">{formatBRL(p.valor_unitario)}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatBRL(p.valor_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {dados?.emitente && (dados.emitente.razao_social || dados.emitente.cnpj) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Emitente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <InfoRow label="Razão Social" value={dados.emitente.razao_social} />
                  <InfoRow label="CNPJ" value={dados.emitente.cnpj} />
                  <InfoRow label="IE" value={dados.emitente.inscricao_estadual} />
                  <InfoRow label="Endereço" value={dados.emitente.endereco} />
                  <InfoRow label="Cidade/Estado" value={dados.emitente.cidade && dados.emitente.estado ? `${dados.emitente.cidade}/${dados.emitente.estado}` : null} />
                </CardContent>
              </Card>
            )}

            {dados?.tributacao && (dados.tributacao.cfop || dados.tributacao.ncm) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    Tributação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <InfoRow label="CFOP" value={dados.tributacao.cfop} />
                  <InfoRow label="NCM" value={dados.tributacao.ncm} />
                  <InfoRow label="CST" value={dados.tributacao.cst} />
                  <InfoRow label="ICMS" value={formatBRL(dados.tributacao.icms)} />
                  <InfoRow label="PIS" value={formatBRL(dados.tributacao.pis)} />
                  <InfoRow label="COFINS" value={formatBRL(dados.tributacao.cofins)} />
                </CardContent>
              </Card>
            )}

            {doc.lancamento_id && (
              <Card className="border-emerald-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Lançamento criado</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => router.push("/financial")}>
                      Ver na página Financeiro →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {doc.status === "REJEITADO" && doc.motivo_rejeicao && (
              <Card className="border-red-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Motivo da rejeição</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{doc.motivo_rejeicao}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {doc.ultimo_erro && (
              <Card className="border-red-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Erro de processamento</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{doc.ultimo_erro}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Audit timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Timeline de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {logs.map((log, i) => (
                <div key={log.id} className="flex gap-3 pb-4 relative">
                  {i < logs.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                  )}
                  <div className="shrink-0 mt-0.5">
                    {acaoLabels[log.acao]?.icon || <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{acaoLabels[log.acao]?.label || log.acao}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(log.criado_em)}</p>
                    {log.detalhes && (
                      <details className="mt-1">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Detalhes</summary>
                        <pre className="text-xs text-muted-foreground mt-1 font-mono whitespace-pre-wrap">
                          {(() => { try { return JSON.stringify(JSON.parse(log.detalhes!), null, 2); } catch { return log.detalhes; } })()}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
