"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { DocumentoRepositoryApi } from "@/services/api-repositories/documents";
import { CategoryRepositoryApi } from "@/services/api-repositories/categories";
import { useConferencia } from "@/hooks/useConferencia";
import { DocumentoAprendizadoService } from "@/services/documentos/documentos-aprendizado.service";
import type { DocumentoFinanceiro, Category, TipoMovimentacao } from "@/types";
import type { DadosDocumento } from "@/services/documentos/parser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { todayStr } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, Check, X, FileText, Brain,
  AlertTriangle, Lightbulb, Plus, Calendar,
  Building2, Calculator, ShoppingCart, FileSearch, FileJson,
  User, Truck, Banknote, BarChart3,
} from "lucide-react";

function formatBRL(valor: number | null | undefined): string {
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground shrink-0 mr-4">{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-1">
        {title && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
            {icon}
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export default function ConferenciaPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const { confirmar, rejeitar, confirming, rejecting } = useConferencia();

  const documentoId = params.id as string;
  const empresa_id = user?.company ?? "";
  const usuario_id = user?.email ?? "";
  const usuario_nome = user?.name ?? "Sistema";

  const [doc, setDoc] = useState<DocumentoFinanceiro | null>(null);
  const [dados, setDados] = useState<DadosDocumento | null>(null);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [aprendizadoInfo, setAprendizadoInfo] = useState<{
    aplicado: boolean; frequencia: number;
  } | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [navDocs, setNavDocs] = useState<{ id: string; nome: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("resumo");

  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [formData, setFormData] = useState({
    tipo_movimentacao: "" as string,
    valor: "",
    data: "",
    descricao: "",
    categoria_id: "",
    favorecido: "",
    observacoes: "",
  });

  const hoje = todayStr();
  const isFutureDate = formData.data > hoje;

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadData();
  }, [isAuthenticated, router, documentoId, empresa_id]);

  const loadData = async () => {
    try {
      const [d, cats, allDocs] = await Promise.all([
        DocumentoRepositoryApi.getById(documentoId),
        CategoryRepositoryApi.getAll(),
        DocumentoRepositoryApi.getAll("AGUARDANDO_CONFERENCIA"),
      ]);
      if (!d) { toast("Documento não encontrado", "", "destructive"); router.push("/documentos"); return; }

      setDoc(d);
      setCategorias(cats);

      if (d.dados_estruturados) {
        try {
          const parsed = JSON.parse(d.dados_estruturados);
          setDados(parsed);
        } catch {
          setDados(null);
        }
      }

      const idx = allDocs.findIndex((x: DocumentoFinanceiro) => x.id === documentoId);
      setNavDocs(allDocs.map((x: DocumentoFinanceiro) => ({ id: x.id, nome: x.nome_arquivo_original })));
      setCurrentIndex(idx);

      DocumentoRepositoryApi.getDownloadUrl(documentoId).then(setFileUrl).catch(() => {});

      setFormData({
        tipo_movimentacao: d.tipo_movimentacao_sugerido || dados?.interpretacao_financeira?.tipo_movimentacao || "",
        valor: d.valor_extraido?.toString() || "",
        data: d.data_extraida || "",
        descricao: dados?.interpretacao_financeira?.descricao_sugerida || d.descricao_extraida || "",
        categoria_id: d.categoria_sugerida_id || "",
        favorecido: dados?.destinatario?.razao_social || d.favorecido_extraido || d.emitente_extraido || "",
        observacoes: "",
      });

      const aprend = await DocumentoAprendizadoService.buscarSugestao(
        empresa_id, d.emitente_extraido, d.favorecido_extraido
      );
      setAprendizadoInfo(aprend.frequencia > 0 ? { aplicado: aprend.aplicado, frequencia: aprend.frequencia } : null);
      if (aprend.categoria_id && !d.categoria_sugerida_id) {
        setFormData((prev) => ({ ...prev, categoria_id: aprend.categoria_id || "" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCreatingCategory(true);
    try {
      const tipo = formData.tipo_movimentacao === "RECEITA" ? "income" as const : "expense" as const;
      const color = tipo === "income" ? "#22c55e" : "#ef4444";
      const created = await CategoryRepositoryApi.create(
        { name, type: tipo, color, icon: "tag" }
      );
      setCategorias((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, categoria_id: created.id }));
      setNewCategoryName("");
      setShowCreateCategory(false);
      toast("Categoria criada", "Nova categoria disponível em todo o sistema", "success");
    } catch {
      toast("Erro", "Não foi possível criar categoria", "destructive");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleConfirm = async () => {
    if (!doc) return;
    if (!formData.tipo_movimentacao) { toast("Campo obrigatório", "Selecione o tipo de movimentação", "destructive"); return; }
    if (!formData.valor) { toast("Campo obrigatório", "Informe o valor", "destructive"); return; }
    if (!formData.data) { toast("Campo obrigatório", "Informe a data", "destructive"); return; }
    if (!formData.descricao) { toast("Campo obrigatório", "Informe a descrição", "destructive"); return; }
    if (!formData.categoria_id) { toast("Campo obrigatório", "Selecione a categoria", "destructive"); return; }

    try {
      const result = await confirmar(
        documentoId,
        {
          valor: parseFloat(formData.valor),
          data_lancamento: formData.data,
          descricao: formData.descricao,
          categoria_id: formData.categoria_id,
          tipo_movimentacao: formData.tipo_movimentacao as TipoMovimentacao,
          favorecido: formData.favorecido || undefined,
          observacoes: formData.observacoes || undefined,
        },
        usuario_id,
        usuario_nome,
        empresa_id
      );

      if (result.tipo === "forecast") {
        toast("Previsão criada", `Documento convertido em previsão futura na Previsão de Caixa`, "success");
      } else {
        toast("Lançamento criado", `Documento convertido em lançamento financeiro`, "success");
      }

      if (currentIndex >= 0 && currentIndex < navDocs.length - 1) {
        router.push(`/documentos/${navDocs[currentIndex + 1].id}/conferencia`);
      } else {
        router.push("/documentos");
      }
    } catch (err) {
      toast("Erro", err instanceof Error ? err.message : "Erro ao confirmar", "destructive");
    }
  };

  const handleRejectClick = () => {
    setRejectReason("");
    setRejectConfirm(false);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    setRejectConfirm(true);
  };

  const handleRejectExecute = async () => {
    if (!doc || !rejectReason.trim()) return;
    try {
      await rejeitar(documentoId, rejectReason.trim(), usuario_id, empresa_id);
      toast("Documento rejeitado", "", "success");
      setShowRejectDialog(false);
      setRejectReason("");
      setRejectConfirm(false);
      if (currentIndex >= 0 && currentIndex < navDocs.length - 1) {
        router.push(`/documentos/${navDocs[currentIndex + 1].id}/conferencia`);
      } else {
        router.push("/documentos");
      }
    } catch (err) {
      toast("Erro", err instanceof Error ? err.message : "Não foi possível rejeitar", "destructive");
    }
  };

  const handleNavigate = (idx: number) => {
    if (idx >= 0 && idx < navDocs.length) {
      router.push(`/documentos/${navDocs[idx].id}/conferencia`);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[500px] rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </Shell>
    );
  }

  if (!doc) return null;

  const incomeCategories = categorias.filter((c) => c.type === "income");
  const expenseCategories = categorias.filter((c) => c.type === "expense");
  const filteredCats = formData.tipo_movimentacao === "RECEITA" ? incomeCategories
    : formData.tipo_movimentacao === "DESPESA" ? expenseCategories
    : categorias;

  const isPdf = doc.tipo_arquivo === "PDF";
  const isImage = ["JPG", "JPEG", "PNG"].includes(doc.tipo_arquivo);
  const isXml = doc.tipo_arquivo === "XML";

  const confPct = formatPct(doc.confianca_extracao);

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/documentos")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          {navDocs.length > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleNavigate(currentIndex - 1)} disabled={currentIndex <= 0} className="h-8 gap-1">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <span className="text-xs text-muted-foreground">{currentIndex + 1} de {navDocs.length}</span>
              <Button variant="outline" size="sm" onClick={() => handleNavigate(currentIndex + 1)} disabled={currentIndex >= navDocs.length - 1} className="h-8 gap-1">
                Próximo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="lg:sticky lg:top-4 lg:h-[calc(100vh-12rem)]">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{doc.nome_arquivo_original}</span>
                </div>
                <Badge variant={doc.confianca_extracao !== null && doc.confianca_extracao >= 0.7 ? "default" : "outline"} className="text-xs ml-2">
                  {confPct} confiança
                </Badge>
              </div>
              <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
                {isPdf && fileUrl && (
                  <iframe src={fileUrl} className="w-full h-full rounded-lg border border-border/50" title="Documento PDF" />
                )}
                {isImage && fileUrl && (
                  <img src={fileUrl} alt="Documento" className="max-w-full max-h-full object-contain rounded-lg" />
                )}
                {isXml && (
                  <div className="w-full h-full overflow-auto p-4">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                      {doc.dados_extraidos_raw
                        ? JSON.stringify(JSON.parse(doc.dados_extraidos_raw), null, 2)
                        : "Conteúdo XML processado."}
                    </pre>
                  </div>
                )}
                {!isPdf && !isImage && !isXml && (
                  <div className="text-center text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">Visualização não disponível para este tipo de arquivo.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Conferência</h2>
                    <p className="text-xs text-muted-foreground">Documento identificado pela IA</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {doc.tipo_documento_detectado?.replace(/_/g, " ") || "Não identificado"}
                    </Badge>
                    {doc.confianca_extracao !== null && (
                      <Badge
                        variant={doc.confianca_extracao >= 0.7 ? "default" : "outline"}
                        className={`text-xs ${doc.confianca_extracao < 0.5 ? "text-amber-400 border-amber-400/30" : ""}`}
                      >
                        {confPct}
                      </Badge>
                    )}
                  </div>
                </div>

                {aprendizadoInfo && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {aprendizadoInfo.aplicado
                          ? "Categoria sugerida com base no seu histórico"
                          : `Sugestão baseada em ${aprendizadoInfo.frequencia} ocorrência(s) anterior(es)`}
                      </p>
                      {aprendizadoInfo.aplicado && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Esta categoria foi aplicada automaticamente. Você pode alterá-la se necessário.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {doc.resumo_executivo && (
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-start gap-3">
                    <Brain className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Resumo da Extração</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{doc.resumo_executivo}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full flex-wrap h-auto gap-1">
                    <TabsTrigger value="resumo" className="text-xs flex-1 min-w-[60px]"><BarChart3 className="h-3 w-3 mr-1" />Resumo</TabsTrigger>
                    <TabsTrigger value="fiscal" className="text-xs flex-1 min-w-[60px]"><FileSearch className="h-3 w-3 mr-1" />Fiscal</TabsTrigger>
                    <TabsTrigger value="empresas" className="text-xs flex-1 min-w-[60px]"><Building2 className="h-3 w-3 mr-1" />Empresas</TabsTrigger>
                    <TabsTrigger value="produtos" className="text-xs flex-1 min-w-[60px]"><ShoppingCart className="h-3 w-3 mr-1" />Produtos</TabsTrigger>
                    <TabsTrigger value="tributos" className="text-xs flex-1 min-w-[60px]"><Calculator className="h-3 w-3 mr-1" />Tributos</TabsTrigger>
                    <TabsTrigger value="tecnico" className="text-xs flex-1 min-w-[60px]"><FileJson className="h-3 w-3 mr-1" />Técnico</TabsTrigger>
                  </TabsList>

                  <TabsContent value="resumo" className="space-y-3 mt-3">
                    <SectionCard title="Visão Geral" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
                      <InfoRow label="Tipo" value={doc.tipo_documento_detectado?.replace(/_/g, " ") || null} />
                      <InfoRow label="Categoria" value={dados?.interpretacao_financeira?.categoria_sugerida || null} />
                      <InfoRow label="Valor Total" value={formatBRL(dados?.financeiro?.valor_total ?? doc.valor_extraido)} />
                      <InfoRow label="Data" value={doc.data_extraida || dados?.documento?.data_emissao || null} />
                      <InfoRow label="Fornecedor" value={dados?.emitente?.razao_social || doc.emitente_extraido || null} />
                      <InfoRow label="Movimentação" value={dados?.interpretacao_financeira?.tipo_movimentacao || doc.tipo_movimentacao_sugerido || null} />
                    </SectionCard>
                    {dados?.interpretacao_financeira?.resumo_executivo && (
                      <SectionCard>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {dados.interpretacao_financeira.resumo_executivo}
                        </p>
                      </SectionCard>
                    )}
                  </TabsContent>

                  <TabsContent value="fiscal" className="space-y-3 mt-3">
                    <SectionCard title="Documento Fiscal" icon={<FileSearch className="h-4 w-4 text-primary" />}>
                      <InfoRow label="Tipo" value={dados?.documento?.tipo || doc.tipo_documento_detectado?.replace(/_/g, " ") || null} />
                      <InfoRow label="Nº Nota" value={dados?.documento?.numero_nota || null} />
                      <InfoRow label="Série" value={dados?.documento?.serie || null} />
                      <InfoRow label="Chave de Acesso" value={dados?.documento?.chave_acesso ? `${dados.documento.chave_acesso.substring(0, 10)}...${dados.documento.chave_acesso.substring(40)}` : null} />
                      <InfoRow label="Data de Emissão" value={dados?.documento?.data_emissao || null} />
                      <InfoRow label="Data de Saída" value={dados?.documento?.data_saida || null} />
                      <InfoRow label="Situação" value={dados?.documento?.situacao || null} />
                      <InfoRow label="Protocolo" value={dados?.documento?.protocolo_autorizacao || null} />
                    </SectionCard>
                  </TabsContent>

                  <TabsContent value="empresas" className="space-y-3 mt-3">
                    <SectionCard title="Emitente" icon={<Building2 className="h-4 w-4 text-blue-400" />}>
                      <InfoRow label="Razão Social" value={dados?.emitente?.razao_social || doc.emitente_extraido || null} />
                      <InfoRow label="Nome Fantasia" value={dados?.emitente?.nome_fantasia || null} />
                      <InfoRow label="CNPJ" value={dados?.emitente?.cnpj || null} />
                      <InfoRow label="Inscrição Estadual" value={dados?.emitente?.inscricao_estadual || null} />
                      <InfoRow label="Endereço" value={dados?.emitente?.endereco || null} />
                      <InfoRow label="Cidade / Estado" value={dados?.emitente?.cidade && dados?.emitente?.estado ? `${dados.emitente.cidade} / ${dados.emitente.estado}` : null} />
                      <InfoRow label="CEP" value={dados?.emitente?.cep || null} />
                      <InfoRow label="Telefone" value={dados?.emitente?.telefone || null} />
                    </SectionCard>
                    <SectionCard title="Destinatário" icon={<User className="h-4 w-4 text-emerald-400" />}>
                      <InfoRow label="Razão Social" value={dados?.destinatario?.razao_social || doc.favorecido_extraido || null} />
                      <InfoRow label="Nome Fantasia" value={dados?.destinatario?.nome_fantasia || null} />
                      <InfoRow label="CNPJ / CPF" value={dados?.destinatario?.cnpj_cpf || null} />
                      <InfoRow label="Endereço" value={dados?.destinatario?.endereco || null} />
                      <InfoRow label="Cidade / Estado" value={dados?.destinatario?.cidade && dados?.destinatario?.estado ? `${dados.destinatario.cidade} / ${dados.destinatario.estado}` : null} />
                      <InfoRow label="CEP" value={dados?.destinatario?.cep || null} />
                    </SectionCard>
                  </TabsContent>

                  <TabsContent value="produtos" className="space-y-3 mt-3">
                    <SectionCard title="Itens da Nota" icon={<ShoppingCart className="h-4 w-4 text-primary" />}>
                      {dados?.produtos && dados.produtos.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border/50 text-muted-foreground">
                                <th className="text-left py-2 pr-2 font-medium">Código</th>
                                <th className="text-left py-2 pr-2 font-medium">Descrição</th>
                                <th className="text-right py-2 pr-2 font-medium">Qtd</th>
                                <th className="text-right py-2 pr-2 font-medium">Un</th>
                                <th className="text-right py-2 pr-2 font-medium">Vl. Unit.</th>
                                <th className="text-right py-2 font-medium">Vl. Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dados.produtos.map((p, i) => (
                                <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                                  <td className="py-1.5 pr-2 font-mono">{p.codigo || "—"}</td>
                                  <td className="py-1.5 pr-2 max-w-[200px] truncate" title={p.descricao || ""}>{p.descricao || "—"}</td>
                                  <td className="py-1.5 pr-2 text-right">{p.quantidade ?? "—"}</td>
                                  <td className="py-1.5 pr-2 text-right">{p.unidade || "—"}</td>
                                  <td className="py-1.5 pr-2 text-right">{formatBRL(p.valor_unitario)}</td>
                                  <td className="py-1.5 text-right font-medium">{formatBRL(p.valor_total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum produto identificado.</p>
                      )}
                    </SectionCard>
                    <SectionCard title="Totais" icon={<Banknote className="h-4 w-4 text-emerald-400" />}>
                      <InfoRow label="Valor dos Produtos" value={formatBRL(dados?.financeiro?.valor_produtos)} />
                      <InfoRow label="Frete" value={formatBRL(dados?.financeiro?.valor_frete)} />
                      <InfoRow label="Seguro" value={formatBRL(dados?.financeiro?.valor_seguro)} />
                      <InfoRow label="Desconto" value={formatBRL(dados?.financeiro?.desconto)} />
                      <InfoRow label="Outras Despesas" value={formatBRL(dados?.financeiro?.outras_despesas)} />
                      <Separator className="my-1" />
                      <InfoRow label="Valor Total" value={formatBRL(dados?.financeiro?.valor_total || doc.valor_extraido)} />
                    </SectionCard>
                    {dados?.pagamento && (dados.pagamento.forma || dados.pagamento.quantidade_parcelas) && (
                      <SectionCard title="Pagamento" icon={<Banknote className="h-4 w-4 text-primary" />}>
                        <InfoRow label="Forma" value={dados.pagamento.forma || null} />
                        <InfoRow label="Parcelas" value={dados.pagamento.quantidade_parcelas ? `${dados.pagamento.quantidade_parcelas}x` : null} />
                        <InfoRow label="Valor Parcela" value={formatBRL(dados.pagamento.valor_parcelas)} />
                      </SectionCard>
                    )}
                    {dados?.transporte?.transportadora && (
                      <SectionCard title="Transporte" icon={<Truck className="h-4 w-4 text-primary" />}>
                        <InfoRow label="Transportadora" value={dados.transporte.transportadora} />
                        <InfoRow label="CNPJ" value={dados.transporte.cnpj} />
                        <InfoRow label="Frete" value={formatBRL(dados.transporte.frete)} />
                        <InfoRow label="Volume" value={dados.transporte.volume || null} />
                        <InfoRow label="Peso" value={dados.transporte.peso || null} />
                      </SectionCard>
                    )}
                  </TabsContent>

                  <TabsContent value="tributos" className="space-y-3 mt-3">
                    <SectionCard title="Tributação" icon={<Calculator className="h-4 w-4 text-primary" />}>
                      <InfoRow label="CFOP" value={dados?.tributacao?.cfop || null} />
                      <InfoRow label="NCM" value={dados?.tributacao?.ncm || null} />
                      <InfoRow label="CST" value={dados?.tributacao?.cst || null} />
                      <Separator className="my-1" />
                      <InfoRow label="ICMS" value={formatBRL(dados?.tributacao?.icms)} />
                      <InfoRow label="ICMS ST" value={formatBRL(dados?.tributacao?.icms_st)} />
                      <InfoRow label="PIS" value={formatBRL(dados?.tributacao?.pis)} />
                      <InfoRow label="COFINS" value={formatBRL(dados?.tributacao?.cofins)} />
                      <InfoRow label="IPI" value={formatBRL(dados?.tributacao?.ipi)} />
                      <InfoRow label="ISS" value={formatBRL(dados?.tributacao?.iss)} />
                    </SectionCard>
                  </TabsContent>

                  <TabsContent value="tecnico" className="space-y-3 mt-3">
                    <SectionCard title="Dados Técnicos (Auditoria)" icon={<FileJson className="h-4 w-4 text-muted-foreground" />}>
                      <p className="text-xs text-muted-foreground mb-2">
                        JSON completo da extração. Utilize apenas para auditoria e debug.
                      </p>
                      <pre className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                        {dados ? JSON.stringify(dados, null, 2) : doc.dados_extraidos_raw ? JSON.stringify(JSON.parse(doc.dados_extraidos_raw), null, 2) : "Sem dados estruturados disponíveis."}
                      </pre>
                    </SectionCard>
                    {doc.observacoes_ia && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 flex items-start gap-2">
                        <Brain className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300/80">{doc.observacoes_ia}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold">Dados para Lançamento</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tipo de Movimentação *</Label>
                    <div className="flex gap-1 rounded-lg border p-1">
                      {(["RECEITA", "DESPESA", "TRANSFERENCIA"] as const).map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tipo_movimentacao: tipo }))}
                          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                            formData.tipo_movimentacao === tipo
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tipo === "RECEITA" ? "Receita" : tipo === "DESPESA" ? "Despesa" : "Transferência"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor *</Label>
                      <Input
                        id="valor"
                        value={formData.valor}
                        onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data">Data *</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData((prev) => ({ ...prev, data: e.target.value }))}
                      />
                      {isFutureDate && (
                        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2 flex items-start gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-300/90">
                            Data futura. Será criada uma <strong>Previsão de Caixa</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do lançamento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    {showCreateCategory ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Nome da nova categoria"
                              value={newCategoryName}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.length <= 120) setNewCategoryName(val);
                              }}
                              disabled={creatingCategory}
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateCategory}
                            disabled={creatingCategory || !newCategoryName.trim()}
                          >
                            {creatingCategory ? "Criando..." : "Criar"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => { setShowCreateCategory(false); setNewCategoryName(""); }}
                            disabled={creatingCategory}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={formData.categoria_id}
                          onValueChange={(v) => setFormData((prev) => ({ ...prev, categoria_id: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="max-h-60">
                            {filteredCats.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => setShowCreateCategory(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Criar nova categoria
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favorecido">Favorecido / Emitente</Label>
                    <Input
                      id="favorecido"
                      value={formData.favorecido}
                      onChange={(e) => setFormData((prev) => ({ ...prev, favorecido: e.target.value }))}
                      placeholder="Nome do favorecido ou emitente"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais (opcional)"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-4">
              <Button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {confirming ? <><Brain className="h-4 w-4 animate-pulse" /> Confirmando...</> : <><Check className="h-4 w-4" /> {isFutureDate ? "Confirmar e Criar Previsão" : "Confirmar e Lançar"}</>}
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectClick}
                disabled={rejecting}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Rejeitar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={(open) => { if (!open) { setShowRejectDialog(false); setRejectReason(""); setRejectConfirm(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. Este campo é obrigatório.
            </DialogDescription>
          </DialogHeader>

          {!rejectConfirm ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Motivo da Rejeição *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectReason(""); }}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim()}
                >
                  Continuar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                  <p className="text-sm font-medium">Confirmação de Rejeição</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você está rejeitando o documento <strong>{doc?.nome_arquivo_original}</strong>.
                </p>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
                  <p className="text-xs text-amber-300"><strong>Motivo:</strong> {rejectReason}</p>
                </div>
                <p className="text-sm font-semibold text-center pt-2">Deseja continuar?</p>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setRejectConfirm(false)}>
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectExecute}
                  disabled={rejecting}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {rejecting ? "Rejeitando..." : "Sim, Rejeitar Documento"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
