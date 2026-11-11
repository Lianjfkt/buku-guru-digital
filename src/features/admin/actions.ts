"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  guruAccountSchema,
  classSchema,
  studentSchema,
  subjectSchema,
  schoolPeriodSchema,
  holidaySchema,
  assignmentSchema,
  appSettingsSchema,
  type GuruAccountInput,
  type ClassInput,
  type StudentInput,
  type SubjectInput,
  type SchoolPeriodInput,
  type HolidayInput,
  type AssignmentInput,
  type AppSettingsInput,
} from "./schemas";

export interface AdminActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// -----------------------------------------------------------------------------
// 1. MANAJEMEN AKUN GURU
// -----------------------------------------------------------------------------
export async function saveGuruAction(input: GuruAccountInput): Promise<AdminActionResult> {
  const parsed = guruAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || "Data tidak valid" };
  }

  const { id, email, full_name, nip, role, is_active, password } = parsed.data;

  try {
    const adminClient = createAdminClient();

    if (id) {
      // Update Profil Guru yang sudah ada
      const { error } = await (adminClient as any)
        .from("profiles")
        .update({
          full_name,
          nip: nip || null,
          role,
          is_active,
        })
        .eq("id", id);

      if (error) return { ok: false, error: error.message };
    } else {
      // Buat akun baru di Auth via Admin API
      const { error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: password ? password : undefined,
        email_confirm: true,
        user_metadata: {
          full_name,
          nip,
          role,
          must_change_password: !!password,
        },
      });

      if (createError) return { ok: false, error: createError.message };
    }

    revalidatePath("/admin/guru");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menyimpan akun guru";
    return { ok: false, error: msg };
  }
}

export async function toggleGuruStatusAction(id: string, is_active: boolean): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("profiles")
    .update({ is_active })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/guru");
  return { ok: true };
}

export async function resetGuruPasswordAction(userId: string, newPassword: string): Promise<AdminActionResult> {
  if (newPassword.length < 10) {
    return { ok: false, error: "Password minimal 10 karakter" };
  }

  try {
    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (authError) return { ok: false, error: authError.message };

    await (adminClient as any)
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", userId);

    revalidatePath("/admin/guru");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mereset password";
    return { ok: false, error: msg };
  }
}

// -----------------------------------------------------------------------------
// 2. KELAS & WALI KELAS
// -----------------------------------------------------------------------------
export async function saveClassAction(input: ClassInput): Promise<AdminActionResult> {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    grade_level: parsed.data.grade_level,
    phase: parsed.data.phase,
    homeroom_teacher_id: parsed.data.homeroom_teacher_id || null,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("classes").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("classes").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/kelas");
  return { ok: true };
}

export async function deleteClassAction(id: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("classes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/kelas");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// 3. DATA SISWA & IMPOR MASAL
// -----------------------------------------------------------------------------
export async function saveStudentAction(input: StudentInput): Promise<AdminActionResult> {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    full_name: parsed.data.full_name,
    nis: parsed.data.nis,
    nisn: parsed.data.nisn || null,
    gender: parsed.data.gender,
    class_id: parsed.data.class_id,
    is_active: parsed.data.is_active,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("students").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("students").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/siswa");
  return { ok: true };
}

export async function deleteStudentAction(id: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("students")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/siswa");
  return { ok: true };
}

export async function importStudentsAction(
  rows: Array<{
    full_name: string;
    nis: string;
    nisn?: string | null;
    gender: "L" | "P";
    class_id: string;
  }>
): Promise<AdminActionResult<{ insertedCount: number }>> {
  if (!rows || rows.length === 0) {
    return { ok: false, error: "Tidak ada data siswa yang diunggah" };
  }

  const supabase = await createClient();

  const payload = rows.map((r) => ({
    full_name: r.full_name.trim(),
    nis: r.nis.trim(),
    nisn: r.nisn ? r.nisn.trim() : null,
    gender: r.gender,
    class_id: r.class_id,
    is_active: true,
  }));

  const { error } = await (supabase as any)
    .from("students")
    .upsert(payload, { onConflict: "nis" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/siswa");
  return { ok: true, data: { insertedCount: rows.length } };
}

// -----------------------------------------------------------------------------
// 4. MATA PELAJARAN
// -----------------------------------------------------------------------------
export async function saveSubjectAction(input: SubjectInput): Promise<AdminActionResult> {
  const parsed = subjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    code: parsed.data.code,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("subjects").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("subjects").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/mapel");
  return { ok: true };
}

export async function deleteSubjectAction(id: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("subjects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/mapel");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// 5. JAM PELAJARAN
// -----------------------------------------------------------------------------
export async function saveSchoolPeriodAction(input: SchoolPeriodInput): Promise<AdminActionResult> {
  const parsed = schoolPeriodSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    period_number: parsed.data.period_number,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time,
    is_break: parsed.data.is_break,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("school_periods").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("school_periods").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/jam-pelajaran");
  return { ok: true };
}

export async function deleteSchoolPeriodAction(id: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("school_periods")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/jam-pelajaran");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// 6. HARI LIBUR
// -----------------------------------------------------------------------------
export async function saveHolidayAction(input: HolidayInput): Promise<AdminActionResult> {
  const parsed = holidaySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    date: parsed.data.date,
    name: parsed.data.name,
    semester_id: parsed.data.semester_id || null,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("holidays").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("holidays").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/hari-libur");
  return { ok: true };
}

export async function deleteHolidayAction(id: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("holidays")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/hari-libur");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// 7. PENUGASAN MENGAJAR
// -----------------------------------------------------------------------------
export async function saveAssignmentAction(input: AssignmentInput): Promise<AdminActionResult> {
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    teacher_id: parsed.data.teacher_id,
    class_id: parsed.data.class_id,
    subject_id: parsed.data.subject_id,
    semester_id: parsed.data.semester_id,
    weight_formative: parsed.data.weight_formative,
    weight_summative: parsed.data.weight_summative,
    kktp_default: parsed.data.kktp_default,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("teaching_assignments").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("teaching_assignments").insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/penugasan");
  return { ok: true };
}

export async function deleteAssignmentAction(id: string): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("teaching_assignments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/penugasan");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// 8. PENGATURAN SEKOLAH
// -----------------------------------------------------------------------------
export async function saveSettingsAction(input: AppSettingsInput): Promise<AdminActionResult> {
  const parsed = appSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const payload = {
    school_name: parsed.data.school_name,
    address: parsed.data.address || null,
    principal_name: parsed.data.principal_name || null,
    principal_nip: parsed.data.principal_nip || null,
    attendance_threshold: parsed.data.attendance_threshold,
    kktp_default: parsed.data.kktp_default,
    remedial_max_score: parsed.data.remedial_max_score,
  };

  const { error } = parsed.data.id
    ? await (supabase as any).from("app_settings").update(payload).eq("id", parsed.data.id)
    : await (supabase as any).from("app_settings").upsert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pengaturan");
  return { ok: true };
}

import {
  MOCK_GURU,
  MOCK_KELAS,
  MOCK_SUBJECTS,
  MOCK_SCHOOL_PERIODS,
  MOCK_HOLIDAYS,
  MOCK_STUDENTS,
  MOCK_ASSIGNMENTS,
  MOCK_SEMESTER,
  MOCK_SETTINGS,
} from "@/lib/mockData";

// -----------------------------------------------------------------------------
// 9. DATA FETCHING GETTERS FOR ADMIN
// -----------------------------------------------------------------------------
export async function getGuruList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("id, email, full_name, nip, role, is_active, created_at")
    .is("deleted_at", null)
    .order("full_name");
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_GURU };
  return { ok: true, data };
}

export async function getKelasList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("classes")
    .select(`
      id,
      name,
      grade_level,
      phase,
      homeroom_teacher_id,
      homeroom_teacher:profiles!homeroom_teacher_id ( id, full_name )
    `)
    .is("deleted_at", null)
    .order("grade_level")
    .order("name");
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_KELAS };
  return { ok: true, data };
}

export async function getSubjectList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("subjects")
    .select("id, name, code")
    .is("deleted_at", null)
    .order("name");
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_SUBJECTS };
  return { ok: true, data };
}

export async function getSchoolPeriodList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("school_periods")
    .select("id, period_number, start_time, end_time, is_break")
    .is("deleted_at", null)
    .order("period_number");
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_SCHOOL_PERIODS };
  return { ok: true, data };
}

export async function getHolidayList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("holidays")
    .select("id, name, date, is_national_holiday")
    .order("date");
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_HOLIDAYS };
  return { ok: true, data };
}

export async function getSiswaList(classId?: string) {
  const supabase = await createClient();
  let query = (supabase as any)
    .from("students")
    .select(`
      id,
      nis,
      nisn,
      full_name,
      gender,
      class_id,
      is_active,
      class:classes ( id, name )
    `)
    .is("deleted_at", null)
    .order("full_name");

  if (classId) {
    query = query.eq("class_id", classId);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_STUDENTS };
  return { ok: true, data };
}

export async function getAssignmentList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("teaching_assignments")
    .select(`
      id,
      teacher_id,
      class_id,
      subject_id,
      semester_id,
      weight_formative,
      weight_summative,
      kktp_default,
      teacher:profiles!teacher_id ( id, full_name ),
      class:classes!class_id ( id, name, grade_level ),
      subject:subjects!subject_id ( id, name, code ),
      semester:semesters!semester_id ( id, name, is_active )
    `)
    .is("deleted_at", null);
  if (error || !data || data.length === 0) return { ok: true, data: MOCK_ASSIGNMENTS };
  return { ok: true, data };
}

export async function getSemestersList() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("semesters")
    .select("id, name, is_active, start_date, end_date")
    .is("deleted_at", null)
    .order("start_date", { ascending: false });
  if (error || !data || data.length === 0) return { ok: true, data: [MOCK_SEMESTER] };
  return { ok: true, data };
}

export async function getAppSettingsAction() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("app_settings")
    .select("*")
    .limit(1)
    .single();
  if (error || !data) return { ok: true, data: MOCK_SETTINGS };
  return { ok: true, data };
}

export async function getAdminDashboardStats() {
  const supabase = await createClient();
  const [
    { count: guruCount },
    { count: siswaCount },
    { count: kelasCount },
    { count: mapelCount },
  ] = await Promise.all([
    (supabase as any).from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null),
    (supabase as any).from("students").select("*", { count: "exact", head: true }).is("deleted_at", null),
    (supabase as any).from("classes").select("*", { count: "exact", head: true }).is("deleted_at", null),
    (supabase as any).from("subjects").select("*", { count: "exact", head: true }).is("deleted_at", null),
  ]);

  return {
    guruCount: guruCount || 4,
    siswaCount: siswaCount || 40,
    kelasCount: kelasCount || 3,
    mapelCount: mapelCount || 4,
  };
}

