"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { useDocumentos } from "@/hooks/useDocumentos";
import { DocumentoService } from "@/services/documentos/documentos.service";
import { DocumentoStorageService } from "@/services/documentos/documentos-storage.service";
import type { DocumentoFinanceiro, DocumentoStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Upload, FileText, FileSpreadsheet, FileImage, Search,
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2,
  Eye, ChevronLeft, ChevronRight, Loader2, UploadCloud,
  X, AlertTriangle, DollarSign, BarChart3,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusConfig: Record<DocumentoStatus, { label: string; color: string; icon: React.ReactNode }> = {
  NOVO: { label: "Novo", color: "bg-gray-500/15 text-gray-400", icon: <Clock className="h-3 w-3" /> },
  PROCESSANDO: { label: "Processando", color: "bg-blue-500/15 text-blue-400", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  AGUARDANDO_CONFERENCIA: { label: "Aguardando", color: "bg-amber-500/15 text-amber-400", icon: <AlertCircle className="h-3 w-3" /> },
  CONVERTIDO: { label: "Convertido", color: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle className="h-3 w-3" /> },
  REJEITADO: { label: "Rejeitado", color: "bg-red-500/15 text-red-400", icon: <XCircle className="h-3 w-3" /> },
  ERRO: { label: "Erro", color: "bg-red-500/25 text-red-400", icon: <AlertTriangle className="h-3 w-3" /> },
};

const tipoIcon: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-red-400" />,
  XML: <FileSpreadsheet className="h-4 w-4 text-blue-400" />,
  JPG: <FileImage className="h-4 w-4 text-green-400" />,
  JPEG: <FileImage className="h-4 w-4 text-green-400" />,
  PNG: <FileImage className="h-4 w-4 text-green-400" />,
};

const ITEMS_PER_PAGE = 15;

export default function DocumentosPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const empresa_id = user?.company ?? "";
  const usuario_id = user?.email ?? "";

  const { documentos, loading, stats, refresh } = useDocumentos(empresa_id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; doc: DocumentoFinanceiro | null }>({ open: false, doc: null });
  const [deleteReason, setDeleteReason] = useState("");
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
  }, [isAuthenticated, router]);

  const filtered = useMemo(() => {
    let result = [...documentos];
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d.nome_arquivo_original.toLowerCase().includes(q) ||
        d.descricao_extraida?.toLowerCase().includes(q) ||
        d.favorecido_extraido?.toLowerCase().includes(q) ||
        d.emitente_extraido?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
    return result;
  }, [documentos, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const typeCheck = DocumentoStorageService.validateFileType(file);
      if (typeCheck.valid) valid.push(file);
    }
    setUploadFiles((prev) => [...prev, ...valid].slice(0, 10));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    try {
      await DocumentoService.upload(uploadFiles, empresa_id, usuario_id);
      toast(`${uploadFiles.length} documento(s) enviado(s)`, "A IA está processando.", "success");
      setUploadFiles([]);
      setShowUpload(false);
      refresh();
    } catch (err) {
      toast("Erro no upload", err instanceof Error ? err.message : "Tente novamente", "destructive");
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      await DocumentoService.reprocessar(id);
      toast("Reprocessando", "Documento será processado novamente", "success");
      refresh();
    } catch (err) {
      toast("Erro", err instanceof Error ? err.message : "Não foi possível reprocessar", "destructive");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.doc || !deleteReason.trim()) return;
    setDeleting(true);
    try {
      await DocumentoService.excluir(
        deleteDialog.doc.id,
        empresa_id,
        deleteReason,
        usuario_id,
        user?.name || "Sistema",
        deletePermanent
      );
      toast("Documento excluído", "Enviado para a lixeira", "success");
      setDeleteDialog({ open: false, doc: null });
      setDeleteReason("");
      setDeletePermanent(false);
    } catch (err) {
      toast("Erro", err instanceof Error ? err.message : "Não foi possível excluir", "destructive");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files) handleFileSelect(e.dataTransfer.files);
    };
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);
    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Drag overlay */}
        {dragOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-2xl border-2 border-dashed border-primary/50 bg-card p-12 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium">Solte os arquivos aqui</p>
              <p className="text-sm text-muted-foreground">PDF, XML, JPG, JPEG, PNG</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Central Inteligente de Documentos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Envie documentos financeiros e deixe a IA trabalhar por você.
            </p>
          </div>
          <Button onClick={() => setShowUpload(true)} className="gap-2 shrink-0">
            <Upload className="h-4 w-4" />
            Enviar Documento(s)
          </Button>
        </div>

        {/* Impact Widget */}
        {stats && stats.total > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo economizado este mês</p>
                    <p className="text-lg font-bold text-primary">
                      {stats.economia_estimada_minutos >= 60
                        ? `≈ ${Math.floor(stats.economia_estimada_minutos / 60)}h ${stats.economia_estimada_minutos % 60}min`
                        : `${stats.economia_estimada_minutos}min`}{" "}
                      <span className="text-sm font-normal text-muted-foreground">economizados</span>
                    </p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{stats.convertidos_mes} docs convertidos</span>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatCurrency(stats.valor_total_automatizado)} automatizados</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, valor, favorecido..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 rounded-lg border p-1 overflow-x-auto">
            {[
              { value: "all", label: "Todos" },
              { value: "AGUARDANDO_CONFERENCIA", label: "Aguardando" },
              { value: "PROCESSANDO", label: "Processando" },
              { value: "CONVERTIDO", label: "Convertidos" },
              { value: "REJEITADO", label: "Rejeitados" },
              { value: "ERRO", label: "Erros" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-2xl bg-muted p-6 mb-4">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum documento encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search || statusFilter !== "all"
                ? "Tente ajustar os filtros ou a busca."
                : "Envie notas fiscais, comprovantes, boletos e deixe a IA extrair os dados automaticamente."}
            </p>
            {!search && statusFilter === "all" && (
              <Button onClick={() => setShowUpload(true)} className="mt-4 gap-2">
                <Upload className="h-4 w-4" />
                Enviar primeiro documento
              </Button>
            )}
          </div>
        )}

        {/* Document list */}
        {paginated.length > 0 && (
          <>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/50">
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Arquivo</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Tipo</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Valor</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Data</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Favorecido</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((doc) => (
                      <tr key={doc.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0">{tipoIcon[doc.tipo_arquivo] || <FileText className="h-4 w-4" />}</div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[200px]" title={doc.nome_arquivo_original}>
                                {doc.nome_arquivo_original}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(doc.criado_em)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {doc.tipo_documento_detectado?.replace(/_/g, " ") || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">
                            {doc.valor_extraido ? formatCurrency(doc.valor_extraido) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm">{doc.data_extraida || "—"}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm truncate max-w-[150px] block" title={doc.favorecido_extraido || doc.emitente_extraido || ""}>
                            {doc.favorecido_extraido || doc.emitente_extraido || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={`gap-1.5 ${statusConfig[doc.status]?.color || ""}`}
                          >
                            {statusConfig[doc.status]?.icon}
                            {statusConfig[doc.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {doc.status === "AGUARDANDO_CONFERENCIA" ? (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs gap-1"
                                onClick={() => router.push(`/documentos/${doc.id}/conferencia`)}
                              >
                                <Eye className="h-3 w-3" />
                                Conferir
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => router.push(`/documentos/${doc.id}`)}
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {(doc.status === "ERRO" || doc.status === "AGUARDANDO_CONFERENCIA") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleReprocess(doc.id)}
                                title="Reprocessar"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                              onClick={() => setDeleteDialog({ open: true, doc })}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Enviar Documentos</DialogTitle>
              <DialogDescription>
                Arraste arquivos ou clique para selecionar. Aceitamos PDF, XML, JPG, JPEG e PNG.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div
                ref={dropRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center transition-colors"
              >
                <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Clique para selecionar ou arraste arquivos aqui</p>
                <p className="text-xs text-muted-foreground mt-1">Máx. 10MB por arquivo · Até 10 arquivos</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xml,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {uploadFiles.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uploadFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {file.type.includes("pdf") ? <FileText className="h-4 w-4 text-red-400 shrink-0" /> :
                         file.type.includes("xml") ? <FileSpreadsheet className="h-4 w-4 text-blue-400 shrink-0" /> :
                         <FileImage className="h-4 w-4 text-green-400 shrink-0" />}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                      </div>
                      <button onClick={() => setUploadFiles((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowUpload(false); setUploadFiles([]); }}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0 || uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Enviar {uploadFiles.length} documento(s)</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => { if (!open) { setDeleteDialog({ open: false, doc: null }); setDeleteReason(""); setDeletePermanent(false); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <DialogTitle>Excluir Documento</DialogTitle>
                  <DialogDescription>
                    Informe o motivo da exclusão. O documento será enviado para a lixeira.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {deleteDialog.doc && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
                  <p className="text-sm font-medium">{deleteDialog.doc.nome_arquivo_original}</p>
                  <p className="text-xs text-muted-foreground">
                    {deleteDialog.doc.tipo_arquivo} &middot; {(deleteDialog.doc.tamanho_bytes / 1024).toFixed(1)}KB
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="delete-reason" className="text-sm font-medium">
                  Motivo da Exclusão *
                </Label>
                <Textarea
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Descreva o motivo da exclusão..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => { setDeleteDialog({ open: false, doc: null }); setDeleteReason(""); }}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting || !deleteReason.trim()}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Excluindo..." : "Excluir Documento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
