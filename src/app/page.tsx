import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BookOpen, Calendar, Award, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mesh-gradient" />

      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
            RG
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
              Ruang Guru
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buku Administrasi Guru Digital
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <GlassButton size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Masuk
            </GlassButton>
          </Link>
        </div>
      </header>

      {/* Hero Showcase */}
      <main className="py-12 sm:py-16 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-solid text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <ShieldCheck className="w-4 h-4" /> Standar Kurikulum Merdeka
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            Administrasi Guru Lebih Cepat, Terstruktur, dan Akurat
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Kelola jadwal mengajar, agenda harian, presensi siswa secepat kilat (&lt;60 detik), dan penilaian formatif/sumatif otomatis dalam satu aplikasi modern berdesain glassmorphism.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <GlassButton size="lg" variant="primary">
                Mulai Mengajar
              </GlassButton>
            </Link>
            <Link href="/login">
              <GlassButton size="lg" variant="secondary">
                Login Admin Sekolah
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-8">
          <GlassCard hoverEffect className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Jadwal & Agenda Terintegrasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Input jadwal mingguan dengan deteksi bentrok otomatis. Buat agenda mengajar dari jadwal satu semester hanya dengan satu klik.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Presensi Cepat & Mode Offline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tombol &quot;Tandai Semua Hadir&quot; membuat presensi 40 siswa tuntas dalam hitungan detik. Tersimpan di antrian offline jika internet terputus.
            </p>
            <div className="flex gap-1.5 pt-1 flex-wrap">
              <StatusBadge status="hadir" size="sm" />
              <StatusBadge status="sakit" size="sm" />
              <StatusBadge status="izin" size="sm" />
              <StatusBadge status="alpa" size="sm" />
            </div>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Penilaian & Rekap Otomatis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Input nilai spreadsheet-like, bobot formatif/sumatif, ketercapaian TP, remedial, dan ekspor Excel/PDF ber-kop sekolah.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/50 dark:border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
        Ruang Guru • Dirancang untuk Kemudahan Guru Indonesia Sesuai Kurikulum Merdeka
      </footer>
    </div>
  );
}

