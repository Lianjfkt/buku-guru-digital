'use server';

import { createClient } from '@/lib/supabase/server';

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

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getSchoolPeriods() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('school_periods')
    .select('*')
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function lockPeriodAction(periodId: string, lockedUntil: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from('school_periods')
    .update({ locked_until: lockedUntil })
    .eq('id', periodId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function deletePeriodDataAction(periodId: string) {
  const supabase = await createClient();
  // Memanggil database function delete_period_data
  const { error } = await (supabase as any).rpc('delete_period_data', {
    p_period_id: periodId,
  });

  if (error) return { error: error.message };
  return { error: null };
}

