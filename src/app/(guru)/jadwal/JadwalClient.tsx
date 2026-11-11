'use client';

import { useState, useTransition } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassSelect } from '@/components/ui/GlassSelect';
import { tambahJadwal, ubahJadwal, hapusJadwal } from '@/features/guru/jadwal/actions';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';

const HARI = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

type Penugasan = {
  id: string;
  subject: { id: string; name: string; code: string };
  class: { id: string; name: string; grade: number };
  school_period: { id: string; name: string; is_active: boolean };
};

type JamPelajaran = {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
};

type Jadwal = {
  id: string;
  day_of_week: number;
  effective_date: string;
  end_date: string | null;
  room: string | null;
  assignment: Penugasan;
  period: JamPelajaran;
};

type Props = {
  initialJadwal: Jadwal[];
  penugasanList: Penugasan[];
  jamPelajaranList: JamPelajaran[];
};

function formatWaktu(t: string) {
  return t?.substring(0, 5) ?? '';
}

export default function JadwalClient({ initialJadwal, penugasanList, jamPelajaranList }: Props) {
  const [jadwalList, setJadwalList] = useState(initialJadwal);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Jadwal | null>(null);
  const [deleteItem, setDeleteItem] = useState<Jadwal | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Susun grid: hari 1-6 × jam
  const days = [1, 2, 3, 4, 5, 6];
  const jadwalByDayPeriod: Record<string, Jadwal[]> = {};
  jadwalList.forEach(j => {
    const key = `${j.day_of_week}-${j.period.id}`;
    if (!jadwalByDayPeriod[key]) jadwalByDayPeriod[key] = [];
    jadwalByDayPeriod[key].push(j);
  });

  const activePeriods = jamPelajaranList
    .filter(j => !j.is_break)
    .sort((a, b) => a.period_number - b.period_number);

  function handleEdit(jadwal: Jadwal) {
    setEditItem(jadwal);
    setModalOpen(true);
  }

  function handleTambah() {
    setEditItem(null);
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const result = editItem
        ? await ubahJadwal(editItem.id, fd)
        : await tambahJadwal(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setModalOpen(false);
      // Refresh halaman (simple approach - could use router.refresh())
      window.location.reload();
    });
  }

  async function handleDelete() {
    if (!deleteItem) return;
    startTransition(async () => {
      await hapusJadwal(deleteItem.id);
      setDeleteItem(null);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Jadwal Mengajar</h1>
          <p className="text-sm text-white/60 mt-1">Kelola jadwal mengajar mingguan Anda</p>
        </div>
        <GlassButton variant="primary" onClick={handleTambah}>
          + Tambah Jadwal
        </GlassButton>
      </div>

      {/* Grid Jadwal */}
      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-white/70 font-medium w-24">Jam</th>
              {days.map(d => (
                <th key={d} className="text-left py-3 px-3 text-white/70 font-medium min-w-[140px]">
                  {HARI[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jamPelajaranList.map(jam => (
              <tr key={jam.id} className={jam.is_break ? 'bg-white/[0.02]' : ''}>
                <td className="py-3 px-4 border-t border-white/5">
                  <div className="text-white/80 font-medium text-xs">
                    {jam.is_break ? '☕ Istirahat' : `JP ${jam.period_number}`}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">
                    {formatWaktu(jam.start_time)}–{formatWaktu(jam.end_time)}
                  </div>
                </td>
                {days.map(day => {
                  const key = `${day}-${jam.id}`;
                  const items = jadwalByDayPeriod[key] || [];
                  return (
                    <td key={day} className="py-2 px-2 border-t border-white/5 align-top">
                      {items.map(jadwal => (
                        <div
                          key={jadwal.id}
                          className="glass-panel rounded-lg p-2 mb-1 cursor-pointer hover:bg-white/10 transition-colors group"
                        >
                          <div className="text-white text-xs font-semibold truncate">
                            {jadwal.assignment.subject.code}
                          </div>
                          <div className="text-white/60 text-xs truncate">
                            {jadwal.assignment.class.name}
                          </div>
                          {jadwal.room && (
                            <div className="text-white/40 text-xs">{jadwal.room}</div>
                          )}
                          <div className="hidden group-hover:flex gap-1 mt-1">
                            <button
                              onClick={() => handleEdit(jadwal)}
                              className="text-xs text-blue-300 hover:text-blue-200 touch-target"
                            >
                              Edit
                            </button>
                            <span className="text-white/20">|</span>
                            <button
                              onClick={() => setDeleteItem(jadwal)}
                              className="text-xs text-red-300 hover:text-red-200 touch-target"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Daftar Jadwal (mobile-friendly) */}
      <div className="lg:hidden space-y-3">
        {jadwalList.map(jadwal => (
          <GlassCard key={jadwal.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-semibold">
                  {jadwal.assignment.subject.name}
                </div>
                <div className="text-white/60 text-sm">
                  {HARI[jadwal.day_of_week]} • {formatWaktu(jadwal.period.start_time)}–{formatWaktu(jadwal.period.end_time)}
                </div>
                <div className="text-white/50 text-sm">{jadwal.assignment.class.name}</div>
                {jadwal.room && <div className="text-white/40 text-xs mt-1">📍 {jadwal.room}</div>}
              </div>
              <div className="flex gap-2">
                <GlassButton size="sm" onClick={() => handleEdit(jadwal)}>Edit</GlassButton>
                <GlassButton size="sm" variant="danger" onClick={() => setDeleteItem(jadwal)}>Hapus</GlassButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal Tambah/Edit */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Jadwal' : 'Tambah Jadwal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="glass-panel rounded-lg p-3 border border-red-500/30 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-white/70 mb-1">Penugasan (Mapel × Kelas)</label>
            <GlassSelect name="assignment_id" required defaultValue={editItem?.assignment.id ?? ''}>
              <option value="">Pilih penugasan...</option>
              {penugasanList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.subject.name} - {p.class.name} ({p.school_period.name})
                </option>
              ))}
            </GlassSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Hari</label>
              <GlassSelect name="day_of_week" required defaultValue={editItem?.day_of_week?.toString() ?? ''}>
                <option value="">Pilih hari...</option>
                {[1,2,3,4,5,6].map(d => (
                  <option key={d} value={d.toString()}>{HARI[d]}</option>
                ))}
              </GlassSelect>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Jam Pelajaran</label>
              <GlassSelect name="period_id" required defaultValue={editItem?.period.id ?? ''}>
                <option value="">Pilih jam...</option>
                {activePeriods.map(j => (
                  <option key={j.id} value={j.id}>
                    JP {j.period_number} ({formatWaktu(j.start_time)}–{formatWaktu(j.end_time)})
                  </option>
                ))}
              </GlassSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Tanggal Efektif</label>
              <GlassInput
                type="date"
                name="effective_date"
                required
                defaultValue={editItem?.effective_date ?? ''}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Tanggal Berakhir (opsional)</label>
              <GlassInput
                type="date"
                name="end_date"
                defaultValue={editItem?.end_date ?? ''}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Ruangan (opsional)</label>
            <GlassInput
              name="room"
              placeholder="Contoh: Kelas 10A, Lab Komputer..."
              defaultValue={editItem?.room ?? ''}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton type="button" onClick={() => setModalOpen(false)}>Batal</GlassButton>
            <GlassButton type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Jadwal'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        title="Hapus Jadwal"
        description={`Hapus jadwal ${deleteItem?.assignment.subject.name} - ${HARI[deleteItem?.day_of_week ?? 0]}?`}
        confirmLabel="Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  );
}

