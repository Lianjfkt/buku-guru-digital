-- ==============================================================================
-- MIGRATION: 20261111000004_functions_and_views.sql
-- DESKRIPSI: Kalkulasi Rekap Kehadiran, Nilai Berbobot, Deteksi Bentrok, dan Generator Agenda
-- ==============================================================================

-- 1. Deteksi Bentrok Jadwal Guru (Blokir jika guru bentrok dengan jadwalnya sendiri)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION detect_teacher_schedule_conflict(
  p_teacher_id UUID,
  p_day_of_week INTEGER,
  p_start_period INTEGER,
  p_end_period INTEGER,
  p_semester_id UUID,
  p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS TABLE (
  conflict_schedule_id UUID,
  class_name TEXT,
  subject_name TEXT,
  start_period INTEGER,
  end_period INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS conflict_schedule_id,
    c.name AS class_name,
    sub.name AS subject_name,
    s.start_period,
    s.end_period
  FROM schedules s
  JOIN teaching_assignments ta ON ta.id = s.assignment_id
  JOIN classes c ON c.id = ta.class_id
  JOIN subjects sub ON sub.id = ta.subject_id
  WHERE ta.teacher_id = p_teacher_id
    AND ta.semester_id = p_semester_id
    AND s.day_of_week = p_day_of_week
    AND s.is_active = true
    AND s.deleted_at IS NULL
    AND ta.deleted_at IS NULL
    AND (p_exclude_schedule_id IS NULL OR s.id <> p_exclude_schedule_id)
    AND NOT (p_end_period < s.start_period OR p_start_period > s.end_period);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 2. Deteksi Bentrok Jadwal Kelas (Peringatan jika kelas dipakai guru lain)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION detect_class_schedule_conflict(
  p_class_id UUID,
  p_day_of_week INTEGER,
  p_start_period INTEGER,
  p_end_period INTEGER,
  p_semester_id UUID,
  p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS TABLE (
  conflict_schedule_id UUID,
  teacher_name TEXT,
  subject_name TEXT,
  start_period INTEGER,
  end_period INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS conflict_schedule_id,
    p.full_name AS teacher_name,
    sub.name AS subject_name,
    s.start_period,
    s.end_period
  FROM schedules s
  JOIN teaching_assignments ta ON ta.id = s.assignment_id
  JOIN profiles p ON p.id = ta.teacher_id
  JOIN subjects sub ON sub.id = ta.subject_id
  WHERE ta.class_id = p_class_id
    AND ta.semester_id = p_semester_id
    AND s.day_of_week = p_day_of_week
    AND s.is_active = true
    AND s.deleted_at IS NULL
    AND ta.deleted_at IS NULL
    AND (p_exclude_schedule_id IS NULL OR s.id <> p_exclude_schedule_id)
    AND NOT (p_end_period < s.start_period OR p_start_period > s.end_period);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 3. Generator Agenda Mengajar Otomatis dari Jadwal (SECURITY INVOKER)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_agendas_from_schedule(
  p_assignment_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  created_count INTEGER,
  skipped_holiday_count INTEGER
) AS $$
DECLARE
  v_curr_date DATE;
  v_dow INTEGER;
  v_sched RECORD;
  v_created INTEGER := 0;
  v_skipped INTEGER := 0;
  v_is_holiday BOOLEAN;
  v_semester_id UUID;
BEGIN
  -- Ambil semester_id dari penugasan
  SELECT semester_id INTO v_semester_id
  FROM teaching_assignments
  WHERE id = p_assignment_id AND deleted_at IS NULL;

  IF v_semester_id IS NULL THEN
    RAISE EXCEPTION 'Penugasan tidak ditemukan';
  END IF;

  v_curr_date := p_start_date;
  WHILE v_curr_date <= p_end_date LOOP
    -- Postgres EXTRACT(ISODOW): 1 = Senin, ..., 7 = Minggu
    v_dow := EXTRACT(ISODOW FROM v_curr_date);

    IF v_dow BETWEEN 1 AND 6 THEN
      -- Cek apakah hari ini adalah hari libur
      SELECT EXISTS (
        SELECT 1 FROM holidays
        WHERE date = v_curr_date
          AND (semester_id IS NULL OR semester_id = v_semester_id)
          AND deleted_at IS NULL
      ) INTO v_is_holiday;

      IF v_is_holiday THEN
        v_skipped := v_skipped + 1;
      ELSE
        -- Cari jadwal aktif pada hari tersebut
        FOR v_sched IN 
          SELECT id, start_period, end_period
          FROM schedules
          WHERE assignment_id = p_assignment_id
            AND day_of_week = v_dow
            AND is_active = true
            AND deleted_at IS NULL
        LOOP
          -- Masukkan agenda jika belum ada pada tanggal & schedule_id tersebut
          INSERT INTO agendas (
            assignment_id,
            schedule_id,
            date,
            start_period,
            end_period,
            topic,
            status
          )
          VALUES (
            p_assignment_id,
            v_sched.id,
            v_curr_date,
            v_sched.start_period,
            v_sched.end_period,
            'Pertemuan Terjadwal',
            'Dijadwalkan'
          )
          ON CONFLICT (schedule_id, date) DO NOTHING;

          IF FOUND THEN
            v_created := v_created + 1;
          END IF;
        END LOOP;
      END IF;
    END IF;

    v_curr_date := v_curr_date + INTERVAL '1 day';
  END LOOP;

  RETURN QUERY SELECT v_created, v_skipped;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- 4. Fungsi Rekap Kehadiran Siswa per Penugasan
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_attendance_summary(p_assignment_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  nis VARCHAR(50),
  total_sessions BIGINT,
  total_hadir BIGINT,
  total_sakit BIGINT,
  total_izin BIGINT,
  total_alpa BIGINT,
  attendance_percentage NUMERIC(5,2),
  needs_attention BOOLEAN
) AS $$
DECLARE
  v_threshold NUMERIC(5,2);
  v_class_id UUID;
BEGIN
  -- Ambil ambang kehadiran dari pengaturan (default 80%)
  SELECT COALESCE(attendance_threshold, 80.00) INTO v_threshold
  FROM app_settings
  LIMIT 1;
  IF v_threshold IS NULL THEN v_threshold := 80.00; END IF;

  SELECT class_id INTO v_class_id
  FROM teaching_assignments
  WHERE id = p_assignment_id;

  RETURN QUERY
  WITH class_students AS (
    SELECT s.id, s.full_name, s.nis
    FROM students s
    WHERE s.class_id = v_class_id AND s.is_active = true AND s.deleted_at IS NULL
  ),
  agenda_ids AS (
    SELECT a.id FROM agendas a
    WHERE a.assignment_id = p_assignment_id AND a.deleted_at IS NULL
  ),
  stats AS (
    SELECT 
      cs.id AS s_id,
      cs.full_name AS s_name,
      cs.nis AS s_nis,
      COUNT(att.id) AS t_sessions,
      COUNT(att.id) FILTER (WHERE att.status = 'hadir') AS t_hadir,
      COUNT(att.id) FILTER (WHERE att.status = 'sakit') AS t_sakit,
      COUNT(att.id) FILTER (WHERE att.status = 'izin') AS t_izin,
      COUNT(att.id) FILTER (WHERE att.status = 'alpa') AS t_alpa
    FROM class_students cs
    LEFT JOIN attendances att ON att.student_id = cs.id AND att.agenda_id IN (SELECT id FROM agenda_ids) AND att.deleted_at IS NULL
    GROUP BY cs.id, cs.full_name, cs.nis
  )
  SELECT 
    s_id AS student_id,
    s_name AS student_name,
    s_nis AS nis,
    t_sessions AS total_sessions,
    t_hadir AS total_hadir,
    t_sakit AS total_sakit,
    t_izin AS total_izin,
    t_alpa AS total_alpa,
    CASE 
      WHEN t_sessions > 0 THEN ROUND((t_hadir::NUMERIC / t_sessions::NUMERIC) * 100.0, 2)
      ELSE 100.00
    END AS attendance_percentage,
    CASE 
      WHEN t_sessions > 0 AND ((t_hadir::NUMERIC / t_sessions::NUMERIC) * 100.0) < v_threshold THEN true
      ELSE false
    END AS needs_attention
  FROM stats
  ORDER BY s_name ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 5. Fungsi Rekap Nilai Berbobot & Capaian Kurikulum Merdeka
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_scores_summary(p_assignment_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  nis VARCHAR(50),
  formative_avg NUMERIC(5,2),
  summative_avg NUMERIC(5,2),
  final_score NUMERIC(5,2),
  kktp NUMERIC(5,2),
  is_passed BOOLEAN,
  needs_remedial BOOLEAN
) AS $$
DECLARE
  v_class_id UUID;
  v_w_formative NUMERIC(5,2);
  v_w_summative NUMERIC(5,2);
  v_kktp NUMERIC(5,2);
BEGIN
  -- Ambil bobot dan KKTP dari teaching_assignments
  SELECT class_id, weight_formative, weight_summative, kktp_default
  INTO v_class_id, v_w_formative, v_w_summative, v_kktp
  FROM teaching_assignments
  WHERE id = p_assignment_id;

  RETURN QUERY
  WITH class_students AS (
    SELECT s.id, s.full_name, s.nis
    FROM students s
    WHERE s.class_id = v_class_id AND s.is_active = true AND s.deleted_at IS NULL
  ),
  student_scores AS (
    SELECT 
      sc.student_id,
      asm.category,
      -- Nilai efektif: gunakan remedial_score jika ada, jika tidak gunakan score
      COALESCE(sc.remedial_score, sc.score) AS effective_score
    FROM scores sc
    JOIN assessments asm ON asm.id = sc.assessment_id
    WHERE asm.assignment_id = p_assignment_id
      AND sc.deleted_at IS NULL
      AND asm.deleted_at IS NULL
      AND (sc.score IS NOT NULL OR sc.remedial_score IS NOT NULL)
  ),
  aggregated AS (
    SELECT 
      cs.id AS s_id,
      cs.full_name AS s_name,
      cs.nis AS s_nis,
      ROUND(AVG(ss.effective_score) FILTER (WHERE ss.category = 'formatif'), 2) AS avg_formatif,
      ROUND(AVG(ss.effective_score) FILTER (WHERE ss.category = 'sumatif'), 2) AS avg_sumatif
    FROM class_students cs
    LEFT JOIN student_scores ss ON ss.student_id = cs.id
    GROUP BY cs.id, cs.full_name, cs.nis
  )
  SELECT 
    a.s_id AS student_id,
    a.s_name AS student_name,
    a.s_nis AS nis,
    COALESCE(a.avg_formatif, 0.00) AS formative_avg,
    COALESCE(a.avg_sumatif, 0.00) AS summative_avg,
    ROUND(
      (COALESCE(a.avg_formatif, 0.00) * (v_w_formative / 100.0)) + 
      (COALESCE(a.avg_sumatif, 0.00) * (v_w_summative / 100.0)),
      2
    ) AS final_score,
    v_kktp AS kktp,
    CASE 
      WHEN (
        (COALESCE(a.avg_formatif, 0.00) * (v_w_formative / 100.0)) + 
        (COALESCE(a.avg_sumatif, 0.00) * (v_w_summative / 100.0))
      ) >= v_kktp THEN true
      ELSE false
    END AS is_passed,
    CASE 
      WHEN (
        (COALESCE(a.avg_formatif, 0.00) * (v_w_formative / 100.0)) + 
        (COALESCE(a.avg_sumatif, 0.00) * (v_w_summative / 100.0))
      ) < v_kktp THEN true
      ELSE false
    END AS needs_remedial
  FROM aggregated a
  ORDER BY a.s_name ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 6. Hapus Data Periode Arsip (Hanya Admin, Transaksional & Dicatat di Audit)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_period_data(
  p_semester_id UUID,
  p_confirmation_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_semester_name TEXT;
  v_is_archived BOOLEAN;
  v_user_id UUID := auth.uid();
BEGIN
  -- 1. Otorisasi: Wajib Admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya administrator yang dapat menghapus data periode.';
  END IF;

  -- 2. Validasi status arsip dan nama periode
  SELECT s.name, ay.is_archived INTO v_semester_name, v_is_archived
  FROM semesters s
  JOIN academic_years ay ON ay.id = s.academic_year_id
  WHERE s.id = p_semester_id;

  IF v_semester_name IS NULL THEN
    RAISE EXCEPTION 'Semester tidak ditemukan.';
  END IF;

  IF v_is_archived IS NOT TRUE THEN
    RAISE EXCEPTION 'Hanya periode dalam tahun ajaran yang sudah diarsipkan yang dapat dihapus.';
  END IF;

  IF p_confirmation_name <> v_semester_name THEN
    RAISE EXCEPTION 'Nama konfirmasi tidak cocok dengan nama semester.';
  END IF;

  -- 3. Hapus data secara transaksional
  -- Hapus skor nilai dan asesmen
  DELETE FROM scores WHERE assessment_id IN (
    SELECT a.id FROM assessments a
    JOIN teaching_assignments ta ON ta.id = a.assignment_id
    WHERE ta.semester_id = p_semester_id
  );
  DELETE FROM assessment_objectives WHERE assessment_id IN (
    SELECT a.id FROM assessments a
    JOIN teaching_assignments ta ON ta.id = a.assignment_id
    WHERE ta.semester_id = p_semester_id
  );
  DELETE FROM assessments WHERE assignment_id IN (
    SELECT id FROM teaching_assignments WHERE semester_id = p_semester_id
  );

  -- Hapus presensi dan agenda
  DELETE FROM attendances WHERE agenda_id IN (
    SELECT a.id FROM agendas a
    JOIN teaching_assignments ta ON ta.id = a.assignment_id
    WHERE ta.semester_id = p_semester_id
  );
  DELETE FROM agenda_objectives WHERE agenda_id IN (
    SELECT a.id FROM agendas a
    JOIN teaching_assignments ta ON ta.id = a.assignment_id
    WHERE ta.semester_id = p_semester_id
  );
  DELETE FROM agendas WHERE assignment_id IN (
    SELECT id FROM teaching_assignments WHERE semester_id = p_semester_id
  );

  -- Hapus jadwal dan TP
  DELETE FROM schedules WHERE assignment_id IN (
    SELECT id FROM teaching_assignments WHERE semester_id = p_semester_id
  );
  DELETE FROM learning_objectives WHERE assignment_id IN (
    SELECT id FROM teaching_assignments WHERE semester_id = p_semester_id
  );

  -- Catat di Audit Log
  INSERT INTO audit_logs (user_id, table_name, record_id, action, old_data, new_data)
  VALUES (
    v_user_id,
    'semesters',
    p_semester_id,
    'delete',
    jsonb_build_object('semester_id', p_semester_id, 'name', v_semester_name),
    jsonb_build_object('status', 'period_data_purged')
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

