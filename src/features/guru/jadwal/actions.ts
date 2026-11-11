'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jadwalSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getJadwalGuru() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data, error } = await (supabase as any)
    .from('schedules')
    .select(`
      id,
      day_of_week,
      effective_date,
      end_date,
      room,
      assignment:teaching_assignments (
        id,
        subject:subjects ( id, name, code ),
        class:classes ( id, name, grade ),
        school_period:school_periods ( id, name )
      ),
      period:school_periods_time (
        id,
        period_number,
        start_time,
        end_time,
        is_break
      )
    `)
    .eq('deleted_at', null)
    .order('day_of_week')
    .order('period_id');

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getPenugasanGuru() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return { error: 'Profil tidak ditemukan', data: null };

  const { data, error } = await (supabase as any)
    .from('teaching_assignments')
    .select(`
      id,
      subject:subjects ( id, name, code ),
      class:classes ( id, name, grade ),
      school_period:school_periods ( id, name, is_active )
    `)
    .eq('teacher_id', profile.id)
    .is('deleted_at', null);

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getJamPelajaran() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('school_periods_time')
    .select('*')
    .is('deleted_at', null)
    .order('period_number');
  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function tambahJadwal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const raw = {
    assignment_id: formData.get('assignment_id') as string,
    day_of_week: parseInt(formData.get('day_of_week') as string),
    period_id: formData.get('period_id') as string,
    effective_date: formData.get('effective_date') as string,
    end_date: (formData.get('end_date') as string) || null,
    room: (formData.get('room') as string) || null,
  };

  const parsed = jadwalSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Cek konflik jadwal guru
  const { data: conflict } = await (supabase as any).rpc('detect_teacher_schedule_conflict', {
    p_assignment_id: parsed.data.assignment_id,
    p_day_of_week: parsed.data.day_of_week,
    p_period_id: parsed.data.period_id,
    p_effective_date: parsed.data.effective_date,
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
    period_id: formData.get('period_id') as string,
    effective_date: formData.get('effective_date') as string,
    end_date: (formData.get('end_date') as string) || null,
    room: (formData.get('room') as string) || null,
  };

  const parsed = jadwalSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Cek konflik (kecuali jadwal ini sendiri)
  const { data: conflict } = await (supabase as any).rpc('detect_teacher_schedule_conflict', {
    p_assignment_id: parsed.data.assignment_id,
    p_day_of_week: parsed.data.day_of_week,
    p_period_id: parsed.data.period_id,
    p_effective_date: parsed.data.effective_date,
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

