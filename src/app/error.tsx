"use client";

import React, { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Bisa dikirim ke Sentry jika dikonfigurasi
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="mesh-gradient" />
      <GlassCard className="max-w-md w-full text-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 stroke-[2]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Maaf, terjadi kendala saat memuat halaman ini. Silakan coba kembali atau hubungi administrator sekolah jika kendala berlanjut.
        </p>
        <div className="pt-2">
          <GlassButton
            onClick={() => reset()}
            variant="primary"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Muat Ulang Halaman
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

