import React from "react";
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
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { MOCK_SCHEDULES, MOCK_GURU } from "@/lib/mockData";

export const metadata = { title: "Dashboard Guru | Ruang Guru" };

export default async function GuruDashboardPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_role")?.value === "guru";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let teacherName = "Guru";
  let schedulesToday: any[] = [];
  let pendingAttendanceCount = 0;

  // Day of week in JS: 0=Sun, 1=Mon, ..., 6=Sat
  const jsDay = new Date().getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay; // 1: Senin .. 6: Sabtu

  if (isDemo && !user) {
    // Mode demo: gunakan data mock
    teacherName = MOCK_GURU[1].full_name; // Bu Rina Wulandari
    schedulesToday = MOCK_SCHEDULES.filter(
      (s) => s.day_of_week === todayDayOfWeek
    );
    pendingAttendanceCount = 1;
  } else if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile) teacherName = profile.full_name;

    // Ambil jadwal hari ini
    const { data: scheds } = await (supabase as any)
      .from("schedules")
      .select(`
        id,
        day_of_week,
        start_period,
        end_period,
        room,
        assignment:teaching_assignments!inner (
          id,
          teacher_id,
          subject:subjects ( id, name, code ),
          class:classes ( id, name, grade_level )
        )
      `)
      .eq("assignment.teacher_id", user.id)
      .eq("day_of_week", todayDayOfWeek)
      .is("deleted_at", null)
      .order("start_period");

    schedulesToday = scheds || [];

    // Ambil agenda yang belum presensi / dijadwalkan
    const { data: pendingAgendas } = await (supabase as any)
      .from("agendas")
      .select(`
        id,
        status,
        assignment:teaching_assignments!inner ( teacher_id )
      `)
      .eq("assignment.teacher_id", user.id)
      .eq("status", "Dijadwalkan")
      .is("deleted_at", null);

    pendingAttendanceCount = pendingAgendas?.length || 0;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Selamat Datang, {teacherName}!
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
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {schedulesToday.length} Sesi
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Presensi Tertunda</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {pendingAttendanceCount} Sesi
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status Akun</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Aktif</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kurikulum</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Merdeka</p>
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

        {schedulesToday.length === 0 ? (
          <GlassCard className="p-8 text-center text-slate-400">
            Tidak ada jadwal mengajar untuk hari ini.
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedulesToday.map(sch => (
              <GlassCard key={sch.id} solid className="space-y-3 border-l-4 border-l-brand-600">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                      JP {sch.start_period} - {sch.end_period}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {sch.assignment?.subject?.name} • Kelas {sch.assignment?.class?.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ruang: {sch.room || "Ruang Kelas"}
                    </p>
                  </div>
                  <StatusBadge status="Dijadwalkan" size="sm" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Mapel: {sch.assignment?.subject?.code}
                  </span>
                  <Link href="/agenda">
                    <GlassButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Buka Agenda
                    </GlassButton>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
