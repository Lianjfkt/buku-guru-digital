import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { getAssignmentList } from "@/features/admin/actions";

export const metadata = { title: "Jadwal Master | Admin Ruang Guru" };

export default async function AdminJadwalMasterPage() {
  const res = await getAssignmentList();
  const assignments = res.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-500" /> Pengawasan Jadwal Sekolah
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Pantau alokasi penugasan dan jadwal mengajar guru di seluruh rombongan belajar
          </p>
        </div>
        <Link href="/admin/penugasan">
          <GlassButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Kelola Penugasan
          </GlassButton>
        </Link>
      </div>

      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="py-2.5 px-3">Guru Pengajar</th>
              <th className="py-2.5 px-3">Mata Pelajaran</th>
              <th className="py-2.5 px-3">Kelas</th>
              <th className="py-2.5 px-3 text-center">KKTP</th>
              <th className="py-2.5 px-3 text-center">Semester</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/40">
                  Belum ada data penugasan mengajar terdaftar.
                </td>
              </tr>
            ) : (
              assignments.map((a: any) => (
                <tr key={a.id} className="hover:bg-white/[0.03]">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {a.teacher?.full_name || "Guru"}
                  </td>
                  <td className="py-2.5 px-3 text-white/80">
                    {a.subject?.name} ({a.subject?.code})
                  </td>
                  <td className="py-2.5 px-3 text-white/70">
                    Kelas {a.class?.name}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                    {a.kktp_default}
                  </td>
                  <td className="py-2.5 px-3 text-center text-white/50">
                    {a.semester?.name || "Aktif"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

