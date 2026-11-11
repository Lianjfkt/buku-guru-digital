import React from "react";
import { cn } from "@/lib/utils";

export type PresenceStatus = "hadir" | "sakit" | "izin" | "alpa";
export type AgendaStatus = "Dijadwalkan" | "Terlaksana" | "Tidak Terlaksana";

export interface StatusBadgeProps {
  status: PresenceStatus | AgendaStatus | string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300";
  let label = status;

  if (normalized === "hadir") {
    styles = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    label = "Hadir";
  } else if (normalized === "sakit") {
    styles = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    label = "Sakit";
  } else if (normalized === "izin") {
    styles = "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
    label = "Izin";
  } else if (normalized === "alpa") {
    styles = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
    label = "Alpa";
  } else if (normalized === "terlaksana") {
    styles = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    label = "Terlaksana";
  } else if (normalized === "dijadwalkan") {
    styles = "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    label = "Dijadwalkan";
  } else if (normalized === "tidak terlaksana") {
    styles = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
    label = "Tidak Terlaksana";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors",
        sizeClasses[size],
        styles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

