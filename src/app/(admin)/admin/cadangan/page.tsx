import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Database, ShieldCheck, Download, History } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Cadangan & Pemulihan | Admin Ruang Guru" };

export default function AdminCadanganPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-brand-500" /> Cadangan & Integritas Data
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Informasi replikasi basis data PostgreSQL, integritas audit log, dan ekspor arsip
        </p>
      </div>

      <div className="space-y-4">
        <GlassCard solid className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cadangan Otomatis Supabase Cloud</h2>
              <p className="text-xs text-white/60">
                Point-in-Time Recovery (PITR) dan snapshot harian aktif secara otomatis di level infrastruktur.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard solid className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-brand-500" /> Audit Log & Jejak Perubahan
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                Setiap mutasi data nilai, presensi, dan master terekam secara permanen oleh trigger database.
              </p>
            </div>
            <Link href="/admin/audit-log">
              <GlassButton size="sm" variant="outline">
                Buka Log Audit
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

