"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Toaster } from "sonner";
import { logoutAction } from "@/features/auth/actions";

interface AppLayoutProps {
  children: React.ReactNode;
  role?: "admin" | "guru";
  isHomeroom?: boolean;
  userName?: string;
  schoolName?: string;
  semesterName?: string;
  onLogout?: () => void;
}

export function AppLayout({
  children,
  role = "guru",
  isHomeroom = false,
  userName = "Guru Pengajar",
  schoolName = "Buku Guru Digital",
  semesterName = "Ganjil 2026/2027",
  onLogout,
}: AppLayoutProps) {
  const handleLogout = async () => {
    // Bersihkan cookie demo
    document.cookie = "demo_role=; path=/; max-age=0";
    if (onLogout) {
      onLogout();
    } else {
      await logoutAction();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Mesh background gradient */}
      <div className="mesh-gradient" />

      {/* Desktop Sidebar */}
      <Sidebar role={role} isHomeroom={isHomeroom} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
        <Header
          userName={userName}
          userRole={role}
          schoolName={schoolName}
          semesterName={semesterName}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav role={role} isHomeroom={isHomeroom} />

      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

