'use server';

import { createClient } from '@/lib/supabase/server';
import { agendaSchema, batchAttendanceSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getAgendas(assignmentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  let query = (supabase as any)
    .from('teaching_agendas')
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
        class:classes ( id, name, grade )
      ),
      tp:learning_objectives ( id, code, description )
    `)
    .is('deleted_at', null)
    .order('date', { ascending: false });

  if (assignmentId) {
    query = query.eq('assignment_id', assignmentId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getAgendaDetail(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data: agenda, error: agendaError } = await (supabase as any)
    .from('teaching_agendas')
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
          grade,
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
    .from('attendance')
    .select('student_id, status, notes')
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
      .from('teaching_agendas')
      .update(parsed.data)
      .eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await (supabase as any)
      .from('teaching_agendas')
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
    notes: r.notes || null,
  }));

  const { error } = await (supabase as any)
    .from('attendance')
    .upsert(payload, { onConflict: 'agenda_id,student_id' });

  if (error) return { error: error.message };

  // Update status agenda jadi 'terlaksana' jika sebelumnya 'dijadwalkan'
  await (supabase as any)
    .from('teaching_agendas')
    .update({ status: 'terlaksana' })
    .eq('id', agendaId)
    .eq('status', 'dijadwalkan');

  revalidatePath(`/agenda/${agendaId}`);
  revalidatePath('/agenda');
  return { error: null };
}

export async function generateAgendasOtomatis(periodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const { data, error } = await (supabase as any).rpc('generate_agendas_from_schedule', {
    p_period_id: periodId,
  });

  if (error) return { error: error.message, count: 0 };
  revalidatePath('/agenda');
  return { error: null, count: data };
}

