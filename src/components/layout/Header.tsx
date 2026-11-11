"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Bell, User, LogOut } from "lucide-react";

interface HeaderProps {
  userName?: string;
  userRole?: "admin" | "guru";
  schoolName?: string;
  semesterName?: string;
  unreadNotifications?: number;
  onLogout?: () => void;
}

export function Header({
  userName = "Guru Pengajar",
  userRole = "guru",
  schoolName = "SMA Negeri Contoh",
  semesterName = "Ganjil 2026/2027",
  unreadNotifications = 0,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full glass-solid border-b border-slate-200/70 dark:border-slate-800/80 px-4 py-3 sm:px-6 transition-all no-print">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: School info badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              {schoolName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Semester: {semesterName}
            </span>
          </div>
          <div className="sm:hidden font-bold text-sm text-brand-600 dark:text-brand-400">
            Ruang Guru
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <Link
            href="/notifikasi"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl glass-solid text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {userName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                {userRole === "admin" ? "Admin" : "Guru"}
              </p>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                aria-label="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

