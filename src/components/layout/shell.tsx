"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/cn";
import { Toaster } from "@/components/ui/toast";

export function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-60"
        )}
      >
        <Header />
        <main className="animate-fade-in p-4 lg:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
