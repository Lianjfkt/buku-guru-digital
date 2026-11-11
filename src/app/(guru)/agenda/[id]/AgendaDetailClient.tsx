'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassSelect } from '@/components/ui/GlassSelect';
import { formatTanggal } from '@/lib/utils';
import { simpanPresensi, simpanAgenda } from '@/features/guru/agenda/actions';
import { queueAttendance, getQueuedAttendanceForAgenda, clearSyncedAttendance } from '@/lib/offline/attendanceQueue';

interface Student {
  id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string;
}

interface AgendaDetail {
  id: string;
  date: string;
  topic: string;
  activity: string | null;
  reflection: string | null;
  status: 'dijadwalkan' | 'terlaksana' | 'tidak_terlaksana';
  not_held_reason: string | null;
  assignment_id: string;
  assignment: {
    id: string;
    subject: { id: string; name: string; code: string };
    class: {
      id: string;
      name: string;
      grade: number;
      students: Student[];
    };
  };
  tp?: { id: string; code: string; description: string } | null;
  attendance: Array<{
    student_id: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpa';
    notes: string | null;
  }>;
}

interface Props {
  agenda: AgendaDetail;
}

export default function AgendaDetailClient({ agenda }: Props) {
  const [students] = useState<Student[]>(agenda.assignment.class.students || []);
  
  // Attendance local state map student_id -> { status, notes }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'hadir' | 'sakit' | 'izin' | 'alpa'; notes: string }>>(() => {
    const map: Record<string, { status: 'hadir' | 'sakit' | 'izin' | 'alpa'; notes: string }> = {};
    agenda.attendance.forEach(a => {
      map[a.student_id] = { status: a.status, notes: a.notes || '' };
    });
    return map;
  });

  const [topic, setTopic] = useState(agenda.topic);
  const [activity, setActivity] = useState(agenda.activity || '');
  const [reflection, setReflection] = useState(agenda.reflection || '');
  const [status, setStatus] = useState(agenda.status);
  const [notHeldReason, setNotHeldReason] = useState(agenda.not_held_reason || '');

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    // Cek apakah ada antrean offline untuk agenda ini
    getQueuedAttendanceForAgenda(agenda.id).then(queued => {
      if (queued.length > 0) {
        setMessage({
          text: `Ada ${queued.length} presensi tersimpan di offline storage. Klik Simpan untuk sinkronisasi.`,
          type: 'info',
        });
        setAttendanceMap(prev => {
          const next = { ...prev };
          queued.forEach(q => {
            next[q.student_id] = { status: q.status, notes: q.notes || '' };
          });
          return next;
        });
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [agenda.id]);

  // Batch mark all present in < 60s
  const handleMarkAllHadir = () => {
    const nextMap = { ...attendanceMap };
    students.forEach(s => {
      nextMap[s.id] = {
        status: 'hadir',
        notes: nextMap[s.id]?.notes || '',
      };
    });
    setAttendanceMap(nextMap);
    setMessage({ text: 'Semua siswa ditandai HADIR. Pastikan klik Simpan Presensi.', type: 'info' });
  };

  const handleStatusChange = (studentId: string, newStatus: 'hadir' | 'sakit' | 'izin' | 'alpa') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status: newStatus,
        notes: prev[studentId]?.notes || '',
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'hadir',
        notes,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setMessage(null);
    const records = Object.entries(attendanceMap).map(([student_id, val]) => ({
      student_id,
      status: val.status,
      notes: val.notes || undefined,
    }));

    if (records.length === 0) {
      setMessage({ text: 'Belum ada data presensi yang diisi.', type: 'error' });
      return;
    }

    if (!navigator.onLine) {
      // Offline mode: simpan ke IndexedDB
      await queueAttendance(agenda.id, records);
      setMessage({
        text: 'Koneksi offline: Presensi disimpan ke perangkat lokal dan akan disinkronkan saat online.',
        type: 'info',
      });
      return;
    }

    startTransition(async () => {
      const res = await simpanPresensi(agenda.id, records);
      if (res.error) {
        // Fallback to queue if network error
        await queueAttendance(agenda.id, records);
        setMessage({ text: `Gagal ke server (${res.error}), disimpan ke antrean offline.`, type: 'info' });
      } else {
        await clearSyncedAttendance(agenda.id);
        setMessage({ text: 'Presensi berhasil disimpan ke server!', type: 'success' });
      }
    });
  };

  const handleSaveAgendaDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const fd = new FormData();
    fd.append('assignment_id', agenda.assignment_id);
    fd.append('date', agenda.date);
    fd.append('topic', topic);
    fd.append('activity', activity);
    fd.append('reflection', reflection);
    fd.append('status', status);
    if (status === 'tidak_terlaksana') {
      fd.append('not_held_reason', notHeldReason);
    }
    if (agenda.tp?.id) {
      fd.append('tp_id', agenda.tp.id);
    }

    startTransition(async () => {
      const res = await simpanAgenda(fd, agenda.id);
      if (res.error) {
        setMessage({ text: `Gagal simpan agenda: ${res.error}`, type: 'error' });
      } else {
        setMessage({ text: 'Detail agenda berhasil diperbarui!', type: 'success' });
      }
    });
  };

  // Summary counts
  const counts = { hadir: 0, sakit: 0, izin: 0, alpa: 0, unrecorded: 0 };
  students.forEach(s => {
    const st = attendanceMap[s.id]?.status;
    if (st) counts[st]++;
    else counts.unrecorded++;
  });

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/agenda" className="text-xs text-white/50 hover:text-white mb-1 inline-block">
            ← Kembali ke Daftar Agenda
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {agenda.assignment.subject.name} - Kelas {agenda.assignment.class.name}
          </h1>
          <p className="text-sm text-white/60">
            📅 {formatTanggal(agenda.date)} • {agenda.assignment.subject.code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium">
              ⚡ Mode Offline
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : message.type === 'error'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs / Two Columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Detail Agenda Form */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-5">
            <h2 className="text-base font-semibold text-white mb-3">Detail Pelaksanaan Agenda</h2>
            <form onSubmit={handleSaveAgendaDetail} className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Materi / Topik *</label>
                <GlassInput
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Aktivitas Pembelajaran</label>
                <textarea
                  className="w-full glass-input rounded-lg p-2.5 text-xs text-white bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none"
                  rows={3}
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                  placeholder="Kegiatan yang dilakukan..."
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Refleksi Guru</label>
                <textarea
                  className="w-full glass-input rounded-lg p-2.5 text-xs text-white bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none"
                  rows={3}
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="Catatan evaluasi atau kendala siswa..."
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Status Pembelajaran</label>
                <GlassSelect
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="dijadwalkan">Dijadwalkan</option>
                  <option value="terlaksana">Terlaksana</option>
                  <option value="tidak_terlaksana">Tidak Terlaksana</option>
                </GlassSelect>
              </div>

              {status === 'tidak_terlaksana' && (
                <div>
                  <label className="text-xs text-white/70 block mb-1">Alasan Tidak Terlaksana *</label>
                  <GlassInput
                    value={notHeldReason}
                    onChange={e => setNotHeldReason(e.target.value)}
                    placeholder="Contoh: Rapat dinas guru..."
                    required
                  />
                </div>
              )}

              <GlassButton
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? 'Menyimpan...' : 'Perbarui Detail Agenda'}
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Kolom 2 & 3: Presensi Siswa */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Presensi Siswa</h2>
                <div className="flex flex-wrap gap-2 text-xs text-white/70 mt-1">
                  <span className="text-emerald-400">Hadir: {counts.hadir}</span>
                  <span className="text-blue-400">Sakit: {counts.sakit}</span>
                  <span className="text-amber-400">Izin: {counts.izin}</span>
                  <span className="text-rose-400">Alpa: {counts.alpa}</span>
                  {counts.unrecorded > 0 && (
                    <span className="text-white/40">Belum: {counts.unrecorded}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkAllHadir}
                >
                  ⚡ Tandai Semua Hadir
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAttendance}
                  disabled={isPending}
                >
                  {isPending ? 'Menyimpan...' : '💾 Simpan Presensi'}
                </GlassButton>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/60">
                    <th className="py-2.5 px-2 w-12 text-center">No</th>
                    <th className="py-2.5 px-2">Nama Siswa</th>
                    <th className="py-2.5 px-2 w-20">NIS</th>
                    <th className="py-2.5 px-2 text-center w-64">Status Presensi</th>
                    <th className="py-2.5 px-2">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((student, idx) => {
                    const current = attendanceMap[student.id]?.status || 'hadir';
                    const currentNote = attendanceMap[student.id]?.notes || '';
                    return (
                      <tr key={student.id} className="hover:bg-white/[0.03]">
                        <td className="py-2.5 px-2 text-center text-white/50">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <span className="font-medium text-white">{student.full_name}</span>
                          <span className="text-[10px] text-white/40 ml-1">({student.gender})</span>
                        </td>
                        <td className="py-2.5 px-2 text-white/60 font-mono">{student.nis}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-1">
                            {(['hadir', 'sakit', 'izin', 'alpa'] as const).map(st => {
                              const isSelected = current === st;
                              const colors = {
                                hadir: isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white/5 text-emerald-300 hover:bg-emerald-500/20',
                                sakit: isSelected ? 'bg-blue-500 text-white shadow-sm' : 'bg-white/5 text-blue-300 hover:bg-blue-500/20',
                                izin: isSelected ? 'bg-amber-500 text-white shadow-sm' : 'bg-white/5 text-amber-300 hover:bg-amber-500/20',
                                alpa: isSelected ? 'bg-rose-500 text-white shadow-sm' : 'bg-white/5 text-rose-300 hover:bg-rose-500/20',
                              };
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, st)}
                                  className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-all touch-target ${colors[st]}`}
                                >
                                  {st[0].toUpperCase() + st.slice(1)}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={currentNote}
                            onChange={e => handleNotesChange(student.id, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

