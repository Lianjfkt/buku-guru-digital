-- ==============================================================================
-- MIGRATION: 20261111000001_initial_schema.sql
-- DESKRIPSI: Skema tabel utama, tipe data, indeks, dan trigger updated_at
-- ==============================================================================

-- 1. Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipe ENUM
CREATE TYPE user_role AS ENUM ('admin', 'guru');
CREATE TYPE attendance_status AS ENUM ('hadir', 'sakit', 'izin', 'alpa');
CREATE TYPE assessment_category AS ENUM ('formatif', 'sumatif');
CREATE TYPE assessment_type AS ENUM ('SLM', 'SAS', 'SAT', 'lainnya');
CREATE TYPE agenda_status AS ENUM ('Dijadwalkan', 'Terlaksana', 'Tidak Terlaksana');
CREATE TYPE student_note_category AS ENUM ('akademik', 'sikap', 'perilaku', 'prestasi');
CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete');

-- 3. Trigger Function untuk updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Tabel Profiles (menghubungkan auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nip TEXT,
  role user_role NOT NULL DEFAULT 'guru',
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 5. Tabel Tahun Ajaran & Semester
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. "2026/2027"
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Ganjil", "Genap"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  locked_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- 6. Tabel Kelas
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. "X-A", "XI-IPA-1"
  grade_level INTEGER NOT NULL, -- 10, 11, 12
  phase CHAR(1) NOT NULL CHECK (phase IN ('A', 'B', 'C', 'D', 'E', 'F')),
  homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 7. Tabel Siswa
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nis VARCHAR(50) NOT NULL UNIQUE,
  nisn VARCHAR(50),
  gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 8. Tabel Mata Pelajaran
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. "Matematika", "Informatika"
  code VARCHAR(50) NOT NULL UNIQUE, -- e.g. "MAT", "INF"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9. Tabel Jam Pelajaran (School Periods)
CREATE TABLE school_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_number INTEGER NOT NULL UNIQUE, -- 1, 2, 3 ...
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_break BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_period_time CHECK (end_time > start_time)
);

-- 10. Tabel Hari Libur
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 11. Tabel Penugasan Mengajar (Teaching Assignments)
CREATE TABLE teaching_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  weight_formative NUMERIC(5,2) NOT NULL DEFAULT 40.00,
  weight_summative NUMERIC(5,2) NOT NULL DEFAULT 60.00,
  kktp_default NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_teaching_assignment UNIQUE (teacher_id, class_id, subject_id, semester_id),
  CONSTRAINT check_weights CHECK (weight_formative + weight_summative = 100.00)
);

-- 12. Tabel Jadwal Mengajar (Schedules)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES teaching_assignments(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1: Senin, ..., 6: Sabtu
  start_period INTEGER NOT NULL,
  end_period INTEGER NOT NULL,
  room TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_schedules_period CHECK (end_period >= start_period)
);

-- 13. Tabel Tujuan Pembelajaran (Learning Objectives / TP)
CREATE TABLE learning_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES teaching_assignments(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL, -- e.g. "TP 1.1"
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  kktp NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14. Tabel Agenda Mengajar
CREATE TABLE agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES teaching_assignments(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_period INTEGER NOT NULL,
  end_period INTEGER NOT NULL,
  topic TEXT NOT NULL,
  activity TEXT,
  reflection TEXT,
  status agenda_status NOT NULL DEFAULT 'Dijadwalkan',
  not_held_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_schedule_date UNIQUE (schedule_id, date),
  CONSTRAINT check_agenda_period CHECK (end_period >= start_period)
);

-- Relasi many-to-many Agenda <-> TP
CREATE TABLE agenda_objectives (
  agenda_id UUID NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES learning_objectives(id) ON DELETE CASCADE,
  PRIMARY KEY (agenda_id, objective_id)
);

-- 15. Tabel Presensi (Attendances)
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'hadir',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_agenda_student UNIQUE (agenda_id, student_id)
);

-- 16. Tabel Asesmen (Assessments)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES teaching_assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g. "Kuis Aljabar", "SLM 1"
  category assessment_category NOT NULL DEFAULT 'formatif',
  type assessment_type NOT NULL DEFAULT 'lainnya',
  date DATE NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Relasi many-to-many Asesmen <-> TP
CREATE TABLE assessment_objectives (
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES learning_objectives(id) ON DELETE CASCADE,
  PRIMARY KEY (assessment_id, objective_id)
);

-- 17. Tabel Nilai (Scores)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  remedial_score NUMERIC(5,2),
  needs_enrichment BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_assessment_student UNIQUE (assessment_id, student_id),
  CONSTRAINT check_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  CONSTRAINT check_remedial_range CHECK (remedial_score IS NULL OR (remedial_score >= 0 AND remedial_score <= 100))
);

-- 18. Tabel Catatan Perkembangan Siswa
CREATE TABLE student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category student_note_category NOT NULL DEFAULT 'akademik',
  note TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 19. Tabel Notifikasi
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'presensi_tertunda', 'agenda_hari_ini', 'penguncian_periode', dsb.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Tabel Pengaturan Aplikasi (Singleton)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL DEFAULT 'SMA Negeri Contoh',
  address TEXT,
  logo_path TEXT,
  principal_name TEXT,
  principal_nip TEXT,
  signature_path TEXT,
  attendance_threshold NUMERIC(5,2) NOT NULL DEFAULT 80.00,
  kktp_default NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  remedial_max_score NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  mastery_thresholds JSONB NOT NULL DEFAULT '{
    "sangat_tercapai": 90,
    "tercapai": 75,
    "cukup": 60,
    "belum_tercapai": 0
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Tabel Audit Log (Append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEKS PERFORMA & FILTER
CREATE INDEX idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_class ON students(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_nis ON students(nis);
CREATE INDEX idx_assignments_teacher ON teaching_assignments(teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_class ON teaching_assignments(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_semester ON teaching_assignments(semester_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_schedules_assignment ON schedules(assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_schedules_day ON schedules(day_of_week) WHERE deleted_at IS NULL;
CREATE INDEX idx_agendas_assignment ON agendas(assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agendas_date ON agendas(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendances_agenda ON attendances(agenda_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendances_student ON attendances(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assessments_assignment ON assessments(assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scores_assessment ON scores(assessment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scores_student ON scores(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_student_notes_student ON student_notes(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);

-- Pasang trigger updated_at pada semua tabel yang memiliki kolom updated_at
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_school_periods_updated_at BEFORE UPDATE ON school_periods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_teaching_assignments_updated_at BEFORE UPDATE ON teaching_assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_learning_objectives_updated_at BEFORE UPDATE ON learning_objectives FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_agendas_updated_at BEFORE UPDATE ON agendas FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_attendances_updated_at BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_scores_updated_at BEFORE UPDATE ON scores FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_student_notes_updated_at BEFORE UPDATE ON student_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
