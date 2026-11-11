'use server';

import { createClient } from '@/lib/supabase/server';
import { MOCK_AUDIT_LOGS, MOCK_SEMESTER } from '@/lib/mockData';

export async function getAuditLogs() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('audit_logs')
    .select(`
      id,
      table_name,
      operation,
      record_id,
      old_data,
      new_data,
      created_at,
      user:profiles ( id, full_name, role )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data || data.length === 0) return { data: MOCK_AUDIT_LOGS, error: null };
  return { data, error: null };
}

export async function getSchoolPeriods() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('semesters')
    .select(`
      id,
      name,
      start_date,
      end_date,
      is_active,
      locked_until,
      academic_year:academic_years ( id, year, is_archived )
    `)
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error || !data || data.length === 0) return { data: [MOCK_SEMESTER], error: null };
  return { data, error: null };
}

export async function lockPeriodAction(periodId: string, lockedUntil: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from('semesters')
    .update({ locked_until: lockedUntil })
    .eq('id', periodId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function deletePeriodDataAction(periodId: string, confirmationName: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any).rpc('delete_period_data', {
    p_semester_id: periodId,
    p_confirmation_name: confirmationName,
  });

  if (error) return { error: error.message };
  return { error: null };
}
