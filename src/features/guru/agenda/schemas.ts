import { z } from 'zod';

export const agendaSchema = z.object({
  assignment_id: z.string().uuid('ID penugasan tidak valid'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  topic: z.string().min(3, 'Materi minimal 3 karakter').max(200, 'Materi maksimal 200 karakter'),
  activity: z.string().max(1000, 'Kegiatan maksimal 1000 karakter').optional().nullable(),
  reflection: z.string().max(1000, 'Refleksi maksimal 1000 karakter').optional().nullable(),
  status: z.enum(['Dijadwalkan', 'Terlaksana', 'Tidak Terlaksana']),
  not_held_reason: z.string().max(255).optional().nullable(),
  tp_id: z.string().uuid('ID TP tidak valid').optional().nullable(),
}).refine(data => {
  if (data.status === 'Tidak Terlaksana' && !data.not_held_reason) {
    return false;
  }
  return true;
}, {
  message: 'Alasan tidak terlaksana wajib diisi jika status tidak terlaksana',
  path: ['not_held_reason'],
});

export const attendanceRecordSchema = z.object({
  student_id: z.string().uuid('ID siswa tidak valid'),
  status: z.enum(['hadir', 'sakit', 'izin', 'alpa']),
  notes: z.string().max(255).optional().nullable(),
});

export const batchAttendanceSchema = z.object({
  agenda_id: z.string().uuid('ID agenda tidak valid'),
  records: z.array(attendanceRecordSchema).min(1, 'Minimal satu data presensi'),
});

export type AgendaFormData = z.infer<typeof agendaSchema>;
export type BatchAttendanceData = z.infer<typeof batchAttendanceSchema>;

