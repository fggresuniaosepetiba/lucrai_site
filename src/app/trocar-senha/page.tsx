"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export default function TrocarSenhaPage() {
  const router = useRouter();
  const { isAuthenticated, mustChangePassword, user, changePassword, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!mustChangePassword) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, mustChangePassword, router]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) return "Mínimo de 6 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Deve conter uma letra maiúscula";
    if (!/[a-z]/.test(pwd)) return "Deve conter uma letra minúscula";
    if (!/[0-9]/.test(pwd)) return "Deve conter um número";
    if (!/[!@#$%&*]/.test(pwd)) return "Deve conter um caractere especial (! @ # $ % & *)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const ok = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => router.replace("/dashboard"), 2000);
    } else {
      setError("Erro ao alterar senha. Verifique a senha atual.");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-green-500/20 p-3">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Senha alterada com sucesso!</h1>
          <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Alterar Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.name}, você precisa alterar sua senha no primeiro acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className={newPassword.length >= 6 ? "text-green-500" : ""}>✓ Mínimo de 6 caracteres</p>
            <p className={/[A-Z]/.test(newPassword) ? "text-green-500" : ""}>✓ Uma letra maiúscula</p>
            <p className={/[a-z]/.test(newPassword) ? "text-green-500" : ""}>✓ Uma letra minúscula</p>
            <p className={/[0-9]/.test(newPassword) ? "text-green-500" : ""}>✓ Um número</p>
            <p className={/[!@#$%&*]/.test(newPassword) ? "text-green-500" : ""}>✓ Um caractere especial (! @ # $ % & *)</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}
