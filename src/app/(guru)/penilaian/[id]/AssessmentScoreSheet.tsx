'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { formatTanggal } from '@/lib/utils';
import { saveAssessmentScores } from '@/features/guru/penilaian/actions';
import { calculateFinalScore, getAchievementLevel } from '@/lib/calculations';

interface Student {
  id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string;
}

interface AssessmentDetail {
  id: string;
  title: string;
  category: 'formatif' | 'sumatif';
  type: string;
  date: string;
  max_score: number;
  assignment_id: string;
  remedial_max_rule: 'kktp' | 'actual';
  assignment: {
    id: string;
    kktp_default: number;
    weight_formative: number;
    weight_summative: number;
    subject: { id: string; name: string; code: string };
    class: {
      id: string;
      name: string;
      grade: number;
      students: Student[];
    };
  };
  tp?: { id: string; code: string; description: string } | null;
  scores: Array<{
    student_id: string;
    score: number;
    remedial_score: number | null;
    note: string | null;
  }>;
}

interface Props {
  assessment: AssessmentDetail;
}

export default function AssessmentScoreSheet({ assessment }: Props) {
  const students = assessment.assignment.class.students || [];
  const kktp = assessment.assignment.kktp_default;
  const remedialRule = assessment.remedial_max_rule || 'kktp';

  // Map student_id -> { score, remedial_score, note }
  const [scoresMap, setScoresMap] = useState<
    Record<string, { score: string; remedial_score: string; note: string }>
  >(() => {
    const map: Record<string, { score: string; remedial_score: string; note: string }> = {};
    assessment.scores.forEach(s => {
      map[s.student_id] = {
        score: s.score !== undefined && s.score !== null ? String(s.score) : '',
        remedial_score:
          s.remedial_score !== undefined && s.remedial_score !== null
            ? String(s.remedial_score)
            : '',
        note: s.note || '',
      };
    });
    return map;
  });

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleScoreChange = (
    studentId: string,
    field: 'score' | 'remedial_score' | 'note',
    val: string
  ) => {
    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { score: '', remedial_score: '', note: '' }),
        [field]: val,
      },
    }));
  };

  const handleSaveAll = async () => {
    setMessage(null);
    const payload: Array<{
      student_id: string;
      score: number;
      remedial_score?: number | null;
      note?: string | null;
    }> = [];

    for (const [student_id, val] of Object.entries(scoresMap)) {
      if (val.score.trim() === '') continue; // lewati yang kosong
      const raw = Number(val.score);
      const rem = val.remedial_score.trim() !== '' ? Number(val.remedial_score) : null;
      payload.push({
        student_id,
        score: raw,
        remedial_score: rem,
        note: val.note || null,
      });
    }

    if (payload.length === 0) {
      setMessage({ text: 'Belum ada nilai yang diinput.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const res = await saveAssessmentScores(
        assessment.id,
        kktp,
        remedialRule,
        payload
      );
      if (res.error) {
        setMessage({ text: `Gagal menyimpan nilai: ${res.error}`, type: 'error' });
      } else {
        setMessage({ text: `Berhasil menyimpan ${payload.length} nilai siswa!`, type: 'success' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/penilaian?assignment_id=${assessment.assignment_id}`}
            className="text-xs text-white/50 hover:text-white mb-1 inline-block"
          >
            ← Kembali ke Asesmen {assessment.assignment.subject.name}
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {assessment.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mt-1">
            <span>📅 {formatTanggal(assessment.date)}</span>
            <span>🏫 {assessment.assignment.class.name}</span>
            <span>
              Kategori:{' '}
              <strong className="text-white uppercase">{assessment.category}</strong>
            </span>
            <span>
              KKTP: <strong className="text-emerald-400">{kktp}</strong>
            </span>
            <span>
              Aturan Remedi:{' '}
              <strong className="text-blue-400">
                {remedialRule === 'kktp' ? 'Maksimal KKTP' : 'Nilai Asli'}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            onClick={handleSaveAll}
            disabled={isPending}
          >
            {isPending ? 'Menyimpan...' : '💾 Simpan Semua Nilai'}
          </GlassButton>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Spreadsheet Grid */}
      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="py-2.5 px-2 w-10 text-center">No</th>
              <th className="py-2.5 px-3 w-24">NIS</th>
              <th className="py-2.5 px-3 min-w-[180px]">Nama Siswa</th>
              <th className="py-2.5 px-2 text-center w-28">Nilai Awal</th>
              <th className="py-2.5 px-2 text-center w-28">Nilai Remedi</th>
              <th className="py-2.5 px-2 text-center w-24">Nilai Akhir</th>
              <th className="py-2.5 px-3 text-center w-36">Capaian TP</th>
              <th className="py-2.5 px-3 min-w-[160px]">Catatan / Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((st, idx) => {
              const current = scoresMap[st.id] || { score: '', remedial_score: '', note: '' };
              const rawNum = current.score !== '' ? Number(current.score) : null;
              const remNum = current.remedial_score !== '' ? Number(current.remedial_score) : null;

              const finalScore =
                rawNum !== null
                  ? calculateFinalScore(rawNum, remNum, kktp, remedialRule)
                  : null;

              const level = finalScore !== null ? getAchievementLevel(finalScore, kktp) : null;
              const isUnderKKTP = rawNum !== null && rawNum < kktp;

              return (
                <tr key={st.id} className="hover:bg-white/[0.03]">
                  <td className="py-2.5 px-2 text-center text-white/40">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-white/60">{st.nis}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{st.full_name}</td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={assessment.max_score}
                      value={current.score}
                      onChange={e => handleScoreChange(st.id, 'score', e.target.value)}
                      placeholder="0-100"
                      className={`w-20 text-center py-1 px-2 rounded bg-white/5 border text-xs focus:outline-none focus:border-white/40 font-semibold ${
                        isUnderKKTP ? 'border-rose-500/50 text-rose-300' : 'border-white/10 text-white'
                      }`}
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={assessment.max_score}
                      disabled={!isUnderKKTP && !current.remedial_score}
                      value={current.remedial_score}
                      onChange={e => handleScoreChange(st.id, 'remedial_score', e.target.value)}                      placeholder={isUnderKKTP ? 'Remedi' : '-'}
                      className={`w-20 text-center py-1 px-2 rounded bg-white/5 border text-xs focus:outline-none focus:border-white/40 font-semibold ${
                        !isUnderKKTP && !current.remedial_score
                          ? 'opacity-40 cursor-not-allowed border-transparent'
                          : 'border-blue-500/50 text-blue-300'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold">
                    {finalScore !== null ? (
                      <span className={finalScore < kktp ? 'text-rose-400' : 'text-emerald-400'}>
                        {finalScore}
                      </span>
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {level ? (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          level.variant === 'success'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : level.variant === 'primary'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : level.variant === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {level.level}
                      </span>
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={current.note}
                      onChange={e => handleScoreChange(st.id, 'note', e.target.value)}
                      placeholder="Catatan perkembangan..."
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

