"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";
import { ShieldCheck, Search, Clock, User } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface AuditoriaProps {
  data: IndicadoresContext;
}

export function Auditoria({ data }: AuditoriaProps) {
  const { auditoria: a } = data;
  const hasData = a.totalEventos > 0;

  return (
    <div className="space-y-6">
      {!hasData ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ShieldCheck}
              title="Nenhum evento de auditoria"
              description="O histórico completo de auditoria será exibido aqui, incluindo todas as alterações, exclusões e ações realizadas no sistema. Os logs começarão a aparecer conforme você utilizar o sistema."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{a.totalEventos}</p>
                    <p className="text-xs text-muted-foreground">Total de Eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{a.porUsuario.length}</p>
                    <p className="text-xs text-muted-foreground">Usuários com atividade</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Clock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{a.porAcao.length}</p>
                    <p className="text-xs text-muted-foreground">Tipos de ação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atividade por Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              {a.porUsuario.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>
              ) : (
                <div className="space-y-2">
                  {a.porUsuario.map((u, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                      <span className="text-sm font-medium">{u.usuario}</span>
                      <span className="text-sm text-muted-foreground">{u.quantidade} eventos</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atividade por Ação</CardTitle>
            </CardHeader>
            <CardContent>
              {a.porAcao.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação registrada</p>
              ) : (
                <div className="space-y-2">
                  {a.porAcao.map((act, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                      <span className="text-sm capitalize">{act.acao}</span>
                      <span className="text-sm text-muted-foreground">{act.quantidade} ocorrências</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
