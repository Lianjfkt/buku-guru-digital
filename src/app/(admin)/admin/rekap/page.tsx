import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { FileSpreadsheet, Download } from "lucide-react";
import { getKelasList, getSubjectList } from "@/features/admin/actions";
import Link from "next/link";

export const metadata = { title: "Rekap Sekolah | Admin Ruang Guru" };

export default async function AdminRekapPage() {
  const [classesRes, subjectsRes] = await Promise.all([
    getKelasList(),
    getSubjectList(),
  ]);

  const classes = classesRes.data || [];
  const subjects = subjectsRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-brand-500" /> Rekapitulasi Tingkat Sekolah
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Laporan rekap kehadiran siswa dan rekap leger nilai antar rombongan belajar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rekap Nilai per Kelas */}
        <GlassCard solid className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            📊 Rekap Leger Nilai Kelas
          </h2>
          <p className="text-xs text-white/70">
            Lihat leger nilai kumulatif seluruh mata pelajaran untuk setiap rombongan belajar.
          </p>
          <div className="space-y-2">
            {classes.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-semibold text-white">Kelas {c.name}</span>
                <Link href={`/wali-kelas?class_id=${c.id}`}>
                  <GlassButton size="sm" variant="outline">
                    Buka Leger
                  </GlassButton>
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Ringkasan Kurikulum */}
        <GlassCard solid className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            📚 Distribusi Kurikulum Mapel
          </h2>
          <p className="text-xs text-white/70">
            Daftar mata pelajaran aktif terdaftar di sistem ({subjects.length} Mapel).
          </p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((s: any) => (
              <div key={s.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <p className="text-xs font-bold text-white truncate">{s.name}</p>
                <p className="text-[11px] text-white/50">{s.code}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

