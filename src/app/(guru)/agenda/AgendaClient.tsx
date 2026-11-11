'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassSelect } from '@/components/ui/GlassSelect';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { formatTanggal } from '@/lib/utils';
import { generateAgendasOtomatis } from '@/features/guru/agenda/actions';

interface AgendaItem {
  id: string;
  date: string;
  topic: string;
  activity: string | null;
  reflection: string | null;
  status: 'Dijadwalkan' | 'Terlaksana' | 'Tidak Terlaksana' | string;
  not_held_reason: string | null;
  assignment: {
    id: string;
    subject: { id: string; name: string; code: string };
    class: { id: string; name: string; grade?: number };
  };
  tp?: { id: string; code: string; description: string } | null;
}

interface AssignmentItem {
  id: string;
  subject: { id: string; name: string; code: string };
  class: { id: string; name: string; grade?: number };
  semester?: { id: string; name: string; is_active: boolean };
  school_period?: { id: string; name: string; is_active: boolean };
}

interface Props {
  initialAgendas: AgendaItem[];
  penugasanList: AssignmentItem[];
}

export default function AgendaClient({ initialAgendas, penugasanList }: Props) {
  const [agendas] = useState<AgendaItem[]>(initialAgendas);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');

  const filtered = agendas.filter(item => {
    if (selectedAssignment !== 'all' && item.assignment.id !== selectedAssignment) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTopic = item.topic.toLowerCase().includes(q);
      const matchClass = item.assignment.class.name.toLowerCase().includes(q);
      const matchSubject = item.assignment.subject.name.toLowerCase().includes(q);
      return matchTopic || matchClass || matchSubject;
    }
    return true;
  });

  const getStatusText = (st: string) => {
    if (st === 'terlaksana') return 'Terlaksana';
    if (st === 'tidak_terlaksana') return 'Tidak Terlaksana';
    return 'Dijadwalkan';
  };

  const activePeriod = penugasanList[0]?.semester || penugasanList[0]?.school_period;

  const handleGenerate = async () => {
    if (!confirm('Generate agenda otomatis dari jadwal untuk semester aktif?')) return;
    setIsGenerating(true);
    setGenMessage('');
    const res = await generateAgendasOtomatis(selectedAssignment === 'all' ? undefined : selectedAssignment);
    setIsGenerating(false);
    if (res.error) {
      alert(`Gagal generate agenda: ${res.error}`);
    } else {
      setGenMessage(`Berhasil membuat ${res.count} agenda dari jadwal!`);
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agenda Mengajar & Presensi</h1>
          <p className="text-sm text-white/60 mt-1">Catat aktivitas pembelajaran harian dan presensi siswa</p>
        </div>
        <div className="flex items-center gap-2">
          {activePeriod && (
            <GlassButton
              variant="secondary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Memproses...' : '⚡ Generate dari Jadwal'}
            </GlassButton>
          )}
        </div>
      </div>

      {genMessage && (
        <div className="glass-panel p-3 rounded-lg border border-emerald-500/30 text-emerald-300 text-sm">
          ✓ {genMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <GlassInput
              placeholder="Cari materi atau kelas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <GlassSelect
              value={selectedAssignment}
              onChange={e => setSelectedAssignment(e.target.value)}
            >
              <option value="all">Semua Penugasan</option>
              {penugasanList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.subject.name} - {p.class.name}
                </option>
              ))}
            </GlassSelect>
          </div>
          <div>
            <GlassSelect
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="dijadwalkan">Dijadwalkan</option>
              <option value="terlaksana">Terlaksana</option>
              <option value="tidak_terlaksana">Tidak Terlaksana</option>
            </GlassSelect>
          </div>
        </div>
      </GlassCard>

      {/* List Agendas */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center text-white/60">
            Tidak ada agenda yang cocok dengan filter.
          </GlassCard>
        ) : (
          filtered.map(item => (
            <GlassCard key={item.id} className="p-5 hover:bg-white/10 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white text-base">{item.topic}</span>
                    <StatusBadge
                      status={getStatusText(item.status)}
                    />
                  </div>
                  <div className="text-sm text-white/70 flex flex-wrap gap-x-4 gap-y-1">
                    <span>📅 {formatTanggal(item.date)}</span>
                    <span>🏫 {item.assignment.class.name}</span>
                    <span>📚 {item.assignment.subject.name} ({item.assignment.subject.code})</span>
                    {item.tp && <span className="text-cyan-300">🎯 {item.tp.code}</span>}
                  </div>
                  {item.activity && (
                    <p className="text-xs text-white/50 line-clamp-1 mt-1">
                      Aktivitas: {item.activity}
                    </p>
                  )}
                  {item.status === 'tidak_terlaksana' && item.not_held_reason && (
                    <p className="text-xs text-rose-300 mt-1">
                      ⚠️ Alasan: {item.not_held_reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Link href={`/agenda/${item.id}`}>
                    <GlassButton variant="primary" size="sm">
                      📝 Presensi & Detail
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

