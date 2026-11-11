"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { saveStudentAction, deleteStudentAction, getSiswaList, getKelasList } from "@/features/admin/actions";
import { toast } from "sonner";
import { GraduationCap, Plus, Upload, Search, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

interface StudentItem {
  id: string;
  full_name: string;
  nis: string;
  nisn: string | null;
  gender: "L" | "P";
  class_id: string;
  class_name: string;
  is_active: boolean;
}

export default function AdminSiswaPage() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [nis, setNis] = useState("");
  const [nisn, setNisn] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [classId, setClassId] = useState("d0000000-0000-0000-0000-000000000001");
  const [isLoading, setIsLoading] = useState(false);

  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [studentList, setStudentList] = useState<StudentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = async () => {
    setLoadingData(true);
    const [sRes, cRes] = await Promise.all([getSiswaList(), getKelasList()]);
    if (cRes.ok && cRes.data) {
      const cOpts = cRes.data.map((c: any) => ({ value: c.id, label: `Kelas ${c.name}` }));
      setClasses(cOpts);
      if (cOpts.length > 0 && !classId) setClassId(cOpts[0].value);
    }
    if (sRes.ok && sRes.data) {
      setStudentList(
        sRes.data.map((s: any) => ({
          id: s.id,
          full_name: s.full_name,
          nis: s.nis,
          nisn: s.nisn,
          gender: s.gender,
          class_id: s.class_id,
          class_name: s.class?.name || "",
          is_active: s.is_active,
        }))
      );
    }
    setLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = studentList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      (s.nisn && s.nisn.includes(search));
    const matchesClass = filterClass === "all" || s.class_id === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFullName("");
    setNis("");
    setNisn("");
    setGender("L");
    setClassId(classes[0].value);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: StudentItem) => {
    setSelectedStudent(s);
    setFullName(s.full_name);
    setNis(s.nis);
    setNisn(s.nisn || "");
    setGender(s.gender);
    setClassId(s.class_id);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveStudentAction({
      id: selectedStudent ? selectedStudent.id : undefined,
      full_name: fullName,
      nis,
      nisn: nisn || null,
      gender,
      class_id: classId,
      is_active: true,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan data siswa");
      return;
    }

    const cName = classes.find((c) => c.value === classId)?.label.replace("Kelas ", "") || "X-A";

    if (selectedStudent) {
      toast.success("Data siswa berhasil diperbarui");
    } else {
      toast.success("Siswa baru berhasil ditambahkan");
    }
    await loadData();
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data siswa ini?")) return;
    const res = await deleteStudentAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus siswa");
      return;
    }
    await loadData();
    toast.success("Siswa berhasil dihapus");
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Master Data Siswa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola data identitas siswa, NIS unik, kelas, dan fitur impor masal Excel/CSV.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/siswa/impor">
              <GlassButton size="sm" variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
                Impor dari Excel
              </GlassButton>
            </Link>
            <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
              Tambah Siswa
            </GlassButton>
          </div>
        </div>

        {/* Filter bar */}
        <GlassCard className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <GlassInput
              placeholder="Cari nama, NIS, atau NISN siswa..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <GlassSelect
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              options={[{ value: "all", label: "Semua Kelas" }, ...classes]}
            />
          </div>
        </GlassCard>

        {/* Table */}
        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>NIS / NISN</TableHeaderCell>
              <TableHeaderCell>Nama Lengkap Siswa</TableHeaderCell>
              <TableHeaderCell>L/P</TableHeaderCell>
              <TableHeaderCell>Kelas</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <p className="font-bold font-mono text-slate-900 dark:text-slate-100">{s.nis}</p>
                  <p className="text-[11px] text-slate-400 font-mono">NISN: {s.nisn || "-"}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {s.full_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                      s.gender === "L"
                        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                        : "bg-pink-500/15 text-pink-700 dark:text-pink-300"
                    }`}
                  >
                    {s.gender === "L" ? "Laki-laki" : "Perempuan"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800">
                    Kelas {s.class_name}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Ubah Siswa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Hapus Siswa"
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
          title={selectedStudent ? "Ubah Data Siswa" : "Tambah Siswa Baru"}
          description="Lengkapi identitas siswa dan tentukan kelas tempat siswa terdaftar."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <GlassInput
              label="Nama Lengkap Siswa"
              placeholder="Contoh: Muhammad Rizky Pratama"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Nomor Induk Siswa (NIS)"
                placeholder="Contoh: 26001"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                required
              />

              <GlassInput
                label="NISN (Opsional)"
                placeholder="Contoh: 0081234501"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassSelect
                label="Jenis Kelamin"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                options={[
                  { value: "L", label: "Laki-laki (L)" },
                  { value: "P", label: "Perempuan (P)" },
                ]}
              />

              <GlassSelect
                label="Rombel / Kelas"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                options={classes}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <GlassButton type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm" isLoading={isLoading}>
                {selectedStudent ? "Simpan Perubahan" : "Simpan Siswa"}
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      </div>
  );
}

