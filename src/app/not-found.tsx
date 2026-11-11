import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { FileQuestion, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="mesh-gradient" />
      <GlassCard className="max-w-md w-full text-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8 stroke-[2]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          404 - Halaman Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="pt-2">
          <Link href="/">
            <GlassButton variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Kembali ke Beranda
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

