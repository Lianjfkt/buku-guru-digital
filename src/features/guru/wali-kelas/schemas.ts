import { z } from 'zod';

export const homeroomNoteSchema = z.object({
  student_id: z.string().uuid('ID siswa tidak valid'),
  category: z.enum(['akademik', 'sikap', 'perilaku', 'prestasi']),
  note: z.string().min(5, 'Catatan minimal 5 karakter').max(1000, 'Catatan maksimal 1000 karakter'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
});

export type HomeroomNoteFormData = z.infer<typeof homeroomNoteSchema>;
