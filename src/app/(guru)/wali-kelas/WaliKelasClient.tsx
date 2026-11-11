'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassSelect } from '@/components/ui/GlassSelect';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassModal } from '@/components/ui/GlassModal';
import { formatTanggal } from '@/lib/utils';
import { addStudentNote } from '@/features/guru/wali-kelas/actions';

interface Student {
  id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string;
}

interface Assignment {
  id: string;
  kktp: number;
  subject: { id: string; name: string; code: string };
  teacher: { id: string; full_name: string };
}

interface Note {
  id: string;
  student_id: string;
  category: string;
  note: string;
  follow_up: string | null;
  date: string;
}

interface Props {
  classes: Array<{
    id: string;
    name: string;
    grade_level?: number;
    students: Student[];
  }>;
  selectedClassId: string;
  initialLeger: {
    classData: any;
    assignments: Assignment[];
    notes: Note[];
    subjectScores: Record<string, any[]>;
  } | null;
}

export default function WaliKelasClient({
  classes,
  selectedClassId,
  initialLeger,
}: Props) {
  const [currentClassId, setCurrentClassId] = useState(selectedClassId);
  const [activeTab, setActiveTab] = useState<'leger' | 'catatan'>('leger');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [search, setSearch] = useState('');

  const currentClass = classes.find(c => c.id === currentClassId);
  const students = currentClass?.students || [];
  const assignments = initialLeger?.assignments || [];
  const subjectScores = initialLeger?.subjectScores || {};
  const notes = initialLeger?.notes || [];

  const handleClassChange = (newId: string) => {
    setCurrentClassId(newId);
    window.location.href = `/wali-kelas?class_id=${newId}`;
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await addStudentNote(fd);
    setIsPending(false);
    if (res.error) {
      alert(res.error);
    } else {
      setNoteModalOpen(false);
      window.location.reload();
    }
  };

  const filteredStudents = students.filter(st => {
    if (!search) return true;
    const q = search.toLowerCase();
    return st.full_name.toLowerCase().includes(q) || st.nis.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal Wali Kelas</h1>
          <p className="text-sm text-white/60 mt-1">
            Pantau Leger Nilai seluruh mata pelajaran & kelola Catatan Perkembangan Siswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant={activeTab === 'leger' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('leger')}
          >
            📋 Leger Nilai Kelas
          </GlassButton>
          <GlassButton
            variant={activeTab === 'catatan' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('catatan')}
          >
            📝 Catatan Siswa ({notes.length})
          </GlassButton>
        </div>
      </div>

      {/* Selector Kelas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 sm:col-span-2">
          <label className="text-xs text-white/60 block mb-1">Pilih Kelas Binaan</label>
          <GlassSelect
            value={currentClassId}
            onChange={e => handleClassChange(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Kelas {c.name} - {c.students.length} Siswa
              </option>
            ))}
          </GlassSelect>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xs text-white/60">Total Siswa</div>
            <div className="text-xl font-bold text-white mt-0.5">{students.length}</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-xs text-white/60">Total Mapel</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{assignments.length}</div>
          </div>
        </GlassCard>
      </div>

      {/* Tab: Leger Nilai */}
      {activeTab === 'leger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-72">
              <GlassInput
                placeholder="Cari siswa di leger..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs text-white/50">
              * Nilai akhir dihitung otomatis berdasarkan pembobotan formatif & sumatif per mapel
            </div>
          </div>

          <GlassCard className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="py-3 px-2 w-10 text-center">No</th>
                  <th className="py-3 px-3 w-24">NIS</th>
                  <th className="py-3 px-3 min-w-[180px]">Nama Siswa</th>
                  {assignments.map(a => (
                    <th key={a.id} className="py-3 px-2 text-center min-w-[80px]">
                      <div className="font-semibold text-white truncate max-w-[100px]">{a.subject.code}</div>
                      <div className="text-[10px] text-white/40 font-normal">KKTP {a.kktp}</div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-[80px] bg-white/[0.03]">Rata-Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={assignments.length + 4} className="py-8 text-center text-white/40">
                      Tidak ada data siswa.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => {
                    let totalFinal = 0;
                    let countFinal = 0;

                    return (
                      <tr key={st.id} className="hover:bg-white/[0.03]">
                        <td className="py-2.5 px-2 text-center text-white/40">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-white/60">{st.nis}</td>
                        <td className="py-2.5 px-3 font-medium text-white">{st.full_name}</td>
                        {assignments.map(a => {
                          const summaryList = subjectScores[a.id] || [];
                          const studentSummary = summaryList.find((x: any) => x.student_id === st.id);
                          const finalVal = studentSummary?.final_score;

                          if (finalVal !== undefined && finalVal !== null) {
                            totalFinal += Number(finalVal);
                            countFinal++;
                          }

                          return (
                            <td key={a.id} className="py-2.5 px-2 text-center">
                              {finalVal !== undefined && finalVal !== null ? (
                                <span
                                  className={`font-semibold ${
                                    Number(finalVal) < a.kktp
                                      ? 'text-rose-400'
                                      : 'text-emerald-300'
                                  }`}
                                >
                                  {finalVal}
                                </span>
                              ) : (
                                <span className="text-white/20">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-bold text-white bg-white/[0.03]">
                          {countFinal > 0
                            ? (totalFinal / countFinal).toFixed(1)
                            : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      {/* Tab: Catatan Siswa */}
      {activeTab === 'catatan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Catatan Perkembangan Siswa</h2>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setNoteModalOpen(true)}
            >
              + Tambah Catatan Siswa
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.length === 0 ? (
              <div className="col-span-full">
                <GlassCard className="p-8 text-center text-white/50">
                  Belum ada catatan perkembangan siswa untuk kelas ini.
                </GlassCard>
              </div>
            ) : (
              notes.map(n => {
                const student = students.find(s => s.id === n.student_id);
                return (
                  <GlassCard key={n.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">
                        {student?.full_name || 'Siswa'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-bold">
                        {n.category}
                      </span>
                    </div>
                    <div className="text-xs text-white/50">📅 {formatTanggal(n.date)}</div>
                    <p className="text-xs text-white/80 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      {n.note}
                    </p>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Catatan */}
      <GlassModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Tambah Catatan Perkembangan Siswa"
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="text-xs text-white/70 block mb-1">Pilih Siswa *</label>
            <GlassSelect name="student_id" required defaultValue="">
              <option value="">Pilih siswa...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nis} - {s.full_name}
                </option>
              ))}
            </GlassSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Kategori *</label>
              <GlassSelect name="category" required defaultValue="akademik">
                <option value="akademik">Akademik</option>
                <option value="sikap">Sikap</option>
                <option value="perilaku">Perilaku</option>
                <option value="prestasi">Prestasi</option>
              </GlassSelect>
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Tanggal *</label>
              <GlassInput
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">Catatan / Deskripsi *</label>
            <textarea
              name="note"
              required
              rows={3}
              placeholder="Deskripsi observasi atau kejadian..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <GlassButton type="button" variant="secondary" onClick={() => setNoteModalOpen(false)}>
              Batal
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Catatan'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}

