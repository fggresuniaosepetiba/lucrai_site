"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const PUBLIC_PATHS = ["/", "/cadastro", "/login", "/bem-vindo"];

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      sessionStorage.setItem("lucrai-return-url", pathname);
      router.replace("/login");
      return;
    }
    if (mustChangePassword && pathname !== "/trocar-senha" && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/trocar-senha");
    }
  }, [isAuthenticated, mustChangePassword, isLoading, pathname, router]);

  if (isLoading) return null;

  return <>{children}</>;
}
