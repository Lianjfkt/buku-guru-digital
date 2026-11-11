'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { homeroomNoteSchema } from './schemas';
import { cookies } from 'next/headers';
import {
  MOCK_GURU,
  MOCK_KELAS,
  MOCK_STUDENTS,
  MOCK_ASSIGNMENTS,
  MOCK_ASSESSMENTS,
  MOCK_STUDENT_NOTES,
} from '@/lib/mockData';

export async function getWaliKelasData() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    return {
      data: {
        profile: { id: MOCK_GURU[1].id, full_name: MOCK_GURU[1].full_name },
        classes: [
          {
            ...MOCK_KELAS[0],
            students: MOCK_STUDENTS,
          },
        ],
      },
      error: null,
    };
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profil tidak ditemukan', data: null };

  // Ambil kelas di mana guru ini adalah wali kelas
  const { data: classes, error: classError } = await (supabase as any)
    .from('classes')
    .select(`
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
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    const classData = {
      ...MOCK_KELAS[0],
      students: MOCK_STUDENTS,
    };

    const subjectScores: Record<string, any[]> = {};
    MOCK_ASSIGNMENTS.forEach((a) => {
      subjectScores[a.id] = MOCK_STUDENTS.map((s, idx) => ({
        student_id: s.id,
        student_name: s.full_name,
        nis: s.nis,
        nisn: s.nisn,
        gender: s.gender,
        avg_formative: 80 + (idx % 15),
        avg_summative: 78 + (idx % 18),
        final_score: 79 + (idx % 16),
        passed: (79 + (idx % 16)) >= 75,
      }));
    });

    return {
      data: {
        classData,
        assignments: MOCK_ASSIGNMENTS.map((a: any) => ({
          ...a,
          kktp: a.kktp_default,
        })),
        notes: MOCK_STUDENT_NOTES,
        subjectScores,
      },
      error: null,
    };
  }

  // Ambil detail kelas dan murid
  const { data: classData, error: classError } = await (supabase as any)
    .from('classes')
    .select(`
      id,
      name,
      grade_level,
      students:students ( id, nis, nisn, full_name, gender )
    `)
    .eq('id', classId)
    .single();

  if (classError || !classData) return { error: 'Kelas tidak ditemukan', data: null };

  const studentIds = (classData.students || []).map((s: any) => s.id);

  // Ambil semua mapel & penugasan untuk kelas ini
  const { data: assignments, error: assError } = await (supabase as any)
    .from('teaching_assignments')
    .select(`
      id,
      kktp_default,
      weight_formative,
      weight_summative,
      subject:subjects ( id, name, code ),
      teacher:profiles ( id, full_name )
    `)
    .eq('class_id', classId)
    .is('deleted_at', null);

  if (assError) return { error: assError.message, data: null };

  // Ambil catatan wali kelas untuk siswa di kelas ini
  let notes: any[] = [];
  if (studentIds.length > 0) {
    const { data: notesData } = await (supabase as any)
      .from('student_notes')
      .select('*')
      .in('student_id', studentIds)
      .is('deleted_at', null)
      .order('date', { ascending: false });
    notes = notesData ?? [];
  }

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
      assignments: (assignments || []).map((a: any) => ({
        ...a,
        kktp: a.kktp_default,
      })),
      notes,
      subjectScores,
    },
    error: null,
  };
}

export async function addStudentNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const raw = {
    student_id: formData.get('student_id') as string,
    category: formData.get('category') as string,
    note: formData.get('note') as string,
    date: formData.get('date') as string,
  };

  const parsed = homeroomNoteSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await (supabase as any)
    .from('student_notes')
    .insert({
      student_id: parsed.data.student_id,
      author_id: user.id,
      category: parsed.data.category,
      note: parsed.data.note,
      date: parsed.data.date,
    });

  if (error) return { error: error.message };
  revalidatePath('/wali-kelas');
  return { error: null };
}
