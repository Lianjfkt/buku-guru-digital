"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { saveClassAction, deleteClassAction } from "@/features/admin/actions";
import { toast } from "sonner";
import { Building, Plus, Edit2, Trash2, GraduationCap } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  grade_level: number;
  phase: "A" | "B" | "C" | "D" | "E" | "F";
  homeroom_teacher_id: string | null;
  homeroom_teacher_name?: string | null;
}

export default function AdminKelasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [phase, setPhase] = useState<"A" | "B" | "C" | "D" | "E" | "F">("E");
  const [homeroomId, setHomeroomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Data Simulasi
  const guruOptions = [
    { value: "", label: "-- Belum Ditentukan --" },
    { value: "22222222-2222-2222-2222-222222222222", label: "Bu Rina Wulandari, S.Pd." },
    { value: "33333333-3333-3333-3333-333333333333", label: "Pak Ahmad Fauzi, M.Kom." },
    { value: "44444444-4444-4444-4444-444444444444", label: "Bu Sari Rahayu, M.Pd." },
  ];

  const [classList, setClassList] = useState<ClassItem[]>([
    {
      id: "d0000000-0000-0000-0000-000000000001",
      name: "X-A",
      grade_level: 10,
      phase: "E",
      homeroom_teacher_id: "22222222-2222-2222-2222-222222222222",
      homeroom_teacher_name: "Bu Rina Wulandari, S.Pd.",
    },
    {
      id: "d0000000-0000-0000-0000-000000000002",
      name: "X-B",
      grade_level: 10,
      phase: "E",
      homeroom_teacher_id: "44444444-4444-4444-4444-444444444444",
      homeroom_teacher_name: "Bu Sari Rahayu, M.Pd.",
    },
    {
      id: "d0000000-0000-0000-0000-000000000003",
      name: "XI-IPA-1",
      grade_level: 11,
      phase: "F",
      homeroom_teacher_id: null,
      homeroom_teacher_name: null,
    },
  ]);

  const handleOpenAdd = () => {
    setSelectedClass(null);
    setName("");
    setGradeLevel(10);
    setPhase("E");
    setHomeroomId("");
    setModalOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setSelectedClass(c);
    setName(c.name);
    setGradeLevel(c.grade_level);
    setPhase(c.phase);
    setHomeroomId(c.homeroom_teacher_id || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveClassAction({
      id: selectedClass ? selectedClass.id : undefined,
      name,
      grade_level: gradeLevel,
      phase,
      homeroom_teacher_id: homeroomId || null,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan kelas");
      return;
    }

    const teacherName = guruOptions.find((g) => g.value === homeroomId)?.label || null;

    if (selectedClass) {
      setClassList((prev) =>
        prev.map((c) =>
          c.id === selectedClass.id
            ? {
                ...c,
                name,
                grade_level: gradeLevel,
                phase,
                homeroom_teacher_id: homeroomId || null,
                homeroom_teacher_name: teacherName === "-- Belum Ditentukan --" ? null : teacherName,
              }
            : c
        )
      );
      toast.success("Data kelas berhasil diperbarui");
    } else {
      const newC: ClassItem = {
        id: crypto.randomUUID(),
        name,
        grade_level: gradeLevel,
        phase,
        homeroom_teacher_id: homeroomId || null,
        homeroom_teacher_name: teacherName === "-- Belum Ditentukan --" ? null : teacherName,
      };
      setClassList((prev) => [...prev, newC]);
      toast.success("Kelas baru berhasil dibuat");
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;
    const res = await deleteClassAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus kelas");
      return;
    }
    setClassList((prev) => prev.filter((c) => c.id !== id));
    toast.success("Kelas berhasil dihapus");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Data Kelas & Wali Kelas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola rombongan belajar, tingkatan, fase Kurikulum Merdeka, dan penetapan Wali Kelas.
            </p>
          </div>
          <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Kelas Baru
          </GlassButton>
        </div>

        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nama Rombel / Kelas</TableHeaderCell>
              <TableHeaderCell>Tingkat</TableHeaderCell>
              <TableHeaderCell>Fase Kurikulum</TableHeaderCell>
              <TableHeaderCell>Wali Kelas Terpilih</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {classList.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-500" />
                    {c.name}
                  </div>
                </TableCell>
                <TableCell>Kelas {c.grade_level}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
                    Fase {c.phase}
                  </span>
                </TableCell>
                <TableCell>
                  {c.homeroom_teacher_name ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <GraduationCap className="w-4 h-4 text-brand-500" />
                      {c.homeroom_teacher_name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum ditetapkan</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Ubah Kelas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </GlassTable>

        <GlassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedClass ? "Ubah Data Kelas" : "Tambah Kelas Baru"}
          description="Masukkan nama rombel dan tetapkan guru yang bertugas sebagai Wali Kelas."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <GlassInput
              label="Nama Kelas"
              placeholder="Contoh: X-A, XI-IPA-1, XII-IPS-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassSelect
                label="Tingkat / Grade"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                options={[
                  { value: 10, label: "Kelas 10 (SMA/SMK)" },
                  { value: 11, label: "Kelas 11 (SMA/SMK)" },
                  { value: 12, label: "Kelas 12 (SMA/SMK)" },
                  { value: 7, label: "Kelas 7 (SMP)" },
                  { value: 8, label: "Kelas 8 (SMP)" },
                  { value: 9, label: "Kelas 9 (SMP)" },
                ]}
              />

              <GlassSelect
                label="Fase Kurikulum"
                value={phase}
                onChange={(e) => setPhase(e.target.value as any)}
                options={[
                  { value: "E", label: "Fase E (Kelas 10)" },
                  { value: "F", label: "Fase F (Kelas 11 - 12)" },
                  { value: "D", label: "Fase D (SMP)" },
                  { value: "A", label: "Fase A (SD 1-2)" },
                  { value: "B", label: "Fase B (SD 3-4)" },
                  { value: "C", label: "Fase C (SD 5-6)" },
                ]}
              />
            </div>

            <GlassSelect
              label="Wali Kelas"
              value={homeroomId}
              onChange={(e) => setHomeroomId(e.target.value)}
              options={guruOptions}
              helperText="Wali kelas akan memiliki akses baca ke seluruh leger dan kehadiran kelas ini"
            />

            <div className="pt-2 flex justify-end gap-2">
              <GlassButton type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm" isLoading={isLoading}>
                {selectedClass ? "Simpan Perubahan" : "Simpan Kelas"}
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      </div>
    </AppLayout>
  );
}

