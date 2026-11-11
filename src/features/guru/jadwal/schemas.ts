import { z } from 'zod';

export const jadwalSchema = z.object({
  assignment_id: z.string().uuid('ID penugasan tidak valid'),
  day_of_week: z.number().int().min(1, 'Hari minimal 1').max(6, 'Hari maksimal 6'),
  period_id: z.string().uuid('ID jam pelajaran tidak valid'),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid').optional().nullable(),
  room: z.string().max(50, 'Ruangan maksimal 50 karakter').optional().nullable(),
});

export type JadwalFormData = z.infer<typeof jadwalSchema>;

