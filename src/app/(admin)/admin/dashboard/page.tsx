import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  Users,
  GraduationCap,
  Building,
  ClipboardCheck,
  AlertTriangle,
  History,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <AppLayout
      role="admin"
      userName="Pak Dedi (Administrator)"
      schoolName="SMA Negeri 1 Teladan"
      semesterName="Ganjil 2026/2027"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Panel Pengawasan Administrator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau kepatuhan administrasi guru, data master sekolah, dan rekapitulasi semester.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/guru">
              <GlassButton size="sm" variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
                Tambah Akun Guru
              </GlassButton>
            </Link>
            <Link href="/admin/rekap">
              <GlassButton size="sm" variant="secondary" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
                Rekap Sekolah
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Master Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Guru</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">42 Guru</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Siswa Aktif</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">1.240 Siswa</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rombongan Belajar</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">36 Kelas</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kehadiran Sekolah</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">95,8%</p>
            </div>
          </GlassCard>
        </div>

        {/* Monitoring Kepatuhan Administrasi Guru */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Guru Belum Mengisi Presensi */}
          <GlassCard solid className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Presensi Belum Diisi Hari Ini
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                2 Guru
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pak Ahmad Fauzi, M.Kom.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Matematika • Kelas X-B (Jam ke 1-3)
                  </p>
                </div>
                <GlassButton size="sm" variant="outline">
                  Kirim Pengingat
                </GlassButton>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bu Sari Rahayu, M.Pd.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bahasa Indonesia • Kelas XI-IPA-1 (Jam ke 3-4)
                  </p>
                </div>
                <GlassButton size="sm" variant="outline">
                  Kirim Pengingat
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Card: Status Penguncian & Integritas Periode */}
          <GlassCard solid className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-500" /> Status Periode Semester
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                Semester Terbuka
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Semester Ganjil 2026/2027 saat ini aktif dan dapat diisi oleh seluruh guru pengajar. Anda dapat menetapkan batas tanggal penguncian nilai atau presensi setelah Ujian Akhir Semester (SAS).
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link href="/admin/tahun-ajaran">
                <GlassButton size="sm" variant="outline">
                  Kelola Penguncian Periode
                </GlassButton>
              </Link>
              <Link href="/admin/audit-log">
                <GlassButton size="sm" variant="secondary">
                  Buka Audit Log
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}

