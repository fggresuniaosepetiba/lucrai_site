"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { UserRepository } from "@/database/repositories/users";
import type { AppUser } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Plus, Pencil, Trash2, Shield, ShieldCheck, Eye, User, Building2, KeyRound, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleNames: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  financial: "Financeiro",
  viewer: "Visualizador",
};

const roleIcons: Record<string, React.ElementType> = {
  owner: ShieldCheck,
  admin: Shield,
  financial: User,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: "text-purple-400",
  admin: "text-blue-400",
  financial: "text-emerald-400",
  viewer: "text-muted-foreground",
};

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppUser["role"]>("viewer");
  const [company, setCompany] = useState("");

  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "reason">("confirm");
  const [deleteReason, setDeleteReason] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadUsers();
  }, [isAuthenticated, router]);

  const loadUsers = async () => {
    try {
      const all = await UserRepository.getAll();
      setUsers(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !company.trim()) return;
    try {
      await UserRepository.create({ name: name.trim(), email: email.trim(), password: password.trim(), role, company: company.trim() });
      setShowForm(false);
      setName("");
      setEmail("");
      setPassword("");
      setCompany("");
      toast("Usuário criado", "", "success");
      loadUsers();
    } catch { toast("Erro", "", "destructive"); }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const data: Partial<AppUser> = { name, email, role, company };
      if (password.trim()) data.password = password.trim();
      await UserRepository.update(editingUser.id, data);
      setEditingUser(null);
      toast("Usuário atualizado", "", "success");
      loadUsers();
    } catch { toast("Erro", "", "destructive"); }
  };

  const openEdit = (u: AppUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setCompany(u.company);
    setPassword("");
  };

  const handleDeleteClick = (u: AppUser) => {
    setDeletingUser(u);
    setDeleteStep("confirm");
    setDeleteReason("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser || !deleteReason.trim()) return;
    try {
      await UserRepository.softDelete(deletingUser.id, deleteReason.trim(), currentUser?.email ?? "unknown");
      toast("Usuário excluído com sucesso.", "", "success");
      setDeletingUser(null);
      setDeleteReason("");
      loadUsers();
    } catch { toast("Erro ao excluir usuário", "", "destructive"); }
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={() => { setEditingUser(null); setName(""); setEmail(""); setPassword(""); setRole("viewer"); setCompany(""); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid gap-4">
          {users.map((u) => {
            const RoleIcon = roleIcons[u.role];
            const isActive = u.active !== false;
            return (
              <Card key={u.id} className={`group hover:shadow-md transition-all ${!isActive ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant="outline" className={`gap-1.5 ${roleColors[u.role]}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleNames[u.role]}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <Building2 className="h-3 w-3" />
                        {u.company}
                      </Badge>
                      {!isActive && (
                        <Badge variant="destructive" className="gap-1.5">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {u.role !== "owner" && isActive && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => handleDeleteClick(u)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={Boolean(deletingUser)} onOpenChange={(o) => { if (!o) { setDeletingUser(null); setDeleteReason(""); } }}>
          {deleteStep === "confirm" && (
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <DialogTitle>Confirmar Exclusão de Usuário</DialogTitle>
                </div>
                <DialogDescription>
                  Você está prestes a excluir o usuário:
                  <strong className="block mt-2 text-foreground">{deletingUser?.name}</strong>
                  <br />
                  Esta ação poderá impactar históricos, registros e permissões vinculadas a este usuário.
                  <br />
                  Deseja realmente continuar?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDeletingUser(null); setDeleteReason(""); }}>Cancelar</Button>
                <Button variant="destructive" onClick={() => setDeleteStep("reason")}>Continuar Exclusão</Button>
              </DialogFooter>
            </DialogContent>
          )}
          {deleteStep === "reason" && (
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Motivo da Exclusão</DialogTitle>
                <DialogDescription>
                  Informe o motivo para excluir o usuário <strong>{deletingUser?.name}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="deleteReason">Motivo da exclusão</Label>
                <Textarea
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Descreva o motivo da exclusão..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDeletingUser(null); setDeleteReason(""); }}>Cancelar</Button>
                <Button
                  variant="destructive"
                  disabled={!deleteReason.trim()}
                  onClick={handleConfirmDelete}
                >
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
              {!deleteReason.trim() && (
                <p className="text-xs text-muted-foreground px-1">O motivo da exclusão é obrigatório.</p>
              )}
            </DialogContent>
          )}
        </Dialog>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Email (login)</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario.adm" />
              </div>
              <div className="space-y-2">
                <Label>Senha {editingUser && "(deixe em branco para manter)"}</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? "Nova senha" : "Senha"}
                    className="pr-10"
                  />
                  <KeyRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex: Trinary, Lucraí, Grão Natural" />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppUser["role"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Proprietário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={editingUser ? handleUpdate : handleCreate} disabled={!name.trim() || !email.trim() || (!editingUser && (!password.trim() || !company.trim()))}>
                {editingUser ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
