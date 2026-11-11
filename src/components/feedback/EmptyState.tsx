import React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4">
        {icon || <FolderOpen className="h-8 w-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </GlassCard>
  );
}

