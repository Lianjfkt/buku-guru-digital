"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { saveSettingsAction } from "@/features/admin/actions";
import { toast } from "sonner";
import { Settings, Save, ShieldCheck } from "lucide-react";

export default function AdminPengaturanPage() {
  const [schoolName, setSchoolName] = useState("SMA Negeri 1 Teladan");
  const [address, setAddress] = useState("Jl. Pendidikan No. 45, Jakarta Selatan");
  const [principalName, setPrincipalName] = useState("Drs. H. Bambang Sudarsono, M.Pd.");
  const [principalNip, setPrincipalNip] = useState("197001011995031001");
  const [attendanceThreshold, setAttendanceThreshold] = useState(80);
  const [kktpDefault, setKktpDefault] = useState(75);
  const [remedialMaxScore, setRemedialMaxScore] = useState(75);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveSettingsAction({
      school_name: schoolName,
      address,
      principal_name: principalName,
      principal_nip: principalNip,
      attendance_threshold: attendanceThreshold,
      kktp_default: kktpDefault,
      remedial_max_score: remedialMaxScore,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan pengaturan sekolah");
      return;
    }

    toast.success("Pengaturan sekolah berhasil disimpan!");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pengaturan & Profil Sekolah
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur identitas resmi sekolah untuk kop laporan PDF, data kepala sekolah, dan ambang batas akademik.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Identitas Sekolah */}
          <GlassCard solid className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <Settings className="w-4 h-4 text-brand-500" /> Identitas Satuan Pendidikan
            </h2>

            <GlassInput
              label="Nama Resmi Sekolah"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />

            <GlassInput
              label="Alamat Lengkap Sekolah"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Nama Kepala Sekolah & Gelar"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
              />

              <GlassInput
                label="NIP Kepala Sekolah"
                value={principalNip}
                onChange={(e) => setPrincipalNip(e.target.value)}
              />
            </div>
          </GlassCard>

          {/* Card 2: Parameter & Standar Kurikulum */}
          <GlassCard solid className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Standar Batas Akademik (Kurikulum Merdeka)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassInput
                label="Ambang Batas Kehadiran (%)"
                type="number"
                min={50}
                max={100}
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                helperText="Siswa dengan kehadiran di bawah ini akan disorot"
              />

              <GlassInput
                label="KKTP Standar Default"
                type="number"
                min={50}
                max={100}
                value={kktpDefault}
                onChange={(e) => setKktpDefault(Number(e.target.value))}
                helperText="Nilai Kriteria Ketercapaian TP default"
              />

              <GlassInput
                label="Batas Maksimal Remedial"
                type="number"
                min={50}
                max={100}
                value={remedialMaxScore}
                onChange={(e) => setRemedialMaxScore(Number(e.target.value))}
                helperText="Nilai efektif remedial maksimal"
              />
            </div>
          </GlassCard>

          <div className="flex justify-end pt-2">
            <GlassButton type="submit" variant="primary" size="md" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Simpan Pengaturan Sekolah
            </GlassButton>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

