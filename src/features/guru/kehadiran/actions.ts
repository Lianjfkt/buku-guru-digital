'use server';

import { createClient } from '@/lib/supabase/server';
import { generateAttendanceExcel, AttendanceStudentSummary } from '@/lib/export/attendanceExcel';
import { generateAttendancePdf } from '@/lib/export/attendancePdf';
import { cookies } from 'next/headers';
import { MOCK_ASSIGNMENTS, MOCK_STUDENTS, MOCK_SETTINGS } from '@/lib/mockData';

export async function getAttendanceRecap(assignmentId: string) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    const mockRecap: AttendanceStudentSummary[] = MOCK_STUDENTS.map((s, idx) => {
      const hadir = idx === 2 ? 14 : idx === 4 ? 15 : 16;
      const sakit = idx === 2 ? 2 : 0;
      const izin = idx === 4 ? 1 : 0;
      const total = 16;
      const pct = Math.round((hadir / total) * 100);
      return {
        student_id: s.id,
        nis: s.nis,
        nisn: s.nisn,
        full_name: s.full_name,
        gender: s.gender,
        total_meetings: total,
        hadir_count: hadir,
        sakit_count: sakit,
        izin_count: izin,
        alpa_count: 0,
        attendance_percentage: pct,
        needs_attention: pct < MOCK_SETTINGS.attendance_threshold,
      };
    });

    return {
      data: {
        assignment: MOCK_ASSIGNMENTS[0],
        threshold: MOCK_SETTINGS.attendance_threshold,
        schoolName: MOCK_SETTINGS.school_name,
        students: mockRecap,
      },
      error: null,
    };
  }

  // Ambil detail penugasan
  const { data: assignment, error: assError } = await (supabase as any)
    .from('teaching_assignments')
    .select(`
      id,
      subject:subjects ( id, name, code ),
      class:classes ( id, name, grade ),
      semester:semesters ( id, name ),
      teacher:profiles ( id, full_name )
    `)
    .eq('id', assignmentId)
    .single();

  if (assError || !assignment) {
    return { error: 'Penugasan tidak ditemukan', data: null };
  }

  // Panggil rpc get_attendance_summary
  const { data: summary, error: rpcError } = await (supabase as any).rpc('get_attendance_summary', {
    p_assignment_id: assignmentId,
  });

  if (rpcError) {
    return { error: rpcError.message, data: null };
  }

  // Ambil ambang batas kehadiran sekolah (default 75)
  const { data: settings } = await (supabase as any)
    .from('app_settings')
    .select('attendance_threshold, school_name')
    .limit(1)
    .single();

  const threshold = settings?.attendance_threshold ?? 75;
  const schoolName = settings?.school_name ?? 'SMA Negeri 1 Digital';

  // Pemetaan kolom hasil RPC: student_name, total_sessions, total_hadir, total_sakit, total_izin, total_alpa
  const processed: AttendanceStudentSummary[] = (summary || []).map((s: any) => ({
    student_id: s.student_id,
    nis: s.nis,
    nisn: s.nisn,
    full_name: s.student_name,
    gender: s.gender,
    total_meetings: Number(s.total_sessions || 0),
    hadir_count: Number(s.total_hadir || 0),
    sakit_count: Number(s.total_sakit || 0),
    izin_count: Number(s.total_izin || 0),
    alpa_count: Number(s.total_alpa || 0),
    attendance_percentage: Number(s.attendance_percentage || 0),
    needs_attention: Boolean(s.needs_attention),
  }));

  return {
    data: {
      assignment,
      threshold,
      schoolName,
      students: processed,
    },
    error: null,
  };
}

export async function exportAttendanceExcelAction(assignmentId: string) {
  const recap = await getAttendanceRecap(assignmentId);
  if (recap.error || !recap.data) return { error: recap.error || 'Gagal rekap data' };

  const { assignment, threshold, schoolName, students } = recap.data;

  const buffer = await generateAttendanceExcel({
    schoolName,
    subjectName: assignment.subject.name,
    className: assignment.class.name,
    semesterName: assignment.semester.name,
    teacherName: assignment.teacher?.full_name || 'Guru',
    threshold,
    data: students,
  });

  return {
    base64: buffer.toString('base64'),
    filename: `Rekap_Presensi_${assignment.subject.code}_${assignment.class.name}.xlsx`,
  };
}

export async function exportAttendancePdfAction(assignmentId: string) {
  const recap = await getAttendanceRecap(assignmentId);
  if (recap.error || !recap.data) return { error: recap.error || 'Gagal rekap data' };

  const { assignment, threshold, schoolName, students } = recap.data;

  const pdfBytes = generateAttendancePdf({
    schoolName,
    subjectName: assignment.subject.name,
    className: assignment.class.name,
    semesterName: assignment.semester.name,
    teacherName: assignment.teacher?.full_name || 'Guru',
    threshold,
    data: students,
  });

  return {
    base64: Buffer.from(pdfBytes).toString('base64'),
    filename: `Rekap_Presensi_${assignment.subject.code}_${assignment.class.name}.pdf`,
  };
}
