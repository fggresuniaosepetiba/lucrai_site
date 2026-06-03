"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
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
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ArrowUpDown, label: "Financeiro", href: "/financial" },
  { icon: CalendarCheck, label: "Previsão de Caixa", href: "/cash-forecast" },
  { icon: Tags, label: "Categorias", href: "/categories" },
  { icon: FileText, label: "Relatórios", href: "/reports" },
  { icon: Calculator, label: "Calculadora de Precificação", href: "/pricing" },
  { icon: Trash2, label: "Lixeira", href: "/trash" },
  { icon: Users, label: "Usuários", href: "/users" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggle } = useSidebarStore();
  const { logout } = useAuthStore();
  const { theme } = useThemeStore();

  // const iconSrc = theme === "dark-mega" ? "/images/lucrai/icon-dark.png" : theme === "clean" ? "/images/icon-normal.png" : "/images/icon-oficial.png";
  const logoSrc = theme === "clean" ? "/images/lucrai/logo-lucrai-com-fundo.png" : "/images/lucrai/logo-lucrai-sem-fundo.png";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
              src={logoSrc}
              alt="LUCRAÍ"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Trocar foto da logoSrc */}
            <div className="relative h-40 flex-1 max-w-60">
              <Image
                src={logoSrc}
                alt="LUCRAÍ"
                fill
                className="object-contain object-left brightness-110 max-h-full max-w-100"
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

      <nav className="flex-1 space-y-1 p-3">
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
