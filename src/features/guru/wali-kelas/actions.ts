'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { homeroomNoteSchema } from './schemas';

export async function getWaliKelasData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single();

  if (!profile) return { error: 'Profil tidak ditemukan', data: null };

  // Ambil kelas di mana guru ini adalah wali kelas
  const { data: classes, error: classError } = await (supabase as any)
    .from('classes')
    .select(`
      id,
      name,
      grade,
      school_period:school_periods ( id, name, is_active ),
      students:students (
        id,
        nis,
        nisn,
        full_name,
        gender
      )
    `)
    .eq('homeroom_teacher_id', profile.id)
    .is('deleted_at', null);

  if (classError) return { error: classError.message, data: null };

  return {
    data: {
      profile,
      classes: classes ?? [],
    },
    error: null,
  };
}

export async function getLegerKelas(classId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  // Ambil detail kelas dan murid
  const { data: classData, error: classError } = await (supabase as any)
    .from('classes')
    .select(`
      id,
      name,
      grade,
      school_period:school_periods ( id, name ),
      students:students ( id, nis, nisn, full_name, gender )
    `)
    .eq('id', classId)
    .single();

  if (classError || !classData) return { error: 'Kelas tidak ditemukan', data: null };

  // Ambil semua mapel & penugasan untuk kelas ini
  const { data: assignments, error: assError } = await (supabase as any)
    .from('teaching_assignments')
    .select(`
      id,
      kktp,
      weight_formative,
      weight_summative,
      subject:subjects ( id, name, code ),
      teacher:profiles ( id, full_name )
    `)
    .eq('class_id', classId)
    .is('deleted_at', null);

  if (assError) return { error: assError.message, data: null };

  // Ambil catatan wali kelas
  const { data: notes } = await (supabase as any)
    .from('student_notes')
    .select('*')
    .eq('class_id', classId)
    .is('deleted_at', null)
    .order('date', { ascending: false });

  // Ambil rekap nilai tiap penugasan
  const subjectScores: Record<string, any[]> = {};
  for (const a of assignments || []) {
    const { data: sSummary } = await (supabase as any).rpc('get_scores_summary', {
      p_assignment_id: a.id,
    });
    subjectScores[a.id] = sSummary || [];
  }

  return {
    data: {
      classData,
      assignments: assignments || [],
      notes: notes || [],
      subjectScores,
    },
    error: null,
  };
}

export async function addStudentNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const raw = {
    class_id: formData.get('class_id') as string,
    student_id: formData.get('student_id') as string,
    category: formData.get('category') as string,
    note: formData.get('note') as string,
    follow_up: (formData.get('follow_up') as string) || null,
    date: formData.get('date') as string,
  };

  const parsed = homeroomNoteSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await (supabase as any)
    .from('student_notes')
    .insert({
      ...parsed.data,
      teacher_id: profile?.id,
    });

  if (error) return { error: error.message };
  revalidatePath('/wali-kelas');
  return { error: null };
}

