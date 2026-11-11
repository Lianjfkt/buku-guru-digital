"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { saveSubjectAction, deleteSubjectAction } from "@/features/admin/actions";
import { toast } from "sonner";
import { BookOpen, Plus, Edit2, Trash2 } from "lucide-react";

interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

export default function AdminMapelPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [subjectList, setSubjectList] = useState<SubjectItem[]>([
    { id: "c0000000-0000-0000-0000-000000000001", name: "Informatika", code: "INF" },
    { id: "c0000000-0000-0000-0000-000000000002", name: "Matematika", code: "MAT" },
    { id: "c0000000-0000-0000-0000-000000000003", name: "Bahasa Indonesia", code: "BIN" },
    { id: "c0000000-0000-0000-0000-000000000004", name: "Bahasa Inggris", code: "BIG" },
  ]);

  const handleOpenAdd = () => {
    setSelectedSubject(null);
    setName("");
    setCode("");
    setModalOpen(true);
  };

  const handleOpenEdit = (s: SubjectItem) => {
    setSelectedSubject(s);
    setName(s.name);
    setCode(s.code);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveSubjectAction({
      id: selectedSubject ? selectedSubject.id : undefined,
      name,
      code,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan mata pelajaran");
      return;
    }

    if (selectedSubject) {
      setSubjectList((prev) =>
        prev.map((s) => (s.id === selectedSubject.id ? { ...s, name, code: code.toUpperCase() } : s))
      );
      toast.success("Mata pelajaran diperbarui");
    } else {
      const newS: SubjectItem = {
        id: crypto.randomUUID(),
        name,
        code: code.toUpperCase(),
      };
      setSubjectList((prev) => [...prev, newS]);
      toast.success("Mata pelajaran baru ditambahkan");
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    const res = await deleteSubjectAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus mata pelajaran");
      return;
    }
    setSubjectList((prev) => prev.filter((s) => s.id !== id));
    toast.success("Mata pelajaran dihapus");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Master Mata Pelajaran
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola daftar kurikulum mapel dan kode rujukan pembelajaran.
            </p>
          </div>
          <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Mapel
          </GlassButton>
        </div>

        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Kode Mapel</TableHeaderCell>
              <TableHeaderCell>Nama Mata Pelajaran</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {subjectList.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {s.code}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <BookOpen className="w-4 h-4 text-brand-500" />
                    {s.name}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Ubah Mapel"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Hapus Mapel"
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
          title={selectedSubject ? "Ubah Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <GlassInput
              label="Nama Mata Pelajaran"
              placeholder="Contoh: Pendidikan Pancasila, Fisika"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <GlassInput
              label="Kode Mapel (Singkatan Unik)"
              placeholder="Contoh: PPKN, FIS"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end gap-2">
              <GlassButton type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm" isLoading={isLoading}>
                Simpan
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      </div>
    </AppLayout>
  );
}

