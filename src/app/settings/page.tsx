"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { SettingsRepositoryApi } from "@/services/api-repositories/settings";
import { SignatureRepositoryApi } from "@/services/api-repositories/signature";
import { Switch } from "@/components/ui/switch";
import type { AppSettings, SignatureConfig } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ImageUp, Building2, Palette, Save, KeyRound, Eye, EyeOff, Check, X, Signature, Pen } from "lucide-react";
import Image from "next/image";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Mínimo de 8 caracteres";
  if (!/[A-Z]/.test(pw)) return "Precisa de pelo menos uma letra maiúscula";
  if (!/[a-z]/.test(pw)) return "Precisa de pelo menos uma letra minúscula";
  if (!/[0-9]/.test(pw)) return "Precisa de pelo menos um número";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Precisa de pelo menos um caractere especial";
  return null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const company = user?.company ?? "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [assinatura, setAssinatura] = useState<SignatureConfig>({
    id: company,
    company,
    imagemBase64: null,
    nomeResponsavel: "",
    cargo: "",
    permitirUso: false,
  });
  const [assinaturaPreview, setAssinaturaPreview] = useState<string | null>(null);
  const assinaturaFileRef = useRef<HTMLInputElement>(null);
  const [assinaturaLoaded, setAssinaturaLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadSettings();
  }, [isAuthenticated, router, company]);

  const loadSettings = async () => {
    try {
      const s = await SettingsRepositoryApi.get();
      if (s) {
        setSettings(s);
        setCompanyName(s.companyName);
        setPrimaryColor(s.primaryColor);
        if (s.logoUrl) setLogoPreview(s.logoUrl);
      } else {
        setCompanyName(company || "Minha Empresa");
      }
      const sig = await SignatureRepositoryApi.get();
      if (sig) {
        setAssinatura(sig);
        if (sig.imagemBase64) setAssinaturaPreview(sig.imagemBase64);
      }
      setAssinaturaLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAssinaturaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Arquivo muito grande", "O limite é de 2MB", "destructive");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAssinaturaPreview(dataUrl);
      setAssinatura((prev) => ({ ...prev, imagemBase64: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const logoUrl = logoFile && logoPreview ? logoPreview : settings?.logoUrl;
      await SettingsRepositoryApi.update({
        companyName,
        primaryColor,
        logoUrl,
      });
      toast("Configurações salvas", "Dados atualizados com sucesso", "success");
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      toast("Erro", "Não foi possível salvar configurações", "destructive");
      setSaving(false);
      return;
    }

    try {
      await SignatureRepositoryApi.save(assinatura);
      toast("Assinatura salva", "Dados atualizados com sucesso", "success");
    } catch (err) {
      console.error("Erro ao salvar assinatura:", err);
      toast("Erro", "Não foi possível salvar a assinatura", "destructive");
    } finally {
      setSaving(false);
    }

    await loadSettings();
  };

  const handleChangePassword = async () => {
    const error = validatePassword(newPassword);
    if (error) {
      toast("Senha inválida", error, "destructive");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Senhas não conferem", "A nova senha e a confirmação são diferentes", "destructive");
      return;
    }

    setChangingPassword(true);
    try {
      const { changePassword } = useAuthStore.getState();
      const ok = await changePassword(currentPassword, newPassword);
      if (!ok) {
        toast("Erro", "Senha atual incorreta", "destructive");
        return;
      }
      toast("Senha alterada", "Sua senha foi atualizada com sucesso", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast("Erro", "Não foi possível alterar a senha", "destructive");
    } finally {
      setChangingPassword(false);
    }
  };

  const passwordError = newPassword ? validatePassword(newPassword) : null;

  if (loading) {
    return (
      <Shell>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Informações da Empresa</CardTitle>
                <CardDescription>Dados exibidos no sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo da empresa</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Logo" fill className="object-contain p-2" />
                  ) : (
                    <ImageUp className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Selecionar imagem
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Máx 2MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Minha Empresa"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Personalização</CardTitle>
                <CardDescription>Cor principal do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor primária</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg border-2 border-border"
                  style={{ backgroundColor: primaryColor }}
                />
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 font-mono"
                />
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-9 p-0.5 cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {assinaturaLoaded && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Pen className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Assinatura do Responsável</CardTitle>
                  <CardDescription>Configuração de assinatura para recibos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem da Assinatura</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-40 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center">
                    {assinaturaPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={assinaturaPreview} alt="Assinatura" className="object-contain p-2 max-h-full" />
                    ) : (
                      <Signature className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={assinaturaFileRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleAssinaturaUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => assinaturaFileRef.current?.click()}
                    >
                      Selecionar imagem
                    </Button>
                    <p className="text-xs text-muted-foreground">PNG (transparente) ou JPG. Máx 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                <Input
                  id="nomeResponsavel"
                  placeholder="Nome completo"
                  value={assinatura.nomeResponsavel}
                  onChange={(e) => setAssinatura((prev) => ({ ...prev, nomeResponsavel: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  placeholder="Ex: Diretor Financeiro"
                  value={assinatura.cargo}
                  onChange={(e) => setAssinatura((prev) => ({ ...prev, cargo: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="permitirUso"
                  checked={assinatura.permitirUso}
                  onCheckedChange={(checked) => setAssinatura((prev) => ({ ...prev, permitirUso: checked }))}
                />
                <Label htmlFor="permitirUso" className="cursor-pointer">
                  Permitir uso de assinatura nos recibos
                </Label>
              </div>

              {assinatura.permitirUso && assinaturaPreview && (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Preview da assinatura no recibo:</p>
                  <div className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assinaturaPreview} alt="Assinatura" className="max-h-12 object-contain" />
                    <div className="w-48 border-t border-foreground/30"></div>
                    <p className="text-sm font-medium">{assinatura.nomeResponsavel || "Nome do Responsável"}</p>
                    <p className="text-xs text-muted-foreground">{assinatura.cargo || "Cargo"}</p>
                    <p className="text-xs text-muted-foreground">{companyName}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Alterar Senha</CardTitle>
                <CardDescription>Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha atual"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-1 mt-2">
                  {[
                    { label: "Mínimo 8 caracteres", test: newPassword.length >= 8 },
                    { label: "1 letra maiúscula", test: /[A-Z]/.test(newPassword) },
                    { label: "1 letra minúscula", test: /[a-z]/.test(newPassword) },
                    { label: "1 número", test: /[0-9]/.test(newPassword) },
                    { label: "1 caractere especial", test: /[^A-Za-z0-9]/.test(newPassword) },
                  ].map((req) => (
                    <div key={req.label} className={`flex items-center gap-2 text-xs ${req.test ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {req.test ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">As senhas não conferem</p>
              )}
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || !!passwordError || newPassword !== confirmPassword || changingPassword}
              className="gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {changingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </CardContent>
        </Card>

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
