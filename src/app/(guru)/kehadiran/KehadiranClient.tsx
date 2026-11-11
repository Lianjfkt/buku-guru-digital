'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassSelect } from '@/components/ui/GlassSelect';
import { GlassInput } from '@/components/ui/GlassInput';
import { AttendanceStudentSummary } from '@/lib/export/attendanceExcel';
import { exportAttendanceExcelAction, exportAttendancePdfAction } from '@/features/guru/kehadiran/actions';

interface Assignment {
  id: string;
  subject: { id: string; name: string; code: string };
  class: { id: string; name: string; grade: number };
}

interface Props {
  penugasanList: Assignment[];
  initialData: {
    assignment: any;
    threshold: number;
    schoolName: string;
    students: AttendanceStudentSummary[];
  } | null;
  selectedAssignmentId: string;
}

export default function KehadiranClient({
  penugasanList,
  initialData,
  selectedAssignmentId,
}: Props) {
  const [currentAssignmentId, setCurrentAssignmentId] = useState(selectedAssignmentId);
  const [search, setSearch] = useState('');
  const [onlyAttention, setOnlyAttention] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const students = initialData?.students || [];
  const threshold = initialData?.threshold || 75;

  const filteredStudents = students.filter(st => {
    if (onlyAttention && !st.needs_attention) return false;
    if (search) {
      const q = search.toLowerCase();
      return st.full_name.toLowerCase().includes(q) || st.nis.includes(q);
    }
    return true;
  });

  const handleAssignmentChange = (newId: string) => {
    setCurrentAssignmentId(newId);
    window.location.href = `/kehadiran?assignment_id=${newId}`;
  };

  const handleDownloadExcel = async () => {
    if (!currentAssignmentId) return;
    setIsExporting(true);
    try {
      const res = await exportAttendanceExcelAction(currentAssignmentId);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.base64 && res.filename) {
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.base64}`;
        link.download = res.filename;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentAssignmentId) return;
    setIsExporting(true);
    try {
      const res = await exportAttendancePdfAction(currentAssignmentId);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.base64 && res.filename) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${res.base64}`;
        link.download = res.filename;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const attentionCount = students.filter(s => s.needs_attention).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Rekap Kehadiran Siswa</h1>
          <p className="text-sm text-white/60 mt-1">
            Pantau persentase kehadiran dan ekspor laporan formatif per mata pelajaran
          </p>
        </div>

        {initialData && (
          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleDownloadExcel}
              disabled={isExporting}
            >
              📊 Ekspor Excel (.xlsx)
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isExporting}
            >
              📄 Ekspor PDF
            </GlassButton>
          </div>
        )}
      </div>

      {/* Toolbar Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-white/60 block mb-1">Pilih Penugasan Mengajar</label>
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
          </div>

          <div>
            <label className="text-xs text-white/60 block mb-1">Cari Siswa</label>
            <GlassInput
              placeholder="Nama atau NIS siswa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={onlyAttention}
                onChange={e => setOnlyAttention(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-rose-500 focus:ring-rose-500/50"
              />
              <span>Hanya yang di bawah {threshold}% ({attentionCount} siswa)</span>
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Stats Summary Cards */}
      {initialData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="text-xs text-white/60">Total Siswa</div>
            <div className="text-2xl font-bold text-white mt-1">{students.length}</div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="text-xs text-white/60">Total Pertemuan</div>
            <div className="text-2xl font-bold text-white mt-1">
              {students[0]?.total_meetings || 0}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="text-xs text-white/60">Ambang Batas Sekolah</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{threshold}%</div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="text-xs text-white/60">Perlu Perhatian</div>
            <div className={`text-2xl font-bold mt-1 ${attentionCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {attentionCount} Siswa
            </div>
          </GlassCard>
        </div>
      )}

      {/* Table Data */}
      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="py-3 px-3 w-12 text-center">No</th>
              <th className="py-3 px-3 w-28">NIS</th>
              <th className="py-3 px-3">Nama Lengkap Siswa</th>
              <th className="py-3 px-2 w-12 text-center">L/P</th>
              <th className="py-3 px-2 text-center text-emerald-400 w-14">Hadir</th>
              <th className="py-3 px-2 text-center text-blue-400 w-14">Sakit</th>
              <th className="py-3 px-2 text-center text-amber-400 w-14">Izin</th>
              <th className="py-3 px-2 text-center text-rose-400 w-14">Alpa</th>
              <th className="py-3 px-3 text-center w-28">% Kehadiran</th>
              <th className="py-3 px-3 text-center w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-white/40">
                  Tidak ada data siswa.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st, idx) => (
                <tr
                  key={st.student_id}
                  className={`hover:bg-white/[0.03] ${
                    st.needs_attention ? 'bg-rose-500/5' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center text-white/40">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-white/70">{st.nis}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{st.full_name}</td>
                  <td className="py-2.5 px-2 text-center text-white/50">{st.gender}</td>
                  <td className="py-2.5 px-2 text-center font-semibold text-emerald-300">
                    {st.hadir_count}
                  </td>
                  <td className="py-2.5 px-2 text-center text-blue-300">{st.sakit_count}</td>
                  <td className="py-2.5 px-2 text-center text-amber-300">{st.izin_count}</td>
                  <td className="py-2.5 px-2 text-center font-semibold text-rose-300">
                    {st.alpa_count}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span
                      className={
                        st.needs_attention
                          ? 'text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded'
                          : 'text-emerald-300'
                      }
                    >
                      {st.attendance_percentage}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {st.needs_attention ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        ⚠️ Perhatian
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ Baik
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

