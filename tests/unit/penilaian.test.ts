import { describe, it, expect } from 'vitest';
import { assessmentSchema, scoreInputSchema, batchScoresSchema } from '@/features/guru/penilaian/schemas';

describe('Penilaian Schemas', () => {
  it('validates a correct assessment data', () => {
    const valid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Ulangan Harian Bab 1',
      category: 'formatif',
      assessment_type: 'SLM',
      date: '2026-08-20',
      max_score: 100,
      weight: 1,
    };
    const res = assessmentSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects assessment with invalid category or type', () => {
    const invalid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Ulangan Harian Bab 1',
      category: 'ujian_nasional',
      assessment_type: 'UNBK',
      date: '2026-08-20',
    };
    const res = assessmentSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('validates score input range 0-100', () => {
    const validScore = {
      student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      raw_score: 85,
      remedial_score: null,
      notes: 'Bagus sekali',
    };
    expect(scoreInputSchema.safeParse(validScore).success).toBe(true);

    const invalidScore = {
      student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      raw_score: 105,
    };
    expect(scoreInputSchema.safeParse(invalidScore).success).toBe(false);
  });
});

