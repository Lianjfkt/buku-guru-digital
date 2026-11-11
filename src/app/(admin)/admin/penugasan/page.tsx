"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import {
  saveAssignmentAction,
  deleteAssignmentAction,
  getAssignmentList,
  getGuruList,
  getKelasList,
  getSubjectList,
  getSemestersList,
} from "@/features/admin/actions";
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

  const [teachers, setTeachers] = useState<{ value: string; label: string }[]>([]);
  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);
  const [semesters, setSemesters] = useState<{ value: string; label: string }[]>([]);
  const [assignmentList, setAssignmentList] = useState<AssignmentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = async () => {
    setLoadingData(true);
    const [aRes, gRes, cRes, sRes, semRes] = await Promise.all([
      getAssignmentList(),
      getGuruList(),
      getKelasList(),
      getSubjectList(),
      getSemestersList(),
    ]);

    if (gRes.ok && gRes.data) {
      const tOpts = gRes.data.map((g: any) => ({ value: g.id, label: g.full_name }));
      setTeachers(tOpts);
      if (tOpts.length > 0 && !teacherId) setTeacherId(tOpts[0].value);
    }
    if (cRes.ok && cRes.data) {
      const cOpts = cRes.data.map((c: any) => ({ value: c.id, label: `Kelas ${c.name}` }));
      setClasses(cOpts);
      if (cOpts.length > 0 && !classId) setClassId(cOpts[0].value);
    }
    if (sRes.ok && sRes.data) {
      const sOpts = sRes.data.map((s: any) => ({ value: s.id, label: `${s.name} (${s.code})` }));
      setSubjects(sOpts);
      if (sOpts.length > 0 && !subjectId) setSubjectId(sOpts[0].value);
    }
    if (semRes.ok && semRes.data) {
      const semOpts = semRes.data.map((sem: any) => ({ value: sem.id, label: sem.name }));
      setSemesters(semOpts);
      if (semOpts.length > 0 && !semesterId) setSemesterId(semOpts[0].value);
    }
    if (aRes.ok && aRes.data) {
      setAssignmentList(
        aRes.data.map((a: any) => ({
          id: a.id,
          teacher_id: a.teacher_id,
          teacher_name: a.teacher?.full_name || "",
          class_id: a.class_id,
          class_name: a.class?.name || "",
          subject_id: a.subject_id,
          subject_name: a.subject?.name || "",
          semester_id: a.semester_id,
          semester_name: a.semester?.name || "",
          weight_formative: Number(a.weight_formative),
          weight_summative: Number(a.weight_summative),
          kktp_default: Number(a.kktp_default),
        }))
      );
    }
    setLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

    if (selectedAssignment) {
      toast.success("Penugasan mengajar diperbarui");
    } else {
      toast.success("Penugasan mengajar baru dibuat");
    }
    await loadData();
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus penugasan mengajar ini?")) return;
    const res = await deleteAssignmentAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus penugasan");
      return;
    }
    await loadData();
    toast.success("Penugasan berhasil dihapus");
  };

  return (
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
  );
}

