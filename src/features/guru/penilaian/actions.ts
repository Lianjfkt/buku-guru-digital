'use server';

import { createClient } from '@/lib/supabase/server';
import { assessmentSchema, batchScoresSchema } from './schemas';
import { calculateFinalScore } from '@/lib/calculations';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { MOCK_ASSESSMENTS } from '@/lib/mockData';

export async function getAssessments(assignmentId: string) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    return { data: MOCK_ASSESSMENTS, error: null };
  }

  const { data, error } = await (supabase as any)
    .from('assessments')
    .select(`
      id,
      title,
      category,
      type,
      date,
      max_score,
      tp:learning_objectives ( id, code, description )
    `)
    .eq('assignment_id', assignmentId)
    .is('deleted_at', null)
    .order('date', { ascending: true });

  if (error || !data || data.length === 0) return { data: MOCK_ASSESSMENTS, error: null };
  return { data, error: null };
}

export async function getAssessmentDetail(assessmentId: string) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_role')?.value === 'guru';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemo) return { error: 'Tidak terautentikasi', data: null };

  if (isDemo || !user) {
    const ass = MOCK_ASSESSMENTS.find(a => a.id === assessmentId) || MOCK_ASSESSMENTS[0];
    return { data: ass, error: null };
  }

  const { data: assessment, error: assError } = await (supabase as any)
    .from('assessments')
    .select(`
      id,
      title,
      category,
      type,
      date,
      max_score,
      assignment_id,
      assignment:teaching_assignments (
        id,
        kktp_default,
        weight_formative,
        weight_summative,
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
    .eq('id', assessmentId)
    .single();

  if (assError || !assessment) {
    return { error: 'Asesmen tidak ditemukan', data: null };
  }

  // Ambil nilai yang sudah ada
  const { data: scores } = await (supabase as any)
    .from('scores')
    .select('student_id, score, remedial_score, note')
    .eq('assessment_id', assessmentId);

  // Ambil setting remedi cap dari app_settings
  const { data: settings } = await (supabase as any)
    .from('app_settings')
    .select('remedial_max_score')
    .limit(1)
    .single();

  return {
    data: {
      ...assessment,
      scores: scores ?? [],
      remedial_max_rule: settings?.remedial_max_score ?? 'kktp',
    },
    error: null,
  };
}

export async function createAssessment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const raw = {
    assignment_id: formData.get('assignment_id') as string,
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    type: formData.get('type') as string,
    date: formData.get('date') as string,
    max_score: Number(formData.get('max_score') || 100),
    tp_id: (formData.get('tp_id') as string) || null,
  };

  const parsed = assessmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await (supabase as any)
    .from('assessments')
    .insert(parsed.data);

  if (error) return { error: error.message };
  revalidatePath('/penilaian');
  return { error: null };
}

export async function saveAssessmentScores(
  assessmentId: string,
  assignmentKktp: number,
  remedialRule: 'kktp' | 'actual',
  scores: Array<{
    student_id: string;
    score: number;
    remedial_score?: number | null;
    note?: string | null;
  }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const parsed = batchScoresSchema.safeParse({
    assessment_id: assessmentId,
    scores,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };;

  const payload = parsed.data.scores.map(s => {
    return {
      assessment_id: assessmentId,
      student_id: s.student_id,
      score: s.score,
      remedial_score: s.remedial_score ?? null,
      note: s.note ?? null,
    };
  });

  const { error } = await (supabase as any)
    .from('scores')
    .upsert(payload, { onConflict: 'assessment_id,student_id' });

  if (error) return { error: error.message };
  revalidatePath(`/penilaian/${assessmentId}`);
  revalidatePath('/penilaian');
  return { error: null };
}

export async function getScoresRecap(assignmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data: summary, error } = await (supabase as any).rpc('get_scores_summary', {
    p_assignment_id: assignmentId,
  });

  if (error) return { error: error.message, data: null };
  return { data: summary, error: null };
}
