'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassSelect } from '@/components/ui/GlassSelect';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassModal } from '@/components/ui/GlassModal';
import { formatTanggal } from '@/lib/utils';
import { createAssessment } from '@/features/guru/penilaian/actions';

interface Assessment {
  id: string;
  name: string;
  category: 'formatif' | 'sumatif';
  assessment_type: string;
  date: string;
  max_score: number;
  weight: number;
  tp?: { id: string; code: string; description: string } | null;
}

interface Assignment {
  id: string;
  kktp: number;
  weight_formative: number;
  weight_summative: number;
  subject: { id: string; name: string; code: string };
  class: { id: string; name: string; grade: number };
}

interface Props {
  penugasanList: Assignment[];
  selectedAssignmentId: string;
  assessments: Assessment[];
}

export default function PenilaianClient({
  penugasanList,
  selectedAssignmentId,
  assessments,
}: Props) {
  const [currentAssignmentId, setCurrentAssignmentId] = useState(selectedAssignmentId);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isPending, setIsPending] = useState(false);

  const selectedAssignment = penugasanList.find(p => p.id === currentAssignmentId);

  const filteredAssessments = assessments.filter(a => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  const handleAssignmentChange = (newId: string) => {
    setCurrentAssignmentId(newId);
    window.location.href = `/penilaian?assignment_id=${newId}`;
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    fd.append('assignment_id', currentAssignmentId);
    const res = await createAssessment(fd);
    setIsPending(false);
    if (res.error) {
      alert(res.error);
    } else {
      setModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Penilaian Kurikulum Merdeka</h1>
          <p className="text-sm text-white/60 mt-1">
            Kelola asesmen formatif & sumatif, input nilai spreadsheet, dan pantau ketercapaian TP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/penilaian/rekap?assignment_id=${currentAssignmentId}`}>
            <GlassButton variant="secondary">
              📊 Rekap Nilai Akhir
            </GlassButton>
          </Link>
          <GlassButton variant="primary" onClick={() => setModalOpen(true)}>
            + Buat Asesmen Baru
          </GlassButton>
        </div>
      </div>

      {/* Selector & Info Bobot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 md:col-span-2">
          <label className="text-xs text-white/60 block mb-1">Pilih Penugasan (Mata Pelajaran × Kelas)</label>
          <GlassSelect
            value={currentAssignmentId}
            onChange={e => handleAssignmentChange(e.target.value)}
          >
            {penugasanList.map(p => (
              <option key={p.id} value={p.id}>
                {p.subject.name} - Kelas {p.class.name}
              </option>
            ))}
          </GlassSelect>
        </GlassCard>

        {selectedAssignment && (
          <GlassCard className="p-4 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs text-white/60">KKTP</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {selectedAssignment.kktp}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-xs text-white/60">Bobot Formatif</div>
              <div className="text-xl font-bold text-blue-400 mt-0.5">
                {selectedAssignment.weight_formative}%
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-xs text-white/60">Bobot Sumatif</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">
                {selectedAssignment.weight_summative}%
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Filter Category */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            categoryFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'glass-panel text-white/70 hover:bg-white/10'
          }`}
        >
          Semua Asesmen ({assessments.length})
        </button>
        <button
          onClick={() => setCategoryFilter('formatif')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            categoryFilter === 'formatif'
              ? 'bg-blue-600 text-white'
              : 'glass-panel text-white/70 hover:bg-white/10'
          }`}
        >
          Formatif ({assessments.filter(a => a.category === 'formatif').length})
        </button>
        <button
          onClick={() => setCategoryFilter('sumatif')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            categoryFilter === 'sumatif'
              ? 'bg-blue-600 text-white'
              : 'glass-panel text-white/70 hover:bg-white/10'
          }`}
        >
          Sumatif ({assessments.filter(a => a.category === 'sumatif').length})
        </button>
      </div>

      {/* List Asesmen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssessments.length === 0 ? (
          <div className="col-span-full">
            <GlassCard className="p-8 text-center text-white/50">
              Belum ada data asesmen untuk penugasan ini. Klik &quot;+ Buat Asesmen Baru&quot; untuk memulai.
            </GlassCard>
          </div>
        ) : (
          filteredAssessments.map(item => (
            <GlassCard key={item.id} className="p-5 flex flex-col justify-between hover:bg-white/10 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      item.category === 'formatif'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {item.category} • {item.assessment_type}
                  </span>
                  <span className="text-xs text-white/50">📅 {formatTanggal(item.date)}</span>
                </div>

                <h3 className="font-semibold text-white text-base line-clamp-1">{item.name}</h3>

                {item.tp && (
                  <p className="text-xs text-emerald-300 line-clamp-1">
                    🎯 TP: {item.tp.code} - {item.tp.description}
                  </p>
                )}

                <div className="text-xs text-white/60 flex items-center gap-3 pt-1">
                  <span>Skor Maks: <strong>{item.max_score}</strong></span>
                  <span>•</span>
                  <span>Bobot: <strong>{item.weight}x</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-end">
                <Link href={`/penilaian/${item.id}`} className="w-full">
                  <GlassButton variant="primary" size="sm" className="w-full">
                    📝 Input & Kelola Nilai
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal Buat Asesmen */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat Asesmen Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs text-white/70 block mb-1">Nama Asesmen *</label>
            <GlassInput
              name="name"
              required
              placeholder="Contoh: Tes Formatif 1 - Pola Bilangan"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Kategori *</label>
              <GlassSelect name="category" required defaultValue="formatif">
                <option value="formatif">Formatif</option>
                <option value="sumatif">Sumatif</option>
              </GlassSelect>
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Jenis Asesmen *</label>
              <GlassSelect name="assessment_type" required defaultValue="SLM">
                <option value="SLM">Sumatif Lingkup Materi (SLM)</option>
                <option value="SAS">Sumatif Akhir Semester (SAS)</option>
                <option value="SAT">Sumatif Akhir Tahun (SAT)</option>
                <option value="lainnya">Lainnya / Formatif</option>
              </GlassSelect>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Tanggal *</label>
              <GlassInput type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Skor Maksimal</label>
              <GlassInput type="number" name="max_score" defaultValue="100" min="1" max="100" />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Bobot</label>
              <GlassInput type="number" name="weight" defaultValue="1" min="1" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <GlassButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Buat Asesmen'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}

