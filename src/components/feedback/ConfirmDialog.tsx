"use client";

import React from "react";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            variant === "danger"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
          } mb-3`}
        >
          <AlertTriangle className="h-6 w-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <GlassButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {cancelLabel}
        </GlassButton>
        <GlassButton
          type="button"
          variant={variant === "danger" ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmLabel}
        </GlassButton>
      </div>
    </GlassModal>
  );
}
