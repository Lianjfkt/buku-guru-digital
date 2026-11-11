import { z } from 'zod';

export const jadwalSchema = z.object({
  assignment_id: z.string().uuid('ID penugasan tidak valid'),
  day_of_week: z.number().int().min(1, 'Hari minimal 1').max(6, 'Hari maksimal 6'),
  start_period: z.number().int().min(1, 'Jam mulai tidak valid'),
  end_period: z.number().int().min(1, 'Jam selesai tidak valid'),
  room: z.string().max(50, 'Ruangan maksimal 50 karakter').optional().nullable(),
}).refine(data => data.end_period >= data.start_period, {
  message: 'Jam selesai harus lebih besar atau sama dengan jam mulai',
  path: ['end_period'],
});

export type JadwalFormData = z.infer<typeof jadwalSchema>;
