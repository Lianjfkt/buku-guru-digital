'use server';

import { createClient } from '@/lib/supabase/server';
import { assessmentSchema, batchScoresSchema } from './schemas';
import { calculateFinalScore } from '@/lib/calculations';
import { revalidatePath } from 'next/cache';

export async function getAssessments(assignmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data, error } = await (supabase as any)
    .from('assessments')
    .select(`
      id,
      name,
      category,
      assessment_type,
      date,
      max_score,
      weight,
      tp:learning_objectives ( id, code, description )
    `)
    .eq('assignment_id', assignmentId)
    .is('deleted_at', null)
    .order('date', { ascending: true });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getAssessmentDetail(assessmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi', data: null };

  const { data: assessment, error: assError } = await (supabase as any)
    .from('assessments')
    .select(`
      id,
      name,
      category,
      assessment_type,
      date,
      max_score,
      weight,
      assignment_id,
      assignment:teaching_assignments (
        id,
        kktp,
        weight_formative,
        weight_summative,
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
    .eq('id', assessmentId)
    .single();

  if (assError || !assessment) {
    return { error: 'Asesmen tidak ditemukan', data: null };
  }

  // Ambil nilai yang sudah ada
  const { data: scores } = await (supabase as any)
    .from('scores')
    .select('student_id, raw_score, remedial_score, final_score, notes')
    .eq('assessment_id', assessmentId);

  // Ambil setting remedi cap dari app_settings
  const { data: settings } = await (supabase as any)
    .from('app_settings')
    .select('remedial_max_rule')
    .limit(1)
    .single();

  return {
    data: {
      ...assessment,
      scores: scores ?? [],
      remedial_max_rule: settings?.remedial_max_rule ?? 'kktp',
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
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    assessment_type: formData.get('assessment_type') as string,
    date: formData.get('date') as string,
    max_score: Number(formData.get('max_score') || 100),
    weight: Number(formData.get('weight') || 1),
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
    raw_score: number;
    remedial_score?: number | null;
    notes?: string | null;
  }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  const parsed = batchScoresSchema.safeParse({
    assessment_id: assessmentId,
    scores,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const payload = parsed.data.scores.map(s => {
    const finalScore = calculateFinalScore(
      s.raw_score,
      s.remedial_score,
      assignmentKktp,
      remedialRule
    );

    return {
      assessment_id: assessmentId,
      student_id: s.student_id,
      raw_score: s.raw_score,
      remedial_score: s.remedial_score ?? null,
      final_score: finalScore,
      notes: s.notes ?? null,
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

