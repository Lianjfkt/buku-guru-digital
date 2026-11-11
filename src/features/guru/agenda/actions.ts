'use server';

import { createClient } from '@/lib/supabase/server';
import { agendaSchema, batchAttendanceSchema } from './schemas';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { MOCK_AGENDAS, MOCK_ATTENDANCES } from '@/lib/mockData';

export async function getAgendas(assignmentId?: string) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    return { data: MOCK_AGENDAS, error: null };
  }

  let query = (supabase as any)
    .from('agendas')
    .select(`
      id,
      date,
      topic,
      activity,
      reflection,
      status,
      not_held_reason,
      assignment:teaching_assignments (
        id,
        subject:subjects ( id, name, code ),
        class:classes ( id, name, grade_level )
      ),
      tp:learning_objectives ( id, code, description )
    `)
    .is('deleted_at', null)
    .order('date', { ascending: false });

  if (assignmentId) {
    query = query.eq('assignment_id', assignmentId);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) return { data: MOCK_AGENDAS, error: null };
  return { data, error: null };
}

export async function getAgendaDetail(id: string) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    const ag = MOCK_AGENDAS.find(a => a.id === id) || MOCK_AGENDAS[0];
    return {
      data: {
        ...ag,
        attendance: MOCK_ATTENDANCES,
      },
      error: null,
    };
  }

  const { data: agenda, error: agendaError } = await (supabase as any)
    .from('agendas')
    .select(`
      id,
      date,
      topic,
      activity,
      reflection,
      status,
      not_held_reason,
      assignment_id,
      assignment:teaching_assignments (
        id,
        subject:subjects ( id, name, code ),
        class:classes (
          id,
          name,
          grade_level,
          students:students (
            id,
            nis,
            nisn,
            full_name,
            gender
          )
        )
      ),
      tp:learning_objectives ( id, code, description )
    `)
    .eq('id', id)
    .single();

  if (agendaError || !agenda) {
    return { error: agendaError?.message ?? 'Agenda tidak ditemukan', data: null };
  }

  // Ambil presensi yang sudah ada
  const { data: attendance } = await (supabase as any)
    .from('attendances')
    .select('student_id, status, note')
    .eq('agenda_id', id);

  return {
    data: {
      ...agenda,
      attendance: attendance ?? [],
    },
    error: null,
  };
}

export async function simpanAgenda(formData: FormData, id?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const raw = {
    assignment_id: formData.get('assignment_id') as string,
    date: formData.get('date') as string,
    topic: formData.get('topic') as string,
    activity: (formData.get('activity') as string) || null,
    reflection: (formData.get('reflection') as string) || null,
    status: formData.get('status') as string,
    not_held_reason: (formData.get('not_held_reason') as string) || null,
    tp_id: (formData.get('tp_id') as string) || null,
  };

  const parsed = agendaSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (id) {
    const { error } = await (supabase as any)
      .from('agendas')
      .update(parsed.data)
      .eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await (supabase as any)
      .from('agendas')
      .insert(parsed.data);
    if (error) return { error: error.message };
  }

  revalidatePath('/agenda');
  return { error: null };
}

export async function simpanPresensi(agendaId: string, records: Array<{ student_id: string; status: 'hadir' | 'sakit' | 'izin' | 'alpa'; notes?: string }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const parsed = batchAttendanceSchema.safeParse({
    agenda_id: agendaId,
    records,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Upsert attendance records
  const payload = parsed.data.records.map(r => ({
    agenda_id: agendaId,
    student_id: r.student_id,
    status: r.status,
    note: r.notes || null,
  }));

  const { error } = await (supabase as any)
    .from('attendances')
    .upsert(payload, { onConflict: 'agenda_id,student_id' });

  if (error) return { error: error.message };

  // Update status agenda jadi 'Terlaksana' jika sebelumnya 'Dijadwalkan'
  await (supabase as any)
    .from('agendas')
    .update({ status: 'Terlaksana' })
    .eq('id', agendaId)
    .eq('status', 'Dijadwalkan');

  revalidatePath(`/agenda/${agendaId}`);
  revalidatePath('/agenda');
  return { error: null };
}

export async function generateAgendasOtomatis(assignmentId?: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', count: 0 };

  // Ambil semester aktif
  const { data: activeSemester } = await (supabase as any)
    .from('semesters')
    .select('id, start_date, end_date')
    .eq('is_active', true)
    .single();

  const start = startDate || activeSemester?.start_date || new Date().toISOString().split('T')[0];
  const end = endDate || activeSemester?.end_date || new Date().toISOString().split('T')[0];

  let assignmentIds: string[] = [];
  if (assignmentId && assignmentId !== 'all') {
    assignmentIds = [assignmentId];
  } else {
    const { data: assignments } = await (supabase as any)
      .from('teaching_assignments')
      .select('id')
      .eq('teacher_id', user.id)
      .is('deleted_at', null);
    assignmentIds = (assignments || []).map((a: any) => a.id);
  }

  if (assignmentIds.length === 0) {
    return { error: 'Tidak ada penugasan yang ditemukan', count: 0 };
  }

  let totalCreated = 0;
  for (const aId of assignmentIds) {
    const { data, error } = await (supabase as any).rpc('generate_agendas_from_schedule', {
      p_assignment_id: aId,
      p_start_date: start,
      p_end_date: end,
    });
    if (!error && data && data.length > 0) {
      totalCreated += data[0].created_count || 0;
    }
  }

  revalidatePath('/agenda');
  return { error: null, count: totalCreated };
}
