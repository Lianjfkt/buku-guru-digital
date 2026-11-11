import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  Users,
  GraduationCap,
  Building,
  ClipboardCheck,
  History,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { getAdminDashboardStats } from "@/features/admin/actions";

export const metadata = { title: "Dashboard Admin | Ruang Guru" };

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
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
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Akun Guru</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.guruCount} Guru
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Siswa Terdaftar</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.siswaCount} Siswa
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rombongan Belajar</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.kelasCount} Kelas
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mata Pelajaran</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.mapelCount} Mapel
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Monitoring & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Akses Cepat Master Data */}
        <GlassCard solid className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" /> Manajemen Master Data
            </h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kelola data pokok pendidikan termasuk penugasan mengajar guru (SK Pembagian Tugas), jam pelajaran sekolah, dan daftar siswa per kelas.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/admin/penugasan">
              <GlassButton size="sm" variant="outline">
                Penugasan Guru
              </GlassButton>
            </Link>
            <Link href="/admin/kelas">
              <GlassButton size="sm" variant="outline">
                Daftar Kelas
              </GlassButton>
            </Link>
            <Link href="/admin/mapel">
              <GlassButton size="sm" variant="outline">
                Mata Pelajaran
              </GlassButton>
            </Link>
            <Link href="/admin/siswa">
              <GlassButton size="sm" variant="outline">
                Data Siswa
              </GlassButton>
            </Link>
          </div>
        </GlassCard>

        {/* Card: Status Penguncian & Integritas Periode */}
        <GlassCard solid className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-500" /> Status Periode & Keamanan
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Sistem Terpantau
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kelola masa aktif semester, tetapkan batas tanggal penguncian nilai atau presensi setelah Ujian Akhir Semester, serta pantau catatan log audit perubahan data.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link href="/admin/tahun-ajaran">
              <GlassButton size="sm" variant="outline">
                Penguncian Periode
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
  );
}
