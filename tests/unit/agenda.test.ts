import { describe, it, expect } from 'vitest';
import { agendaSchema, attendanceRecordSchema, batchAttendanceSchema } from '@/features/guru/agenda/schemas';

describe('Agenda & Presensi Schemas', () => {
  it('validates a valid agenda data', () => {
    const valid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '2026-08-10',
      topic: 'Pengantar Aljabar Linear',
      activity: 'Diskusi kelompok dan pemecahan masalah',
      reflection: 'Siswa antusias dan memahami konsep dasar',
      status: 'Terlaksana',
    };
    const res = agendaSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('requires not_held_reason when status is tidak_terlaksana', () => {
    const invalid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '2026-08-10',
      topic: 'Pengantar Aljabar Linear',
      status: 'Tidak Terlaksana',
      not_held_reason: null,
    };
    const res = agendaSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('validates attendance record and batch submission', () => {
    const record = {
      student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      status: 'hadir',
      notes: null,
    };
    expect(attendanceRecordSchema.safeParse(record).success).toBe(true);

    const batch = {
      agenda_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      records: [record],
    };
    expect(batchAttendanceSchema.safeParse(batch).success).toBe(true);
  });

  it('rejects invalid attendance status', () => {
    const invalid = {
      student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      status: 'bolosan',
    };
    expect(attendanceRecordSchema.safeParse(invalid).success).toBe(false);
  });
});

