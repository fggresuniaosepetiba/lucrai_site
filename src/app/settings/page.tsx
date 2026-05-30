"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { SettingsRepository } from "@/database/repositories/settings";
import { UserRepository } from "@/database/repositories/users";
import type { AppSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ImageUp, Building2, Palette, Save, KeyRound, Eye, EyeOff, Check, X } from "lucide-react";
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadSettings();
  }, [isAuthenticated, router, company]);

  const loadSettings = async () => {
    try {
      const s = await SettingsRepository.get(company);
      if (s) {
        setSettings(s);
        setCompanyName(s.companyName);
        setPrimaryColor(s.primaryColor);
        if (s.logoUrl) setLogoPreview(s.logoUrl);
      } else {
        setCompanyName(company || "Minha Empresa");
      }
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

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = settings?.logoUrl;
      if (logoFile && logoPreview) {
        logoUrl = logoPreview;
      }
      await SettingsRepository.update(company, {
        companyName,
        primaryColor,
        logoUrl,
      });
      toast("Configurações salvas", "Dados atualizados com sucesso", "success");
      loadSettings();
    } catch {
      toast("Erro", "Não foi possível salvar", "destructive");
    } finally {
      setSaving(false);
    }
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

    const userRecord = await UserRepository.findByEmail(user?.email ?? "");
    if (!userRecord) {
      toast("Erro", "Usuário não encontrado", "destructive");
      return;
    }
    if (userRecord.password !== currentPassword) {
      toast("Senha atual incorreta", "A senha atual não confere", "destructive");
      return;
    }

    setChangingPassword(true);
    try {
      await UserRepository.update(userRecord.id, { password: newPassword });
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
                placeholder="Trinary Solutions"
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
