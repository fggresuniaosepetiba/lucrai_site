"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  LayoutGrid,
  Brain,
  Bell,
  TrendingUp,
  ArrowUpDown,
  Tags,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CalendarCheck,
  Calculator,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { useRouter } from "next/navigation";
import { useAlertsCount } from "@/hooks/useAlertsCount";
import { useState, useEffect } from "react";

const menuItems = [
  { icon: ArrowUpDown, label: "Financeiro", href: "/financial" },
  { icon: CalendarCheck, label: "Previsão de Caixa", href: "/cash-forecast" },
  { icon: Tags, label: "Categorias", href: "/categories" },
  { icon: FileText, label: "Relatórios", href: "/reports" },
  { icon: Calculator, label: "Calculadora de Precificação", href: "/pricing" },
  { icon: Trash2, label: "Lixeira", href: "/trash" },
  { icon: Users, label: "Usuários", href: "/users" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

const dashItems = [
  { icon: LayoutGrid, label: "Principal", href: "/dashboard" },
  { icon: Brain, label: "Resumo do CFO", href: "/dashboard/resumo-cfo" },
  { icon: Bell, label: "Alertas", href: "/dashboard/alertas" },
  { icon: TrendingUp, label: "Projeções", href: "/dashboard/projecoes" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggle } = useSidebarStore();
  const { logout } = useAuthStore();
  const { theme } = useThemeStore();
  const alertsCount = useAlertsCount();
  const [dashExpanded, setDashExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("lucrai-dashboard-expanded");
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("lucrai-dashboard-expanded", String(dashExpanded));
  }, [dashExpanded]);

  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isDashActive = isDashboardRoute;

  const iconSrc = theme === "dark-mega" ? "/images/lucrai/icon-dark.png" : theme === "clean" ? "/images/icon-normal.png" : "/images/icon-oficial.png";
  const logoSrc = theme === "clean" ? "/images/light-oficial-sidebar.png" : "/images/lucrai/logo-lucrai-sidebar.png";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const totalAlerts = alertsCount.criticos + alertsCount.atencao;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/50",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {collapsed ? (
          <div className="relative h-8 w-8">
            <Image
              src={iconSrc}
              alt="LUCRAÍ"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative h-14 flex-1 max-w-44">
              <Image
                src={logoSrc}
                alt="LUCRAÍ"
                fill
                className="object-contain object-left brightness-110"
              />
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            "rounded-lg p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {/* Dashboard group */}
        {!collapsed && (
          <div>
            <button
              onClick={() => setDashExpanded(!dashExpanded)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isDashActive
                  ? "bg-sidebar-primary/10 text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">Dashboard</span>
              {dashExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>

            {dashExpanded && (
              <div className="ml-2 mt-1 space-y-0.5 border-l border-border/30 pl-2">
                {dashItems.map((item) => {
                  const isActive = pathname === item.href;
                  const isAlertas = item.href === "/dashboard/alertas";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary/10 text-sidebar-primary"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {isAlertas && totalAlerts > 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                            alertsCount.criticos > 0
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-500"
                          )}
                        >
                          {alertsCount.criticos > 0 ? alertsCount.criticos : alertsCount.atencao}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Collapsed mode: just show Dashboard icon */}
        {collapsed && (
          <div className="relative">
            <Link
              href="/dashboard"
              className={cn(
                "group flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
                isDashActive
                  ? "bg-sidebar-primary/10 text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title="Dashboard"
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
            </Link>
            {totalAlerts > 0 && (
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5 text-[9px] font-bold px-1 rounded-full",
                  alertsCount.criticos > 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-500"
                )}
              >
                {totalAlerts}
              </span>
            )}
          </div>
        )}

        {/* Regular menu items */}
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-primary/10 text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-3">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
          title="Sair"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {collapsed && (
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-sidebar text-sidebar-foreground/60 hover:text-sidebar-foreground shadow-sm transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </aside>
  );
}
