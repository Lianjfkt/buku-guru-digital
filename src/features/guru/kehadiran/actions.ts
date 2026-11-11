'use server';

import { createClient } from '@/lib/supabase/server';
import { generateAttendanceExcel, AttendanceStudentSummary } from '@/lib/export/attendanceExcel';
import { generateAttendancePdf } from '@/lib/export/attendancePdf';

export async function getAttendanceRecap(assignmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  // Ambil detail penugasan
  const { data: assignment, error: assError } = await (supabase as any)
    .from('teaching_assignments')
    .select(`
      id,
      subject:subjects ( id, name, code ),
      class:classes ( id, name, grade ),
      school_period:school_periods ( id, name ),
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
    .select('attendance_min_percentage, school_name')
    .limit(1)
    .single();

  const threshold = settings?.attendance_min_percentage ?? 75;
  const schoolName = settings?.school_name ?? 'SMA Negeri 1 Digital';

  const processed: AttendanceStudentSummary[] = (summary || []).map((s: any) => ({
    student_id: s.student_id,
    nis: s.nis,
    nisn: s.nisn,
    full_name: s.full_name,
    gender: s.gender,
    total_meetings: Number(s.total_meetings || 0),
    hadir_count: Number(s.hadir_count || 0),
    sakit_count: Number(s.sakit_count || 0),
    izin_count: Number(s.izin_count || 0),
    alpa_count: Number(s.alpa_count || 0),
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
    semesterName: assignment.school_period.name,
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
    semesterName: assignment.school_period.name,
    teacherName: assignment.teacher?.full_name || 'Guru',
    threshold,
    data: students,
  });

  return {
    base64: Buffer.from(pdfBytes).toString('base64'),
    filename: `Rekap_Presensi_${assignment.subject.code}_${assignment.class.name}.pdf`,
  };
}

