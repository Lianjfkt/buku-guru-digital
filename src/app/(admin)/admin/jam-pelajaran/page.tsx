"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { saveSchoolPeriodAction, deleteSchoolPeriodAction } from "@/features/admin/actions";
import { toast } from "sonner";
import { Clock, Plus, Edit2, Trash2, Coffee } from "lucide-react";

interface PeriodItem {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
}

export default function AdminJamPelajaranPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodItem | null>(null);

  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [startTime, setStartTime] = useState("07:15");
  const [endTime, setEndTime] = useState("08:00");
  const [isBreak, setIsBreak] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [periodList, setPeriodList] = useState<PeriodItem[]>([
    { id: "1", period_number: 1, start_time: "07:15", end_time: "08:00", is_break: false },
    { id: "2", period_number: 2, start_time: "08:00", end_time: "08:45", is_break: false },
    { id: "3", period_number: 3, start_time: "08:45", end_time: "09:30", is_break: false },
    { id: "4", period_number: 4, start_time: "09:30", end_time: "10:00", is_break: true },
    { id: "5", period_number: 5, start_time: "10:00", end_time: "10:45", is_break: false },
    { id: "6", period_number: 6, start_time: "10:45", end_time: "11:30", is_break: false },
    { id: "7", period_number: 7, start_time: "11:30", end_time: "12:15", is_break: false },
    { id: "8", period_number: 8, start_time: "12:15", end_time: "13:00", is_break: true },
  ]);

  const handleOpenAdd = () => {
    setSelectedPeriod(null);
    setPeriodNumber(periodList.length + 1);
    setStartTime("13:00");
    setEndTime("13:45");
    setIsBreak(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: PeriodItem) => {
    setSelectedPeriod(p);
    setPeriodNumber(p.period_number);
    setStartTime(p.start_time.slice(0, 5));
    setEndTime(p.end_time.slice(0, 5));
    setIsBreak(p.is_break);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveSchoolPeriodAction({
      id: selectedPeriod ? selectedPeriod.id : undefined,
      period_number: periodNumber,
      start_time: startTime,
      end_time: endTime,
      is_break: isBreak,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan jam pelajaran");
      return;
    }

    if (selectedPeriod) {
      setPeriodList((prev) =>
        prev.map((p) =>
          p.id === selectedPeriod.id
            ? { ...p, period_number: periodNumber, start_time: startTime, end_time: endTime, is_break: isBreak }
            : p
        )
      );
      toast.success("Jam pelajaran berhasil diubah");
    } else {
      const newP: PeriodItem = {
        id: crypto.randomUUID(),
        period_number: periodNumber,
        start_time: startTime,
        end_time: endTime,
        is_break: isBreak,
      };
      setPeriodList((prev) => [...prev, newP]);
      toast.success("Jam pelajaran baru ditambahkan");
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jam pelajaran ini?")) return;
    const res = await deleteSchoolPeriodAction(id);
    if (!res.ok) {
      toast.error("Gagal menghapus jam pelajaran");
      return;
    }
    setPeriodList((prev) => prev.filter((p) => p.id !== id));
    toast.success("Jam pelajaran dihapus");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Master Jam Pelajaran
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola slot waktu jam mengajar dan penanda waktu istirahat sekolah.
            </p>
          </div>
          <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Jam Pelajaran
          </GlassButton>
        </div>

        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Jam Ke-</TableHeaderCell>
              <TableHeaderCell>Waktu Mulai - Selesai</TableHeaderCell>
              <TableHeaderCell>Tipe Sesi</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {periodList
              .sort((a, b) => a.period_number - b.period_number)
              .map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-500" />
                      Jam ke-{p.period_number}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.start_time.slice(0, 5)} - {p.end_time.slice(0, 5)} WIB
                  </TableCell>
                  <TableCell>
                    {p.is_break ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        <Coffee className="w-3.5 h-3.5" /> Istirahat
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-brand-500/15 text-brand-700 dark:text-brand-300">
                        Jam Belajar
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
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
          title={selectedPeriod ? "Ubah Jam Pelajaran" : "Tambah Jam Pelajaran Baru"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <GlassInput
              label="Urutan Jam Ke-"
              type="number"
              min={1}
              value={periodNumber}
              onChange={(e) => setPeriodNumber(Number(e.target.value))}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Waktu Mulai"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />

              <GlassInput
                label="Waktu Selesai"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isBreak"
                checked={isBreak}
                onChange={(e) => setIsBreak(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isBreak" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tandai sebagai Jam Istirahat
              </label>
            </div>

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

