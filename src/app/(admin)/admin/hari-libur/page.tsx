"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { saveHolidayAction, deleteHolidayAction } from "@/features/admin/actions";
import { formatTanggal } from "@/lib/utils";
import { toast } from "sonner";
import { CalendarDays, Plus, Edit2, Trash2 } from "lucide-react";

interface HolidayItem {
  id: string;
  date: string;
  name: string;
}

export default function AdminHariLiburPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayItem | null>(null);

  const [date, setDate] = useState("2026-08-17");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [holidayList, setHolidayList] = useState<HolidayItem[]>([
    { id: "1", date: "2026-08-17", name: "Hari Kemerdekaan RI Ke-81" },
    { id: "2", date: "2026-10-08", name: "Maulid Nabi Muhammad SAW" },
    { id: "3", date: "2026-12-25", name: "Hari Raya Natal" },
  ]);

  const handleOpenAdd = () => {
    setSelectedHoliday(null);
    setDate("");
    setName("");
    setModalOpen(true);
  };

  const handleOpenEdit = (h: HolidayItem) => {
    setSelectedHoliday(h);
    setDate(h.date);
    setName(h.name);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveHolidayAction({
      id: selectedHoliday ? selectedHoliday.id : undefined,
      date,
      name,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan hari libur");
      return;
    }

    if (selectedHoliday) {
      setHolidayList((prev) =>
        prev.map((h) => (h.id === selectedHoliday.id ? { ...h, date, name } : h))
      );
      toast.success("Hari libur berhasil diperbarui");
    } else {
      const newH: HolidayItem = {
        id: crypto.randomUUID(),
        date,
        name,
      };
      setHolidayList((prev) => [...prev, newH]);
      toast.success("Hari libur baru berhasil ditambahkan");
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hari libur ini?")) return;
    const res = await deleteHolidayAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus hari libur");
      return;
    }
    setHolidayList((prev) => prev.filter((h) => h.id !== id));
    toast.success("Hari libur dihapus");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kalender Hari Libur
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tanggal libur otomatis dilewati saat guru membuat agenda mengajar dari jadwal.
            </p>
          </div>
          <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Hari Libur
          </GlassButton>
        </div>

        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tanggal Libur</TableHeaderCell>
              <TableHeaderCell>Nama Hari Libur / Peringatan</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {holidayList.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-rose-500" />
                    {formatTanggal(h.date)}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                  {h.name}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(h)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(h.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
          title={selectedHoliday ? "Ubah Hari Libur" : "Tambah Hari Libur Baru"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <GlassInput
              label="Tanggal Libur"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <GlassInput
              label="Nama Peringatan / Keterangan Libur"
              placeholder="Contoh: Hari Guru Nasional, Libur Semester"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

