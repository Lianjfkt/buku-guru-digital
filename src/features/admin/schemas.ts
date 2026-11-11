import { z } from "zod";

/**
 * Validasi pembuatan / pengubahan akun guru oleh admin
 */
export const guruAccountSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Format email tidak valid").trim().toLowerCase(),
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  nip: z.string().optional().nullable(),
  role: z.enum(["admin", "guru"]).default("guru"),
  is_active: z.boolean().default(true),
  password: z
    .string()
    .min(10, "Password awal minimal 10 karakter")
    .optional()
    .or(z.literal("")),
});

export type GuruAccountInput = z.infer<typeof guruAccountSchema>;

/**
 * Validasi Kelas
 */
export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama kelas wajib diisi"), // e.g. "X-A"
  grade_level: z.coerce.number().int().min(1).max(12),
  phase: z.enum(["A", "B", "C", "D", "E", "F"]),
  homeroom_teacher_id: z.string().optional().nullable(),
});

export type ClassInput = z.infer<typeof classSchema>;

/**
 * Validasi Siswa
 */
export const studentSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(2, "Nama siswa minimal 2 karakter"),
  nis: z.string().min(1, "NIS wajib diisi"),
  nisn: z.string().optional().nullable(),
  gender: z.enum(["L", "P"]),
  class_id: z.string().uuid("Pilih kelas yang valid"),
  is_active: z.boolean().default(true),
});

export type StudentInput = z.infer<typeof studentSchema>;

/**
 * Validasi Mata Pelajaran
 */
export const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama mata pelajaran wajib diisi"),
  code: z.string().min(1, "Kode mata pelajaran wajib diisi").toUpperCase(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

/**
 * Validasi Jam Pelajaran
 */
export const schoolPeriodSchema = z.object({
  id: z.string().optional(),
  period_number: z.coerce.number().int().min(1, "Jam ke- minimal 1"),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu HH:mm"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu HH:mm"),
  is_break: z.boolean().default(false),
});

export type SchoolPeriodInput = z.infer<typeof schoolPeriodSchema>;

/**
 * Validasi Hari Libur
 */
export const holidaySchema = z.object({
  id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  name: z.string().min(2, "Nama hari libur wajib diisi"),
  semester_id: z.string().optional().nullable(),
});

export type HolidayInput = z.infer<typeof holidaySchema>;

/**
 * Validasi Penugasan Mengajar
 */
export const assignmentSchema = z.object({
  id: z.string().optional(),
  teacher_id: z.string().uuid("Pilih guru pengajar"),
  class_id: z.string().uuid("Pilih kelas"),
  subject_id: z.string().uuid("Pilih mata pelajaran"),
  semester_id: z.string().uuid("Pilih semester"),
  weight_formative: z.coerce.number().min(0).max(100).default(40),
  weight_summative: z.coerce.number().min(0).max(100).default(60),
  kktp_default: z.coerce.number().min(0).max(100).default(75),
}).refine((data) => data.weight_formative + data.weight_summative === 100, {
  message: "Total bobot formatif dan sumatif harus tepat 100%",
  path: ["weight_summative"],
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

/**
 * Validasi Pengaturan Sekolah
 */
export const appSettingsSchema = z.object({
  id: z.string().optional(),
  school_name: z.string().min(2, "Nama sekolah wajib diisi"),
  address: z.string().optional().nullable(),
  principal_name: z.string().optional().nullable(),
  principal_nip: z.string().optional().nullable(),
  attendance_threshold: z.coerce.number().min(0).max(100).default(80),
  kktp_default: z.coerce.number().min(0).max(100).default(75),
  remedial_max_score: z.coerce.number().min(0).max(100).default(75),
});

export type AppSettingsInput = z.infer<typeof appSettingsSchema>;

