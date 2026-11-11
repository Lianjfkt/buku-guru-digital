-- ==============================================================================
-- MIGRATION: 20261111000002_rls_and_policies.sql
-- DESKRIPSI: Fungsi Helper Keamanan SECURITY DEFINER, Pengaktifan RLS, dan Policies
-- ==============================================================================

-- 1. Helper Security Functions (SECURITY DEFINER)
-- -----------------------------------------------------------------------------

-- Cek apakah user saat ini adalah admin aktif
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Cek apakah penugasan mengajar adalah milik guru yang sedang login
CREATE OR REPLACE FUNCTION is_my_assignment(p_assignment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teaching_assignments
    WHERE id = p_assignment_id
      AND teacher_id = auth.uid()
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Cek apakah user saat ini adalah wali kelas dari kelas tertentu
CREATE OR REPLACE FUNCTION is_homeroom_of(p_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM classes
    WHERE id = p_class_id
      AND homeroom_teacher_id = auth.uid()
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Cek apakah user boleh melihat data siswa (Admin, Guru yang mengajar kelas siswa, atau Wali Kelas siswa)
CREATE OR REPLACE FUNCTION can_view_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_class_id UUID;
BEGIN
  IF is_admin() THEN
    RETURN true;
  END IF;

  SELECT class_id INTO v_class_id
  FROM students
  WHERE id = p_student_id AND deleted_at IS NULL;

  IF v_class_id IS NULL THEN
    RETURN false;
  END IF;

  -- Cek jika wali kelas
  IF is_homeroom_of(v_class_id) THEN
    RETURN true;
  END IF;

  -- Cek jika guru mengajar di kelas tersebut pada semester aktif
  RETURN EXISTS (
    SELECT 1 FROM teaching_assignments
    WHERE class_id = v_class_id
      AND teacher_id = auth.uid()
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Aktifkan Row Level Security (RLS) di SEMUA Tabel (Default Deny)
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS (Policies)
-- -----------------------------------------------------------------------------

-- A. PROFILES
-- Semua user terautentikasi dapat melihat profil aktif (untuk nama guru/rekan)
CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- Admin dapat mengelola semua profil
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL TO authenticated
  USING (is_admin());

-- User dapat memperbarui profilnya sendiri (kecuali role & is_active diatur via backend/admin)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- B. ACADEMIC_YEARS & SEMESTERS
-- Semua user dapat membaca tahun ajaran dan semester aktif
CREATE POLICY "academic_years_select" ON academic_years
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "academic_years_admin" ON academic_years
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "semesters_select" ON semesters
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "semesters_admin" ON semesters
  FOR ALL TO authenticated
  USING (is_admin());

-- C. CLASSES, SUBJECTS, SCHOOL_PERIODS, HOLIDAYS
CREATE POLICY "classes_select" ON classes
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "classes_admin" ON classes
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "subjects_select" ON subjects
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "subjects_admin" ON subjects
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "school_periods_select" ON school_periods
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "school_periods_admin" ON school_periods
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "holidays_select" ON holidays
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "holidays_admin" ON holidays
  FOR ALL TO authenticated
  USING (is_admin());

-- D. STUDENTS
CREATE POLICY "students_select" ON students
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND can_view_student(id));

CREATE POLICY "students_admin" ON students
  FOR ALL TO authenticated
  USING (is_admin());

-- E. TEACHING_ASSIGNMENTS
CREATE POLICY "assignments_select" ON teaching_assignments
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (is_admin() OR teacher_id = auth.uid() OR is_homeroom_of(class_id)));

CREATE POLICY "assignments_admin" ON teaching_assignments
  FOR ALL TO authenticated
  USING (is_admin());

-- F. SCHEDULES
CREATE POLICY "schedules_select" ON schedules
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (is_admin() OR is_my_assignment(assignment_id)));

CREATE POLICY "schedules_modify_teacher" ON schedules
  FOR ALL TO authenticated
  USING (is_my_assignment(assignment_id))
  WITH CHECK (is_my_assignment(assignment_id));

CREATE POLICY "schedules_admin" ON schedules
  FOR ALL TO authenticated
  USING (is_admin());

-- G. LEARNING OBJECTIVES (TP)
CREATE POLICY "objectives_select" ON learning_objectives
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (is_admin() OR is_my_assignment(assignment_id)));

CREATE POLICY "objectives_modify_teacher" ON learning_objectives
  FOR ALL TO authenticated
  USING (is_my_assignment(assignment_id))
  WITH CHECK (is_my_assignment(assignment_id));

CREATE POLICY "objectives_admin" ON learning_objectives
  FOR ALL TO authenticated
  USING (is_admin());

-- H. AGENDAS & AGENDA_OBJECTIVES
CREATE POLICY "agendas_select" ON agendas
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      is_admin() OR 
      is_my_assignment(assignment_id) OR
      EXISTS (
        SELECT 1 FROM teaching_assignments ta
        WHERE ta.id = agendas.assignment_id AND is_homeroom_of(ta.class_id)
      )
    )
  );

CREATE POLICY "agendas_modify_teacher" ON agendas
  FOR ALL TO authenticated
  USING (is_my_assignment(assignment_id))
  WITH CHECK (is_my_assignment(assignment_id));

CREATE POLICY "agendas_admin" ON agendas
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "agenda_objectives_select" ON agenda_objectives
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "agenda_objectives_modify" ON agenda_objectives
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agendas a
      WHERE a.id = agenda_objectives.agenda_id AND is_my_assignment(a.assignment_id)
    ) OR is_admin()
  );

-- I. ATTENDANCES
CREATE POLICY "attendances_select" ON attendances
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM agendas a
        WHERE a.id = attendances.agenda_id AND is_my_assignment(a.assignment_id)
      ) OR
      can_view_student(student_id)
    )
  );

CREATE POLICY "attendances_modify_teacher" ON attendances
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agendas a
      WHERE a.id = attendances.agenda_id AND is_my_assignment(a.assignment_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agendas a
      WHERE a.id = attendances.agenda_id AND is_my_assignment(a.assignment_id)
    )
  );

CREATE POLICY "attendances_admin" ON attendances
  FOR ALL TO authenticated
  USING (is_admin());

-- J. ASSESSMENTS & ASSESSMENT_OBJECTIVES
CREATE POLICY "assessments_select" ON assessments
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      is_admin() OR
      is_my_assignment(assignment_id) OR
      EXISTS (
        SELECT 1 FROM teaching_assignments ta
        WHERE ta.id = assessments.assignment_id AND is_homeroom_of(ta.class_id)
      )
    )
  );

CREATE POLICY "assessments_modify_teacher" ON assessments
  FOR ALL TO authenticated
  USING (is_my_assignment(assignment_id))
  WITH CHECK (is_my_assignment(assignment_id));

CREATE POLICY "assessments_admin" ON assessments
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "assessment_objectives_select" ON assessment_objectives
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "assessment_objectives_modify" ON assessment_objectives
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_objectives.assessment_id AND is_my_assignment(a.assignment_id)
    ) OR is_admin()
  );

-- K. SCORES
CREATE POLICY "scores_select" ON scores
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM assessments a
        WHERE a.id = scores.assessment_id AND is_my_assignment(a.assignment_id)
      ) OR
      EXISTS (
        SELECT 1 FROM assessments a
        JOIN teaching_assignments ta ON ta.id = a.assignment_id
        WHERE a.id = scores.assessment_id AND is_homeroom_of(ta.class_id)
      )
    )
  );

CREATE POLICY "scores_modify_teacher" ON scores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = scores.assessment_id AND is_my_assignment(a.assignment_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = scores.assessment_id AND is_my_assignment(a.assignment_id)
    )
  );

CREATE POLICY "scores_admin" ON scores
  FOR ALL TO authenticated
  USING (is_admin());

-- L. STUDENT_NOTES
CREATE POLICY "student_notes_select" ON student_notes
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      is_admin() OR
      author_id = auth.uid() OR
      can_view_student(student_id)
    )
  );

CREATE POLICY "student_notes_insert" ON student_notes
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() OR is_admin());

CREATE POLICY "student_notes_modify_own" ON student_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR is_admin())
  WITH CHECK (author_id = auth.uid() OR is_admin());

CREATE POLICY "student_notes_delete_own" ON student_notes
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR is_admin());

-- M. NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL TO authenticated
  USING (is_admin());

-- N. APP_SETTINGS
CREATE POLICY "app_settings_select" ON app_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "app_settings_admin" ON app_settings
  FOR ALL TO authenticated
  USING (is_admin());

-- O. AUDIT_LOGS
-- Hanya admin yang dapat membaca audit logs. Tidak ada yang boleh UPDATE/DELETE.
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);
