"use client";

import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl" />
        <Icon className="h-14 w-14 text-muted-foreground relative z-10" />
      </div>
      <p className="text-lg font-semibold text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground/60 mt-2 max-w-md text-center leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
