"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useRecibosStore } from "@/store/recibos-store";
import { Shell } from "@/components/layout/shell";
import { RecibosList } from "@/components/recibos/recibos-list";
import { ReciboForm } from "@/components/recibos/recibo-form";
import type { ReciboFormData } from "@/components/recibos/recibo-form";
import { ReciboViewModal } from "@/components/recibos/recibo-view-modal";
import { ReciboCancelDialog } from "@/components/recibos/recibo-cancel-dialog";
import { ReciboFilters } from "@/components/recibos/recibo-filters";
import { RecibosRepositoryApi } from "@/services/api-repositories/recibos";
import { SignatureRepositoryApi } from "@/services/api-repositories/signature";
import { SettingsRepositoryApi } from "@/services/api-repositories/settings";
import { TransactionRepository } from "@/database/repositories/transactions";
import { downloadPdf, printRecibo } from "@/services/recibos/reciboPdfService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Plus, FileText } from "lucide-react";
import type { Receipt, SignatureConfig, AppSettings } from "@/types";

export default function RecibosPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando...</div>}>
      <RecibosPage />
    </Suspense>
  );
}

function RecibosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { filter, setFilterStatus, setFilterTipo } = useRecibosStore();
  const [recibos, setRecibos] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formPrefill, setFormPrefill] = useState<Partial<ReciboFormData> | undefined>(undefined);
  const [viewRecibo, setViewRecibo] = useState<Receipt | null>(null);
  const [cancelRecibo, setCancelRecibo] = useState<Receipt | null>(null);
  const [editRecibo, setEditRecibo] = useState<Receipt | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [assinatura, setAssinatura] = useState<SignatureConfig | null>(null);
  const initialized = useRef(false);
  const company = user?.company ?? "";
  const userName = user?.name ?? "Sistema";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      loadData();
    }
  }, [isAuthenticated, router, company]);

  useEffect(() => {
    if (!initialized.current) return;
    const acao = searchParams.get("acao");
    if (acao === "gerar-recibo") {
      const tipo = searchParams.get("tipo") as "recebimento" | "pagamento" | null;
      const valorStr = searchParams.get("valor");
      setFormPrefill({
        tipo: tipo || "recebimento",
        valor: valorStr ? parseFloat(valorStr) : undefined,
        data: searchParams.get("data") || undefined,
        referente: searchParams.get("referente") || undefined,
        nomePagador: searchParams.get("nomePagador") || undefined,
        nomeRecebedor: searchParams.get("nomeRecebedor") || undefined,
        lancamentoId: searchParams.get("lancamentoId") || undefined,
      });
      setShowForm(true);
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, initialized.current]);

  const loadData = async () => {
    try {
      const [recibosData, settingsData, assinaturaData] = await Promise.all([
        RecibosRepositoryApi.getAll(company),
        SettingsRepositoryApi.get(),
        SignatureRepositoryApi.get(),
      ]);
      setRecibos(recibosData);
      setAppSettings(settingsData || null);
      setAssinatura(assinaturaData || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecibos = recibos.filter((r) => {
    if (filter.filterStatus !== "todos" && r.status !== filter.filterStatus) return false;
    if (filter.filterTipo !== "todos" && r.tipo !== filter.filterTipo) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return (
        r.numero.toLowerCase().includes(q) ||
        r.nomePagador.toLowerCase().includes(q) ||
        r.nomeRecebedor.toLowerCase().includes(q) ||
        r.referente.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = async (data: ReciboFormData, criarLancamento: boolean) => {
    try {
      const recibo = await RecibosRepositoryApi.create({
        tipo: data.tipo,
        data: data.data,
        valor: data.valor,
        nomePagador: data.nomePagador,
        documentoPagador: data.documentoPagador,
        semDocumentoPagador: data.semDocumentoPagador,
        nomeRecebedor: data.nomeRecebedor,
        documentoRecebedor: data.documentoRecebedor,
        semDocumentoRecebedor: data.semDocumentoRecebedor,
        referente: data.referente,
        formaPagamento: data.formaPagamento,
        observacoes: data.observacoes,
        telefone: data.telefone,
        email: data.email,
        cidade: data.cidade,
        estado: data.estado,
        exibirAssinatura: data.exibirAssinatura,
        parcelaAtual: data.parcelaAtual,
        parcelasTotal: data.parcelasTotal,
        lancamentoId: data.lancamentoId || null,
        origem: "manual",
        criadoPor: userName,
      });

      if (data.lancamentoId) {
        await RecibosRepositoryApi.update(recibo.id, { lancamentoId: data.lancamentoId });
        toast("Recibo criado e vinculado", `Recibo ${recibo.numero} vinculado ao lançamento`, "success");
      } else if (criarLancamento) {
        const lancamento = await TransactionRepository.create(
          {
            type: data.tipo === "recebimento" ? "income" : "expense",
            value: data.valor,
            categoryId: "",
            categoryName: "Recibo",
            description: `Recibo ${recibo.numero} - ${data.referente}`,
            date: data.data,
            observation: `Gerado automaticamente pelo recibo ${recibo.numero}`,
          },
          company,
          userName
        );
        await RecibosRepositoryApi.update(recibo.id, { lancamentoId: lancamento.id });
        toast("Recibo e lançamento criados", `Recibo ${recibo.numero} gerado com lançamento financeiro`, "success");
      } else {
        toast("Recibo criado", `Recibo ${recibo.numero} gerado com sucesso`, "success");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      toast("Erro", "Não foi possível criar o recibo", "destructive");
    }
  };

  const handleEdit = async (data: ReciboFormData, _criarLancamento: boolean) => {
    if (!editRecibo) return;
    try {
      await RecibosRepositoryApi.update(editRecibo.id, {
        tipo: data.tipo,
        nomePagador: data.nomePagador,
        documentoPagador: data.documentoPagador,
        semDocumentoPagador: data.semDocumentoPagador,
        nomeRecebedor: data.nomeRecebedor,
        documentoRecebedor: data.documentoRecebedor,
        semDocumentoRecebedor: data.semDocumentoRecebedor,
        data: data.data,
        valor: data.valor,
        referente: data.referente,
        formaPagamento: data.formaPagamento,
        observacoes: data.observacoes,
        telefone: data.telefone,
        email: data.email,
        cidade: data.cidade,
        estado: data.estado,
        exibirAssinatura: data.exibirAssinatura,
        parcelaAtual: data.parcelaAtual,
        parcelasTotal: data.parcelasTotal,
      });

      toast("Recibo atualizado", `Recibo ${editRecibo.numero} atualizado com sucesso`, "success");
      setEditRecibo(null);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast("Erro", "Não foi possível atualizar o recibo", "destructive");
    }
  };

  const handleCancel = async (motivo: string) => {
    if (!cancelRecibo) return;
    try {
      await RecibosRepositoryApi.cancelar(cancelRecibo.id, motivo);

      toast("Recibo cancelado", `Recibo ${cancelRecibo.numero} foi cancelado`, "success");
      setCancelRecibo(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast("Erro", "Não foi possível cancelar o recibo", "destructive");
    }
  };

  const handleDownloadPdf = useCallback(async (recibo: Receipt) => {
    await downloadPdf(recibo, appSettings?.logoUrl, appSettings?.companyName, assinatura);
    await RecibosRepositoryApi.createAudit(recibo.id, "Downloaded", `Recibo ${recibo.numero} baixado`, userName);
  }, [appSettings, assinatura, userName]);

  const handlePrint = useCallback(async (recibo: Receipt) => {
    printRecibo(recibo, appSettings?.logoUrl, appSettings?.companyName, assinatura);
    await RecibosRepositoryApi.createAudit(recibo.id, "Printed", `Recibo ${recibo.numero} impresso`, userName);
  }, [appSettings, assinatura, userName]);

  const handleVerLancamento = (lancamentoId: string) => {
    router.push(`/financial?lancamento=${lancamentoId}`);
  };

  const handleNewRecibo = () => {
    setEditRecibo(null);
    setFormPrefill(undefined);
    setShowForm(true);
  };

  const handleEditClick = (recibo: Receipt) => {
    setEditRecibo(recibo);
    setFormPrefill({
      tipo: recibo.tipo,
      nomePagador: recibo.nomePagador,
      documentoPagador: recibo.documentoPagador,
      semDocumentoPagador: recibo.semDocumentoPagador,
      nomeRecebedor: recibo.nomeRecebedor,
      documentoRecebedor: recibo.documentoRecebedor,
      semDocumentoRecebedor: recibo.semDocumentoRecebedor,
      data: recibo.data,
      valor: recibo.valor,
      referente: recibo.referente,
      formaPagamento: recibo.formaPagamento,
      observacoes: recibo.observacoes,
      telefone: recibo.telefone,
      email: recibo.email,
      cidade: recibo.cidade,
      estado: recibo.estado,
      exibirAssinatura: recibo.exibirAssinatura,
      parcelaAtual: recibo.parcelaAtual,
      parcelasTotal: recibo.parcelasTotal,
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold">Central de Recibos</h1>
                <p className="text-sm text-muted-foreground">Emita e gerencie recibos profissionais de sua empresa</p>
              </div>
            </div>
          </div>
          <Button onClick={handleNewRecibo} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Recibo
          </Button>
        </div>

        <ReciboFilters
          filterStatus={filter.filterStatus}
          filterTipo={filter.filterTipo}
          onFilterStatus={setFilterStatus}
          onFilterTipo={setFilterTipo}
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>{filteredRecibos.length} recibo{filteredRecibos.length !== 1 ? "s" : ""} encontrado{filteredRecibos.length !== 1 ? "s" : ""}</span>
        </div>

        <RecibosList
          recibos={filteredRecibos}
          onView={setViewRecibo}
          onEdit={handleEditClick}
          onDownloadPdf={handleDownloadPdf}
          onPrint={handlePrint}
          onCancel={setCancelRecibo}
          onVerLancamento={handleVerLancamento}
        />

        {showForm && (
          <ReciboForm
            open={showForm}
            onClose={() => { setShowForm(false); setEditRecibo(null); }}
            onSubmit={editRecibo ? handleEdit : handleCreate}
            prefill={formPrefill}
            assinatura={assinatura}
          />
        )}

        {viewRecibo && (
          <ReciboViewModal
            recibo={viewRecibo}
            open={!!viewRecibo}
            onClose={() => setViewRecibo(null)}
            onDownloadPdf={handleDownloadPdf}
            onPrint={handlePrint}
            logoUrl={appSettings?.logoUrl}
            nomeEmpresa={appSettings?.companyName}
            onVerLancamento={handleVerLancamento}
          />
        )}

        {cancelRecibo && (
          <ReciboCancelDialog
            open={!!cancelRecibo}
            numeroRecibo={cancelRecibo.numero}
            onClose={() => setCancelRecibo(null)}
            onConfirm={handleCancel}
          />
        )}
      </div>
    </Shell>
  );
}
