import { z } from 'zod';

export const assessmentSchema = z.object({
  assignment_id: z.string().uuid('ID penugasan tidak valid'),
  name: z.string().min(3, 'Nama asesmen minimal 3 karakter').max(100, 'Nama asesmen maksimal 100 karakter'),
  category: z.enum(['formatif', 'sumatif']),
  assessment_type: z.enum(['SLM', 'SAS', 'SAT', 'lainnya']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  max_score: z.number().min(1, 'Skor maksimal minimal 1').max(100, 'Skor maksimal 100').default(100),
  weight: z.number().min(1, 'Bobot minimal 1').default(1),
  tp_id: z.string().uuid('ID TP tidak valid').optional().nullable(),
});

export const scoreInputSchema = z.object({
  student_id: z.string().uuid('ID siswa tidak valid'),
  raw_score: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
  remedial_score: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(255).optional().nullable(),
});

export const batchScoresSchema = z.object({
  assessment_id: z.string().uuid('ID asesmen tidak valid'),
  scores: z.array(scoreInputSchema).min(1, 'Minimal satu nilai'),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;
export type ScoreInputData = z.infer<typeof scoreInputSchema>;

