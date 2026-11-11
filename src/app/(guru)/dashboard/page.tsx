import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import {
  Calendar,
  Clock,
  BookOpen,
  ClipboardCheck,
  Award,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function GuruDashboardPage() {
  return (
    <AppLayout
      role="guru"
      userName="Bu Rina Wulandari, S.Pd."
      isHomeroom={true}
      schoolName="SMA Negeri 1 Teladan"
      semesterName="Ganjil 2026/2027"
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Selamat Datang, Bu Rina!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Berikut ringkasan jadwal mengajar dan administrasi kelas Anda hari ini.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/agenda">
              <GlassButton size="sm" variant="primary" leftIcon={<BookOpen className="w-4 h-4" />}>
                Lihat Agenda
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sesi Hari Ini</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">2 Kelas</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Presensi Tertunda</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">1 Sesi</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rata-rata Hadir</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">96,4%</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ketuntasan KKTP</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">88,2%</p>
            </div>
          </GlassCard>
        </div>

        {/* Jadwal Hari Ini Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" /> Jadwal Mengajar Hari Ini
            </h2>
            <Link href="/jadwal" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Buka Jadwal Lengkap →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sesi 1 */}
            <GlassCard solid className="space-y-3 border-l-4 border-l-brand-600">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                    Jam ke 1 - 3 (07:15 - 09:30)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Informatika • Kelas X-A
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ruang: Lab Komputer 1
                  </p>
                </div>
                <StatusBadge status="Terlaksana" size="sm" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Presensi: 38/40 Siswa Hadir
                </span>
                <Link href="/agenda">
                  <GlassButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Buka Agenda
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>

            {/* Sesi 2 */}
            <GlassCard solid className="space-y-3 border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    Jam ke 5 - 7 (10:00 - 12:15)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Informatika • Kelas X-B
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ruang: Lab Komputer 2
                  </p>
                </div>
                <StatusBadge status="Dijadwalkan" size="sm" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Belum Diisi Presensi
                </span>
                <Link href="/agenda">
                  <GlassButton size="sm" variant="primary">
                    Isi Presensi Sekarang
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

