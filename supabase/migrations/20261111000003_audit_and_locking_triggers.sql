-- ==============================================================================
-- MIGRATION: 20261111000003_audit_and_locking_triggers.sql
-- DESKRIPSI: Trigger Pembuatan Profil, Audit Logging Otomatis, dan Guard Penguncian Periode
-- ==============================================================================

-- 1. Trigger Pembuatan Profil Otomatis saat User Baru Dibuat di Auth
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'guru';
BEGIN
  -- Jika metadata peran dispesifikasikan saat pendaftaran oleh admin
  IF (NEW.raw_user_meta_data->>'role') = 'admin' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, nip, role, is_active, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'nip',
    v_role,
    true,
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Trigger Audit Log Otomatis
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_record_id UUID;
  v_old_data JSONB := NULL;
  v_new_data JSONB := NULL;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_record_id := OLD.id;
    v_old_data := to_jsonb(OLD);
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (v_user_id, TG_TABLE_NAME, v_record_id, 'delete', v_old_data, NULL);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_record_id := NEW.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (v_user_id, TG_TABLE_NAME, v_record_id, 'update', v_old_data, v_new_data);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    v_record_id := NEW.id;
    v_new_data := to_jsonb(NEW);
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (v_user_id, TG_TABLE_NAME, v_record_id, 'insert', NULL, v_new_data);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger audit pada tabel-tabel utama
CREATE TRIGGER tr_audit_scores AFTER INSERT OR UPDATE OR DELETE ON scores
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();

CREATE TRIGGER tr_audit_attendances AFTER INSERT OR UPDATE OR DELETE ON attendances
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();

CREATE TRIGGER tr_audit_agendas AFTER INSERT OR UPDATE OR DELETE ON agendas
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();

CREATE TRIGGER tr_audit_teaching_assignments AFTER INSERT OR UPDATE OR DELETE ON teaching_assignments
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();

CREATE TRIGGER tr_audit_students AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();

CREATE TRIGGER tr_audit_profiles AFTER UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();


-- 3. Trigger Penjaga Penguncian Periode & Arsip (Guard Trigger)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION guard_period_locking()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
  v_semester_id UUID;
  v_locked_until DATE;
  v_is_archived BOOLEAN;
BEGIN
  -- Jika user adalah admin, izinkan perubahan
  IF is_admin() THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Tentukan tanggal yang relevan dan semester_id berdasarkan tabel
  IF (TG_TABLE_NAME = 'agendas') THEN
    v_date := COALESCE(NEW.date, OLD.date);
    SELECT ta.semester_id INTO v_semester_id
    FROM teaching_assignments ta
    WHERE ta.id = COALESCE(NEW.assignment_id, OLD.assignment_id);

  ELSIF (TG_TABLE_NAME = 'attendances') THEN
    SELECT a.date, ta.semester_id INTO v_date, v_semester_id
    FROM agendas a
    JOIN teaching_assignments ta ON ta.id = a.assignment_id
    WHERE a.id = COALESCE(NEW.agenda_id, OLD.agenda_id);

  ELSIF (TG_TABLE_NAME = 'scores') THEN
    SELECT a.date, ta.semester_id INTO v_date, v_semester_id
    FROM assessments a
    JOIN teaching_assignments ta ON ta.id = a.assignment_id
    WHERE a.id = COALESCE(NEW.assessment_id, OLD.assessment_id);
  END IF;

  -- Ambil status locked_until dan status arsip tahun ajaran
  IF v_semester_id IS NOT NULL THEN
    SELECT s.locked_until, ay.is_archived 
    INTO v_locked_until, v_is_archived
    FROM semesters s
    JOIN academic_years ay ON ay.id = s.academic_year_id
    WHERE s.id = v_semester_id;

    -- Validasi 1: Tahun ajaran diarsipkan (seluruh semester read-only)
    IF v_is_archived = true THEN
      RAISE EXCEPTION 'Data tidak dapat diubah: Tahun ajaran untuk periode ini telah diarsipkan.';
    END IF;

    -- Validasi 2: Periode dikunci sebelum tanggal tertentu
    IF v_locked_until IS NOT NULL AND v_date <= v_locked_until THEN
      RAISE EXCEPTION 'Data tidak dapat diubah: Periode hingga tanggal % telah dikunci oleh administrator.', v_locked_until;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang guard trigger pada agendas, attendances, dan scores
CREATE TRIGGER tr_guard_agendas BEFORE INSERT OR UPDATE OR DELETE ON agendas
  FOR EACH ROW EXECUTE FUNCTION guard_period_locking();

CREATE TRIGGER tr_guard_attendances BEFORE INSERT OR UPDATE OR DELETE ON attendances
  FOR EACH ROW EXECUTE FUNCTION guard_period_locking();

CREATE TRIGGER tr_guard_scores BEFORE INSERT OR UPDATE OR DELETE ON scores
  FOR EACH ROW EXECUTE FUNCTION guard_period_locking();
