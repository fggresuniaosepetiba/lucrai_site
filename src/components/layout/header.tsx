"use client";

import Image from "next/image";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore, type ThemeMode } from "@/store/theme-store";
import { Bell, Menu, Moon, Sun, Monitor, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PeriodoFilter } from "./PeriodoFilter";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/financial": "Financeiro",
  "/categories": "Categorias",
  "/users": "Usuários",
  "/reports": "Relatórios",
  "/settings": "Configurações",
  "/cash-forecast": "Previsão de Caixa",
  "/pricing": "Calculadora de Precificação",
  "/pricing/fixed-costs": "Custos Fixos",
  "/pricing/insumos": "Insumos",
};

const dashRoutes = ["/dashboard", "/dashboard/alertas", "/dashboard/projecoes", "/dashboard/resumo-cfo"];

const themes: { value: ThemeMode; label: string; icon: typeof Moon }[] = [
  { value: "normal", label: "Normal", icon: Monitor },
  { value: "dark-mega", label: "Dark Mega", icon: Moon },
  { value: "clean", label: "Clean", icon: Sun },
];

export function Header() {
  const pathname = usePathname();
  const { toggle } = useSidebarStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const title = pageTitles[pathname] || "LUCRAÍ Core";

  const isDashboard = dashRoutes.includes(pathname) || pathname.startsWith("/dashboard/");

  const mobileIcon = theme === "dark-mega" ? "/images/lucrai/icon-dark.png" : theme === "clean" ? "/images/lucrai/icon-clean.png" : "/images/lucrai/icon-normal.png";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <button
        onClick={toggle}
        className="rounded-lg p-2 hover:bg-accent transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 flex-1">
        <div className="relative h-8 w-8 lg:hidden">
          <Image src={mobileIcon} alt="LUCRAÍ" fill className="object-contain" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {isDashboard && (
          <div className="ml-2">
            <PeriodoFilter />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-lg p-2 hover:bg-accent transition-colors">
              {theme === "clean" ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : theme === "dark-mega" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Monitor className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Visual</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {themes.map((t) => (
              <DropdownMenuItem
                key={t.value}
                onClick={() => setTheme(t.value)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <t.icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </div>
                {theme === t.value && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="relative rounded-lg p-2 hover:bg-accent transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2 border-l border-border/50 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium flex items-center gap-1.5">
              {user?.name || "Usuário"}
              {user?.plan === "SuperAdmin" && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  SUPER
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{user?.company || user?.email}</p>
          </div>
          <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
