import { z } from 'zod';

export const homeroomNoteSchema = z.object({
  class_id: z.string().uuid('ID kelas tidak valid'),
  student_id: z.string().uuid('ID siswa tidak valid'),
  category: z.enum(['akademik', 'karakter', 'kehadiran', 'ekskul', 'prestasi', 'lainnya']),
  note: z.string().min(5, 'Catatan minimal 5 karakter').max(1000, 'Catatan maksimal 1000 karakter'),
  follow_up: z.string().max(1000).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
});

export type HomeroomNoteFormData = z.infer<typeof homeroomNoteSchema>;

