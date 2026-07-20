"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/components/ui/toast";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const WARNING_BEFORE = 60 * 1000;
const PUBLIC_PATHS = ["/", "/cadastro", "/login", "/bem-vindo"];
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click", "wheel"];

export function InactivityTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warnRef.current) {
      clearTimeout(warnRef.current);
      warnRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    if (!isAuthenticated || isPublicPath) return;

    warnRef.current = setTimeout(() => {
      toast(
        "Sessão prestes a expirar",
        "Sua sessão será encerrada por inatividade em 1 minuto. Mexa o mouse para continuar.",
        "destructive"
      );
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    timerRef.current = setTimeout(async () => {
      await logout();
      router.push("/login");
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated, isPublicPath, clearTimers, logout, router]);

  useEffect(() => {
    if (!isAuthenticated || isPublicPath) {
      clearTimers();
      return;
    }

    resetTimer();

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimers();
    };
  }, [isAuthenticated, isPublicPath, resetTimer, clearTimers]);

  return <>{children}</>;
}
