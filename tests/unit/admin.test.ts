import { describe, it, expect } from "vitest";
import {
  classSchema,
  studentSchema,
  subjectSchema,
  schoolPeriodSchema,
  holidaySchema,
  assignmentSchema,
  appSettingsSchema,
} from "@/features/admin/schemas";

describe("Validasi Skema Modul Admin (Master Data)", () => {
  describe("classSchema", () => {
    it("menerima data kelas yang valid", () => {
      const res = classSchema.safeParse({
        name: "X-A",
        grade_level: 10,
        phase: "E",
        homeroom_teacher_id: "22222222-2222-2222-2222-222222222222",
      });
      expect(res.success).toBe(true);
    });

    it("menolak fase kurikulum yang tidak valid", () => {
      const res = classSchema.safeParse({
        name: "X-A",
        grade_level: 10,
        phase: "Z",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("studentSchema", () => {
    it("menerima data siswa yang valid", () => {
      const res = studentSchema.safeParse({
        full_name: "Aditya Pratama",
        nis: "26001",
        nisn: "0081234501",
        gender: "L",
        class_id: "d0000000-0000-0000-0000-000000000001",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("subjectSchema", () => {
    it("menerima mata pelajaran dan mengkapitalkan kode mapel", () => {
      const res = subjectSchema.safeParse({
        name: "Informatika",
        code: "inf",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.code).toBe("INF");
      }
    });
  });

  describe("schoolPeriodSchema", () => {
    it("menerima jam pelajaran dengan format waktu HH:mm yang benar", () => {
      const res = schoolPeriodSchema.safeParse({
        period_number: 1,
        start_time: "07:15",
        end_time: "08:00",
        is_break: false,
      });
      expect(res.success).toBe(true);
    });

    it("menolak format waktu selain HH:mm", () => {
      const res = schoolPeriodSchema.safeParse({
        period_number: 1,
        start_time: "7:15 pagi",
        end_time: "08:00",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("assignmentSchema", () => {
    it("menerima penugasan jika total bobot formatif + sumatif tepat 100%", () => {
      const res = assignmentSchema.safeParse({
        teacher_id: "22222222-2222-2222-2222-222222222222",
        class_id: "d0000000-0000-0000-0000-000000000001",
        subject_id: "c0000000-0000-0000-0000-000000000001",
        semester_id: "b0000000-0000-0000-0000-000000000001",
        weight_formative: 40,
        weight_summative: 60,
        kktp_default: 75,
      });
      expect(res.success).toBe(true);
    });

    it("menolak penugasan jika total bobot bukan 100%", () => {
      const res = assignmentSchema.safeParse({
        teacher_id: "22222222-2222-2222-2222-222222222222",
        class_id: "d0000000-0000-0000-0000-000000000001",
        subject_id: "c0000000-0000-0000-0000-000000000001",
        semester_id: "b0000000-0000-0000-0000-000000000001",
        weight_formative: 50,
        weight_summative: 60, // Total 110%
        kktp_default: 75,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toBe("Total bobot formatif dan sumatif harus tepat 100%");
      }
    });
  });

  describe("appSettingsSchema", () => {
    it("menerima pengaturan sekolah yang valid", () => {
      const res = appSettingsSchema.safeParse({
        school_name: "SMA Negeri 1 Teladan",
        address: "Jl. Pendidikan",
        principal_name: "Drs. H. Bambang",
        attendance_threshold: 80,
        kktp_default: 75,
        remedial_max_score: 75,
      });
      expect(res.success).toBe(true);
    });
  });
});

