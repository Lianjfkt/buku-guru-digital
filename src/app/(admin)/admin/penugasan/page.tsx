"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { saveAssignmentAction, deleteAssignmentAction } from "@/features/admin/actions";
import { toast } from "sonner";
import { Briefcase, Plus, Trash2, Edit2 } from "lucide-react";

interface AssignmentItem {
  id: string;
  teacher_id: string;
  teacher_name: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  semester_id: string;
  semester_name: string;
  weight_formative: number;
  weight_summative: number;
  kktp_default: number;
}

export default function AdminPenugasanPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);

  const [teacherId, setTeacherId] = useState("22222222-2222-2222-2222-222222222222");
  const [classId, setClassId] = useState("d0000000-0000-0000-0000-000000000001");
  const [subjectId, setSubjectId] = useState("c0000000-0000-0000-0000-000000000001");
  const [semesterId, setSemesterId] = useState("b0000000-0000-0000-0000-000000000001");
  const [weightFormative, setWeightFormative] = useState(40);
  const [weightSummative, setWeightSummative] = useState(60);
  const [kktpDefault, setKktpDefault] = useState(75);
  const [isLoading, setIsLoading] = useState(false);

  const teachers = [
    { value: "22222222-2222-2222-2222-222222222222", label: "Bu Rina Wulandari, S.Pd." },
    { value: "33333333-3333-3333-3333-333333333333", label: "Pak Ahmad Fauzi, M.Kom." },
    { value: "44444444-4444-4444-4444-444444444444", label: "Bu Sari Rahayu, M.Pd." },
  ];

  const classes = [
    { value: "d0000000-0000-0000-0000-000000000001", label: "Kelas X-A" },
    { value: "d0000000-0000-0000-0000-000000000002", label: "Kelas X-B" },
    { value: "d0000000-0000-0000-0000-000000000003", label: "Kelas XI-IPA-1" },
  ];

  const subjects = [
    { value: "c0000000-0000-0000-0000-000000000001", label: "Informatika (INF)" },
    { value: "c0000000-0000-0000-0000-000000000002", label: "Matematika (MAT)" },
    { value: "c0000000-0000-0000-0000-000000000003", label: "Bahasa Indonesia (BIN)" },
    { value: "c0000000-0000-0000-0000-000000000004", label: "Bahasa Inggris (BIG)" },
  ];

  const [assignmentList, setAssignmentList] = useState<AssignmentItem[]>([
    {
      id: "f0000000-0000-0000-0000-000000000001",
      teacher_id: "22222222-2222-2222-2222-222222222222",
      teacher_name: "Bu Rina Wulandari, S.Pd.",
      class_id: "d0000000-0000-0000-0000-000000000001",
      class_name: "X-A",
      subject_id: "c0000000-0000-0000-0000-000000000001",
      subject_name: "Informatika",
      semester_id: "b0000000-0000-0000-0000-000000000001",
      semester_name: "Ganjil 2026/2027",
      weight_formative: 40,
      weight_summative: 60,
      kktp_default: 75,
    },
    {
      id: "f0000000-0000-0000-0000-000000000002",
      teacher_id: "33333333-3333-3333-3333-333333333333",
      teacher_name: "Pak Ahmad Fauzi, M.Kom.",
      class_id: "d0000000-0000-0000-0000-000000000001",
      class_name: "X-A",
      subject_id: "c0000000-0000-0000-0000-000000000002",
      subject_name: "Matematika",
      semester_id: "b0000000-0000-0000-0000-000000000001",
      semester_name: "Ganjil 2026/2027",
      weight_formative: 40,
      weight_summative: 60,
      kktp_default: 75,
    },
  ]);

  const handleOpenAdd = () => {
    setSelectedAssignment(null);
    setTeacherId(teachers[0].value);
    setClassId(classes[0].value);
    setSubjectId(subjects[0].value);
    setWeightFormative(40);
    setWeightSummative(60);
    setKktpDefault(75);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weightFormative + weightSummative !== 100) {
      toast.error("Total bobot formatif dan sumatif harus tepat 100%");
      return;
    }

    setIsLoading(true);

    const res = await saveAssignmentAction({
      id: selectedAssignment ? selectedAssignment.id : undefined,
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
      semester_id: semesterId,
      weight_formative: weightFormative,
      weight_summative: weightSummative,
      kktp_default: kktpDefault,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan penugasan mengajar");
      return;
    }

    const tName = teachers.find((t) => t.value === teacherId)?.label || "";
    const cName = classes.find((c) => c.value === classId)?.label.replace("Kelas ", "") || "";
    const sName = subjects.find((s) => s.value === subjectId)?.label.split(" (")[0] || "";

    if (selectedAssignment) {
      setAssignmentList((prev) =>
        prev.map((a) =>
          a.id === selectedAssignment.id
            ? {
                ...a,
                teacher_id: teacherId,
                teacher_name: tName,
                class_id: classId,
                class_name: cName,
                subject_id: subjectId,
                subject_name: sName,
                weight_formative: weightFormative,
                weight_summative: weightSummative,
                kktp_default: kktpDefault,
              }
            : a
        )
      );
      toast.success("Penugasan mengajar diperbarui");
    } else {
      const newA: AssignmentItem = {
        id: crypto.randomUUID(),
        teacher_id: teacherId,
        teacher_name: tName,
        class_id: classId,
        class_name: cName,
        subject_id: subjectId,
        subject_name: sName,
        semester_id: semesterId,
        semester_name: "Ganjil 2026/2027",
        weight_formative: weightFormative,
        weight_summative: weightSummative,
        kktp_default: kktpDefault,
      };
      setAssignmentList((prev) => [...prev, newA]);
      toast.success("Penugasan mengajar baru dibuat");
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus penugasan mengajar ini?")) return;
    const res = await deleteAssignmentAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus penugasan");
      return;
    }
    setAssignmentList((prev) => prev.filter((a) => a.id !== id));
    toast.success("Penugasan berhasil dihapus");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Penugasan Mengajar Guru
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tetapkan guru pengajar untuk setiap kelas dan mata pelajaran pada semester aktif.
            </p>
          </div>
          <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Penugasan Baru
          </GlassButton>
        </div>

        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Guru Pengajar</TableHeaderCell>
              <TableHeaderCell>Kelas</TableHeaderCell>
              <TableHeaderCell>Mata Pelajaran</TableHeaderCell>
              <TableHeaderCell>Bobot Nilai</TableHeaderCell>
              <TableHeaderCell>KKTP</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {assignmentList.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <Briefcase className="w-4 h-4 text-brand-500" />
                    {a.teacher_name}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Kelas {a.class_name}
                  </span>
                </TableCell>
                <TableCell>{a.subject_name}</TableCell>
                <TableCell>
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                    Formatif {a.weight_formative}% : Sumatif {a.weight_summative}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {a.kktp_default}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Hapus Penugasan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </GlassTable>

        <GlassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Tetapkan Penugasan Mengajar"
          description="Hubungkan guru, rombel kelas, mapel, dan aturan bobot nilai kurikulum."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <GlassSelect
              label="Pilih Guru Pengajar"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              options={teachers}
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassSelect
                label="Pilih Kelas"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                options={classes}
              />

              <GlassSelect
                label="Pilih Mata Pelajaran"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                options={subjects}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <GlassInput
                label="Bobot Formatif (%)"
                type="number"
                min={0}
                max={100}
                value={weightFormative}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWeightFormative(val);
                  setWeightSummative(100 - val);
                }}
              />

              <GlassInput
                label="Bobot Sumatif (%)"
                type="number"
                min={0}
                max={100}
                value={weightSummative}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWeightSummative(val);
                  setWeightFormative(100 - val);
                }}
              />

              <GlassInput
                label="KKTP Standar"
                type="number"
                min={0}
                max={100}
                value={kktpDefault}
                onChange={(e) => setKktpDefault(Number(e.target.value))}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <GlassButton type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm" isLoading={isLoading}>
                Simpan Penugasan
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      </div>
    </AppLayout>
  );
}

