export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "guru";
export type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa";
export type AssessmentCategory = "formatif" | "sumatif";
export type AssessmentType = "SLM" | "SAS" | "SAT" | "lainnya";
export type AgendaStatus = "Dijadwalkan" | "Terlaksana" | "Tidak Terlaksana";
export type StudentNoteCategory = "akademik" | "sikap" | "perilaku" | "prestasi";
export type AuditAction = "insert" | "update" | "delete";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          nip: string | null;
          role: UserRole;
          is_active: boolean;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          nip?: string | null;
          role?: UserRole;
          is_active?: boolean;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          nip?: string | null;
          role?: UserRole;
          is_active?: boolean;
          must_change_password?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      academic_years: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          is_active?: boolean;
          is_archived?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      semesters: {
        Row: {
          id: string;
          academic_year_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          locked_until: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          academic_year_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          locked_until?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          grade_level: number;
          phase: "A" | "B" | "C" | "D" | "E" | "F";
          homeroom_teacher_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          grade_level: number;
          phase: "A" | "B" | "C" | "D" | "E" | "F";
          homeroom_teacher_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          grade_level?: number;
          phase?: "A" | "B" | "C" | "D" | "E" | "F";
          homeroom_teacher_id?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      students: {
        Row: {
          id: string;
          full_name: string;
          nis: string;
          nisn: string | null;
          gender: "L" | "P";
          class_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          nis: string;
          nisn?: string | null;
          gender: "L" | "P";
          class_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          full_name?: string;
          nis?: string;
          nisn?: string | null;
          gender?: "L" | "P";
          class_id?: string;
          is_active?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          code?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      school_periods: {
        Row: {
          id: string;
          period_number: number;
          start_time: string;
          end_time: string;
          is_break: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          period_number: number;
          start_time: string;
          end_time: string;
          is_break?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          period_number?: number;
          start_time?: string;
          end_time?: string;
          is_break?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      holidays: {
        Row: {
          id: string;
          date: string;
          name: string;
          semester_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          name: string;
          semester_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          date?: string;
          name?: string;
          semester_id?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      teaching_assignments: {
        Row: {
          id: string;
          teacher_id: string;
          class_id: string;
          subject_id: string;
          semester_id: string;
          weight_formative: number;
          weight_summative: number;
          kktp_default: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          class_id: string;
          subject_id: string;
          semester_id: string;
          weight_formative?: number;
          weight_summative?: number;
          kktp_default?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          teacher_id?: string;
          class_id?: string;
          subject_id?: string;
          semester_id?: string;
          weight_formative?: number;
          weight_summative?: number;
          kktp_default?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          assignment_id: string;
          day_of_week: number;
          start_period: number;
          end_period: number;
          room: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          day_of_week: number;
          start_period: number;
          end_period: number;
          room?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          day_of_week?: number;
          start_period?: number;
          end_period?: number;
          room?: string | null;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      learning_objectives: {
        Row: {
          id: string;
          assignment_id: string;
          code: string;
          description: string;
          sort_order: number;
          kktp: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          code: string;
          description: string;
          sort_order?: number;
          kktp?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          code?: string;
          description?: string;
          sort_order?: number;
          kktp?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      agendas: {
        Row: {
          id: string;
          assignment_id: string;
          schedule_id: string | null;
          date: string;
          start_period: number;
          end_period: number;
          topic: string;
          activity: string | null;
          reflection: string | null;
          status: AgendaStatus;
          not_held_reason: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          schedule_id?: string | null;
          date: string;
          start_period: number;
          end_period: number;
          topic: string;
          activity?: string | null;
          reflection?: string | null;
          status?: AgendaStatus;
          not_held_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          schedule_id?: string | null;
          date?: string;
          start_period?: number;
          end_period?: number;
          topic?: string;
          activity?: string | null;
          reflection?: string | null;
          status?: AgendaStatus;
          not_held_reason?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      attendances: {
        Row: {
          id: string;
          agenda_id: string;
          student_id: string;
          status: AttendanceStatus;
          note: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          agenda_id: string;
          student_id: string;
          status?: AttendanceStatus;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          status?: AttendanceStatus;
          note?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      assessments: {
        Row: {
          id: string;
          assignment_id: string;
          title: string;
          category: AssessmentCategory;
          type: AssessmentType;
          date: string;
          max_score: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          title: string;
          category?: AssessmentCategory;
          type?: AssessmentType;
          date: string;
          max_score?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          title?: string;
          category?: AssessmentCategory;
          type?: AssessmentType;
          date?: string;
          max_score?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      scores: {
        Row: {
          id: string;
          assessment_id: string;
          student_id: string;
          score: number | null;
          remedial_score: number | null;
          needs_enrichment: boolean;
          note: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          student_id: string;
          score?: number | null;
          remedial_score?: number | null;
          needs_enrichment?: boolean;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          score?: number | null;
          remedial_score?: number | null;
          needs_enrichment?: boolean;
          note?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      student_notes: {
        Row: {
          id: string;
          student_id: string;
          author_id: string;
          category: StudentNoteCategory;
          note: string;
          date: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          author_id: string;
          category?: StudentNoteCategory;
          note: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          category?: StudentNoteCategory;
          note?: string;
          date?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
      };
      app_settings: {
        Row: {
          id: string;
          school_name: string;
          address: string | null;
          logo_path: string | null;
          principal_name: string | null;
          principal_nip: string | null;
          signature_path: string | null;
          attendance_threshold: number;
          kktp_default: number;
          remedial_max_score: number;
          mastery_thresholds: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_name?: string;
          address?: string | null;
          logo_path?: string | null;
          principal_name?: string | null;
          principal_nip?: string | null;
          signature_path?: string | null;
          attendance_threshold?: number;
          kktp_default?: number;
          remedial_max_score?: number;
          mastery_thresholds?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          school_name?: string;
          address?: string | null;
          logo_path?: string | null;
          principal_name?: string | null;
          principal_nip?: string | null;
          signature_path?: string | null;
          attendance_threshold?: number;
          kktp_default?: number;
          remedial_max_score?: number;
          mastery_thresholds?: Json;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          table_name: string;
          record_id: string;
          action: AuditAction;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          table_name: string;
          record_id: string;
          action: AuditAction;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: never; // Append-only
      };
    };
  };
}
