'use server';

import { createClient } from '@/lib/supabase/server';
import { jadwalSchema } from './schemas';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { MOCK_SCHEDULES, MOCK_ASSIGNMENTS, MOCK_SCHOOL_PERIODS } from '@/lib/mockData';

export async function getJadwalGuru() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    return { data: MOCK_SCHEDULES, error: null };
  }

  const { data, error } = await (supabase as any)
    .from('schedules')
    .select(`
      id,
      day_of_week,
      start_period,
      end_period,
      room,
      assignment:teaching_assignments (
        id,
        subject:subjects ( id, name, code ),
        class:classes ( id, name, grade_level ),
        semester:semesters ( id, name, is_active )
      )
    `)
    .is('deleted_at', null)
    .order('day_of_week')
    .order('start_period');

  if (error || !data || data.length === 0) return { data: MOCK_SCHEDULES, error: null };
  return { data, error: null };
}

export async function getPenugasanGuru() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    return { data: MOCK_ASSIGNMENTS, error: null };
  }

  const { data, error } = await (supabase as any)
    .from('teaching_assignments')
    .select(`
      id,
      subject:subjects ( id, name, code ),
      class:classes ( id, name, grade_level ),
      semester:semesters ( id, name, is_active )
    `)
    .eq('teacher_id', user.id)
    .is('deleted_at', null);

  if (error || !data || data.length === 0) return { data: MOCK_ASSIGNMENTS, error: null };
  return { data, error: null };
}

export async function getJamPelajaran() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('school_periods')
    .select('*')
    .is('deleted_at', null)
    .order('period_number');
  if (error || !data || data.length === 0) return { data: MOCK_SCHOOL_PERIODS, error: null };
  return { data, error: null };
}

export async function tambahJadwal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const raw = {
    assignment_id: formData.get('assignment_id') as string,
    day_of_week: parseInt(formData.get('day_of_week') as string),
    start_period: parseInt(formData.get('start_period') as string),
    end_period: parseInt(formData.get('end_period') as string),
    room: (formData.get('room') as string) || null,
  };

  const parsed = jadwalSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Ambil teacher_id dan semester_id dari teaching_assignment
  const { data: assignment, error: assErr } = await (supabase as any)
    .from('teaching_assignments')
    .select('teacher_id, semester_id')
    .eq('id', parsed.data.assignment_id)
    .single();

  if (assErr || !assignment) return { error: 'Penugasan tidak ditemukan' };

  // Cek konflik jadwal guru
  const { data: conflict } = await (supabase as any).rpc('detect_teacher_schedule_conflict', {
    p_teacher_id: assignment.teacher_id,
    p_day_of_week: parsed.data.day_of_week,
    p_start_period: parsed.data.start_period,
    p_end_period: parsed.data.end_period,
    p_semester_id: assignment.semester_id,
    p_exclude_schedule_id: null,
  });

  if (conflict && conflict.length > 0) {
    return { error: `Konflik jadwal: ${conflict[0].conflict_reason}` };
  }

  const { error } = await (supabase as any)
    .from('schedules')
    .insert(parsed.data);

  if (error) return { error: error.message };
  revalidatePath('/jadwal');
  return { error: null };
}

export async function ubahJadwal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const raw = {
    assignment_id: formData.get('assignment_id') as string,
    day_of_week: parseInt(formData.get('day_of_week') as string),
    start_period: parseInt(formData.get('start_period') as string),
    end_period: parseInt(formData.get('end_period') as string),
    room: (formData.get('room') as string) || null,
  };

  const parsed = jadwalSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Ambil teacher_id dan semester_id dari teaching_assignment
  const { data: assignment, error: assErr } = await (supabase as any)
    .from('teaching_assignments')
    .select('teacher_id, semester_id')
    .eq('id', parsed.data.assignment_id)
    .single();

  if (assErr || !assignment) return { error: 'Penugasan tidak ditemukan' };

  // Cek konflik (kecuali jadwal ini sendiri)
  const { data: conflict } = await (supabase as any).rpc('detect_teacher_schedule_conflict', {
    p_teacher_id: assignment.teacher_id,
    p_day_of_week: parsed.data.day_of_week,
    p_start_period: parsed.data.start_period,
    p_end_period: parsed.data.end_period,
    p_semester_id: assignment.semester_id,
    p_exclude_schedule_id: id,
  });

  if (conflict && conflict.length > 0) {
    return { error: `Konflik jadwal: ${conflict[0].conflict_reason}` };
  }

  const { error } = await (supabase as any)
    .from('schedules')
    .update(parsed.data)
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/jadwal');
  return { error: null };
}

export async function hapusJadwal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const { error } = await (supabase as any)
    .from('schedules')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/jadwal');
  return { error: null };
}
