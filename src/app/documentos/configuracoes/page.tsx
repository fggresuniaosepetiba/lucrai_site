"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { DocumentoConfigRepository, DocumentoAprendizadoRepository } from "@/database/repositories/documentos";
import type { DocumentoConfiguracao, DocumentoAprendizado } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import {
  Settings, Brain, Trash2, Download, Shield, Clock,
  Save, Bell, Tag,
} from "lucide-react";

export default function DocumentoConfigPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const empresa_id = user?.company ?? "";

  const [config, setConfig] = useState<DocumentoConfiguracao | null>(null);
  const [aprendizados, setAprendizados] = useState<DocumentoAprendizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [retencao, setRetencao] = useState(365);
  const [autoCategoria, setAutoCategoria] = useState(true);
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [notificarSistema, setNotificarSistema] = useState(true);
  const [limiteMB, setLimiteMB] = useState(10);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadData();
  }, [isAuthenticated, router, empresa_id]);

  const loadData = async () => {
    try {
      const [c, a] = await Promise.all([
        DocumentoConfigRepository.get(empresa_id),
        DocumentoAprendizadoRepository.getByEmpresa(empresa_id),
      ]);
      if (c) {
        setConfig(c as DocumentoConfiguracao);
        setRetencao(c.retencao_dias);
        setAutoCategoria(c.auto_sugerir_categoria);
        setNotificarEmail(c.notificar_email);
        setNotificarSistema(c.notificar_sistema);
        setLimiteMB(c.limite_tamanho_mb);
      }
      setAprendizados(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await DocumentoConfigRepository.upsert(empresa_id, {
        retencao_dias: retencao,
        auto_sugerir_categoria: autoCategoria,
        notificar_email: notificarEmail,
        notificar_sistema: notificarSistema,
        limite_tamanho_mb: limiteMB,
      });
      toast("Configurações salvas", "Dados atualizados com sucesso", "success");
      loadData();
    } catch {
      toast("Erro", "Não foi possível salvar", "destructive");
    } finally {
      setSaving(false);
    }
  };

  const handleLimparAprendizado = async () => {
    try {
      await DocumentoAprendizadoRepository.clearByEmpresa(empresa_id);
      toast("Histórico limpo", "Todas as regras de aprendizado foram removidas", "success");
      loadData();
    } catch {
      toast("Erro", "Não foi possível limpar o histórico", "destructive");
    }
  };

  const handleExcluirRegra = async (id: string) => {
    try {
      await DocumentoAprendizadoRepository.delete(id);
      toast("Regra excluída", "", "success");
      loadData();
    } catch {
      toast("Erro", "Não foi possível excluir a regra", "destructive");
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-6 max-w-2xl">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as configurações da Central de Documentos
          </p>
        </div>

        {/* Processing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Processamento</CardTitle>
                <CardDescription>Configurações de extração de dados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sugestão automática de categoria</Label>
                <p className="text-xs text-muted-foreground">
                  Usar o histórico de aprendizado para sugerir categorias automaticamente
                </p>
              </div>
              <Switch checked={autoCategoria} onCheckedChange={setAutoCategoria} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificação por e-mail</Label>
                <p className="text-xs text-muted-foreground">
                  Ao finalizar o processamento de um documento
                </p>
              </div>
              <Switch checked={notificarEmail} onCheckedChange={setNotificarEmail} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificação no sistema</Label>
                <p className="text-xs text-muted-foreground">
                  Mostrar notificação ao processar documento
                </p>
              </div>
              <Switch checked={notificarSistema} onCheckedChange={setNotificarSistema} />
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Armazenamento e Retenção</CardTitle>
                <CardDescription>Política de retenção de documentos (LGPD)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Política de retenção de documentos</Label>
              <div className="flex gap-1 rounded-lg border p-1">
                {[
                  { value: 90, label: "90 dias" },
                  { value: 180, label: "180 dias" },
                  { value: 365, label: "1 ano" },
                  { value: 730, label: "2 anos" },
                  { value: 0, label: "Indefinido" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRetencao(opt.value)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      retencao === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {retencao > 0 && (
                <p className="text-xs text-muted-foreground">
                  Documentos mais antigos que {retencao} dias serão automaticamente excluídos.
                </p>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="limite">Tamanho máximo por arquivo (MB)</Label>
              <Input
                id="limite"
                type="number"
                value={limiteMB}
                onChange={(e) => setLimiteMB(parseInt(e.target.value) || 10)}
                className="w-32"
                min={1}
                max={50}
              />
            </div>
          </CardContent>
        </Card>

        {/* Aprendizado */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Histórico de Aprendizado</CardTitle>
                <CardDescription>
                  Regras automáticas de categorização baseadas no seu histórico
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {aprendizados.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma regra de aprendizado criada ainda. As regras são criadas automaticamente ao confirmar documentos.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Chave</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Frequência</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aprendizados.map((a) => (
                        <tr key={a.id} className="border-b border-border/20">
                          <td className="px-3 py-2">
                            <span className="text-sm">{a.chave_reconhecimento}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm text-muted-foreground">{a.frequencia}x</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:text-red-400"
                              onClick={() => handleExcluirRegra(a.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-400 hover:text-red-300"
                  onClick={handleLimparAprendizado}
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar todo histórico de aprendizado
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
