import { describe, it, expect } from 'vitest';
import { jadwalSchema } from '@/features/guru/jadwal/schemas';

describe('Jadwal Schemas', () => {
  it('validates correct schedule data', () => {
    const valid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      day_of_week: 1, // Senin
      start_period: 1,
      end_period: 3,
      room: 'Ruang 10A',
    };
    const res = jadwalSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid day of week', () => {
    const invalid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      day_of_week: 7, // Minggu tidak valid (1-6)
      start_period: 1,
      end_period: 2,
    };
    const res = jadwalSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects non-uuid ids', () => {
    const invalid = {
      assignment_id: 'not-a-uuid',
      day_of_week: 1,
      start_period: 1,
      end_period: 2,
    };
    const res = jadwalSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects end_period earlier than start_period', () => {
    const invalid = {
      assignment_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      day_of_week: 1,
      start_period: 4,
      end_period: 2,
    };
    const res = jadwalSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
