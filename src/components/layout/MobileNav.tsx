"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Award,
  Menu,
  X,
  ClipboardCheck,
  GraduationCap,
  Bell,
  Building,
  Users,
  Settings,
  Database,
  History,
  Briefcase,
  Clock,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

interface MobileNavProps {
  role?: "admin" | "guru";
  isHomeroom?: boolean;
}

export function MobileNav({ role = "guru", isHomeroom = false }: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const guruMainItems = [
    { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Jadwal", href: "/jadwal", icon: <Calendar className="w-5 h-5" /> },
    { title: "Agenda", href: "/agenda", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Nilai", href: "/penilaian", icon: <Award className="w-5 h-5" /> },
  ];

  const adminMainItems = [
    { title: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Guru", href: "/admin/guru", icon: <Users className="w-5 h-5" /> },
    { title: "Siswa", href: "/admin/siswa", icon: <GraduationCap className="w-5 h-5" /> },
    { title: "Kelas", href: "/admin/kelas", icon: <Building className="w-5 h-5" /> },
  ];

  const mainItems = role === "admin" ? adminMainItems : guruMainItems;

  const extraGuruItems = [
    { title: "Rekap Kehadiran", href: "/kehadiran", icon: <ClipboardCheck className="w-5 h-5" /> },
    ...(isHomeroom ? [{ title: "Wali Kelas (Leger)", href: "/wali-kelas", icon: <GraduationCap className="w-5 h-5" /> }] : []),
    { title: "Notifikasi", href: "/notifikasi", icon: <Bell className="w-5 h-5" /> },
  ];

  const extraAdminItems = [
    { title: "Mata Pelajaran", href: "/admin/mapel", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Penugasan Mengajar", href: "/admin/penugasan", icon: <Briefcase className="w-5 h-5" /> },
    { title: "Jam Pelajaran", href: "/admin/jam-pelajaran", icon: <Clock className="w-5 h-5" /> },
    { title: "Hari Libur", href: "/admin/hari-libur", icon: <CalendarDays className="w-5 h-5" /> },
    { title: "Jadwal Sekolah", href: "/admin/jadwal", icon: <Calendar className="w-5 h-5" /> },
    { title: "Tahun & Periode", href: "/admin/tahun-ajaran", icon: <History className="w-5 h-5" /> },
    { title: "Rekap Sekolah", href: "/admin/rekap", icon: <FileSpreadsheet className="w-5 h-5" /> },
    { title: "Pengaturan Sekolah", href: "/admin/pengaturan", icon: <Settings className="w-5 h-5" /> },
    { title: "Audit Log", href: "/admin/audit-log", icon: <History className="w-5 h-5" /> },
    { title: "Cadangan & Retensi", href: "/admin/cadangan", icon: <Database className="w-5 h-5" /> },
    { title: "Notifikasi", href: "/notifikasi", icon: <Bell className="w-5 h-5" /> },
  ];

  const extraItems = role === "admin" ? extraAdminItems : extraGuruItems;

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        aria-label="Navigasi Utama Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-solid border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 flex items-center justify-around no-print"
      >
        {mainItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all",
                isActive
                  ? "text-brand-600 dark:text-brand-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {item.icon}
              <span className="mt-1">{item.title}</span>
            </Link>
          );
        })}

        {/* Drawer Trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
          aria-label="Menu Lengkap"
        >
          <Menu className="w-5 h-5" />
          <span className="mt-1">Lainnya</span>
        </button>
      </nav>

      {/* Slide-over Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-xs w-full glass-solid p-6 shadow-2xl flex flex-col border-l border-white/20 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Menu Lengkap
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {extraItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition min-h-[44px]"
                >
                  <span className="text-slate-500 dark:text-slate-400">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
