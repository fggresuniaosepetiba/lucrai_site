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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Plus, Pencil, Trash2, Users as UsersIcon, Shield, ShieldCheck, Eye, User, Building2, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const { isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppUser["role"]>("viewer");
  const [company, setCompany] = useState("");

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
      const data: any = { name, email, role, company };
      if (password.trim()) data.password = password.trim();
      await UserRepository.update(editingUser.id, data);
      setEditingUser(null);
      toast("Usuário atualizado", "", "success");
      loadUsers();
    } catch { toast("Erro", "", "destructive"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await UserRepository.delete(id);
      toast("Usuário removido", "", "success");
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
            return (
              <Card key={u.id} className="group hover:shadow-md transition-all">
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
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {u.role !== "owner" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(u.id)}>
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
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex: Trinary, Lucraí, Grão Natura" />
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
