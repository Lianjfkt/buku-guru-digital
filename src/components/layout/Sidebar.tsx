"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ClipboardCheck,
  Award,
  Users,
  GraduationCap,
  Bell,
  Settings,
  History,
  Database,
  CalendarDays,
  Clock,
  Building,
  Briefcase,
  FileSpreadsheet,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  role?: "admin" | "guru";
  isHomeroom?: boolean;
}

export function Sidebar({ role = "guru", isHomeroom = false }: SidebarProps) {
  const pathname = usePathname();

  const guruNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Jadwal Mengajar", href: "/jadwal", icon: <Calendar className="w-5 h-5" /> },
    { title: "Agenda & Presensi", href: "/agenda", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Rekap Kehadiran", href: "/kehadiran", icon: <ClipboardCheck className="w-5 h-5" /> },
    { title: "Penilaian (TP & Asesmen)", href: "/penilaian", icon: <Award className="w-5 h-5" /> },
    { title: "Notifikasi", href: "/notifikasi", icon: <Bell className="w-5 h-5" /> },
  ];

  if (isHomeroom) {
    guruNavItems.splice(5, 0, {
      title: "Wali Kelas (Leger)",
      href: "/wali-kelas",
      icon: <GraduationCap className="w-5 h-5 text-brand-500" />,
    });
  }

  const adminNavItems: NavItem[] = [
    { title: "Dashboard Admin", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Data Guru", href: "/admin/guru", icon: <Users className="w-5 h-5" /> },
    { title: "Data Siswa", href: "/admin/siswa", icon: <GraduationCap className="w-5 h-5" /> },
    { title: "Data Kelas", href: "/admin/kelas", icon: <Building className="w-5 h-5" /> },
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
  ];

  const items = role === "admin" ? adminNavItems : guruNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/70 dark:border-slate-800/80 glass-solid p-4 overflow-y-auto no-print">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-slate-200/50 dark:border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
          RG
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            Ruang Guru
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">
            {role === "admin" ? "Panel Admin" : "Buku Digital Guru"}
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 min-h-[44px]",
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <span className={cn(isActive ? "text-white" : "text-slate-500 dark:text-slate-400")}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge ? (
                <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-800/60 px-3 text-[11px] text-slate-400 dark:text-slate-500">
        Kurikulum Merdeka • v1.0
      </div>
    </aside>
  );
}

