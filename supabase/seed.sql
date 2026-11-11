-- ==============================================================================
-- SEED DATA: supabase/seed.sql
-- DESKRIPSI: Data Awal Simulasi: 1 Admin, 3 Guru (1 Wali Kelas), 3 Kelas, 40 Siswa,
--            Mapel, Jam Pelajaran, Hari Libur, Penugasan, Jadwal, TP, Agenda, Presensi, Asesmen & Nilai
-- ==============================================================================

-- 1. Singleton App Settings
INSERT INTO app_settings (
  school_name,
  address,
  principal_name,
  principal_nip,
  attendance_threshold,
  kktp_default,
  remedial_max_score
) VALUES (
  'SMA Negeri 1 Teladan',
  'Jl. Pendidikan No. 45, Jakarta Selatan',
  'Drs. H. Bambang Sudarsono, M.Pd.',
  '197001011995031001',
  80.00,
  75.00,
  75.00
) ON CONFLICT DO NOTHING;

-- 2. Master Jam Pelajaran
INSERT INTO school_periods (period_number, start_time, end_time, is_break) VALUES
(1, '07:15', '08:00', false),
(2, '08:00', '08:45', false),
(3, '08:45', '09:30', false),
(4, '09:30', '10:00', true),  -- Istirahat 1
(5, '10:00', '10:45', false),
(6, '10:45', '11:30', false),
(7, '11:30', '12:15', false),
(8, '12:15', '13:00', true),  -- Istirahat 2 (Dzuhur)
(9, '13:00', '13:45', false),
(10, '13:45', '14:30', false)
ON CONFLICT DO NOTHING;

-- 3. Tahun Ajaran & Semester
INSERT INTO academic_years (id, name, is_active, is_archived) VALUES
('a0000000-0000-0000-0000-000000000001', '2026/2027', true, false)
ON CONFLICT DO NOTHING;

INSERT INTO semesters (id, academic_year_id, name, start_date, end_date, is_active, locked_until) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Ganjil', '2026-07-15', '2026-12-20', true, NULL)
ON CONFLICT DO NOTHING;

-- 4. Hari Libur
INSERT INTO holidays (date, name, semester_id) VALUES
('2026-08-17', 'Hari Kemerdekaan RI', 'b0000000-0000-0000-0000-000000000001'),
('2026-10-08', 'Maulid Nabi Muhammad SAW', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 5. Mata Pelajaran
INSERT INTO subjects (id, name, code) VALUES
('c0000000-0000-0000-0000-000000000001', 'Informatika', 'INF'),
('c0000000-0000-0000-0000-000000000002', 'Matematika', 'MAT'),
('c0000000-0000-0000-0000-000000000003', 'Bahasa Indonesia', 'BIN'),
('c0000000-0000-0000-0000-000000000004', 'Bahasa Inggris', 'BIG')
ON CONFLICT DO NOTHING;

-- 6. Pengguna Dummy (Auth Users & Profiles)
-- Password untuk simulasi lokal: "Password123!"
-- UUID User:
-- Admin: 11111111-1111-1111-1111-111111111111
-- Guru 1 (Wali Kelas): 22222222-2222-2222-2222-222222222222
-- Guru 2: 33333333-3333-3333-3333-333333333333
-- Guru 3: 44444444-4444-4444-4444-444444444444

INSERT INTO profiles (id, full_name, nip, role, is_active, must_change_password) VALUES
('11111111-1111-1111-1111-111111111111', 'Pak Dedi (Administrator)', '198005122005011003', 'admin', true, false),
('22222222-2222-2222-2222-222222222222', 'Bu Rina Wulandari, S.Pd.', '198503202009022001', 'guru', true, false),
('33333333-3333-3333-3333-333333333333', 'Pak Ahmad Fauzi, M.Kom.', '198711152010011004', 'guru', true, false),
('44444444-4444-4444-4444-444444444444', 'Bu Sari Rahayu, M.Pd.', '198207102008012006', 'guru', true, false)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 7. Kelas (Bu Rina sebagai Wali Kelas X-A)
INSERT INTO classes (id, name, grade_level, phase, homeroom_teacher_id) VALUES
('d0000000-0000-0000-0000-000000000001', 'X-A', 10, 'E', '22222222-2222-2222-2222-222222222222'),
('d0000000-0000-0000-0000-000000000002', 'X-B', 10, 'E', '44444444-4444-4444-4444-444444444444'),
('d0000000-0000-0000-0000-000000000003', 'XI-IPA-1', 11, 'F', NULL)
ON CONFLICT DO NOTHING;

-- 8. Siswa (40 Siswa Contoh di Kelas X-A)
INSERT INTO students (id, full_name, nis, nisn, gender, class_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'Aditya Pratama', '26001', '0081234501', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000002', 'Alina Rahmawati', '26002', '0081234502', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000003', 'Bayu Setiawan', '26003', '0081234503', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000004', 'Citra Kirana', '26004', '0081234504', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000005', 'Dimas Anggara', '26005', '0081234505', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000006', 'Dinda Permata', '26006', '0081234506', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000007', 'Eko Prasetyo', '26007', '0081234507', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000008', 'Fanny Safitri', '26008', '0081234508', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000009', 'Gilang Ramadhan', '26009', '0081234509', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000010', 'Hana Novita', '26010', '0081234510', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000011', 'Irfan Hakim', '26011', '0081234511', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000012', 'Jessica Iskandar', '26012', '0081234512', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000013', 'Kevin Julio', '26013', '0081234513', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000014', 'Larasati Putri', '26014', '0081234514', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000015', 'Muhammad Rizky', '26015', '0081234515', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000016', 'Nabila Syakieb', '26016', '0081234516', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000017', 'Oki Setiana', '26017', '0081234517', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000018', 'Panji Gumilang', '26018', '0081234518', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000019', 'Qori Sandioriva', '26019', '0081234519', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000020', 'Rafi Ahmad', '26020', '0081234520', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000021', 'Rania Zulaikha', '26021', '0081234521', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000022', 'Satria Baja', '26022', '0081234522', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000023', 'Tia Ivanka', '26023', '0081234523', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000024', 'Umar bin Khattab', '26024', '0081234524', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000025', 'Vina Panduwinata', '26025', '0081234525', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000026', 'Wahyu Hidayat', '26026', '0081234526', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000027', 'Xenia Melati', '26027', '0081234527', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000028', 'Yusuf Mansur', '26028', '0081234528', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000029', 'Zahra Amalia', '26029', '0081234529', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000030', 'Alif Ba Ta', '26030', '0081234530', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000031', 'Bella Saphira', '26031', '0081234531', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000032', 'Candra Wijaya', '26032', '0081234532', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000033', 'Dewi Sandra', '26033', '0081234533', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000034', 'Erlangga Sakti', '26034', '0081234534', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000035', 'Farida Pasha', '26035', '0081234535', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000036', 'Gading Marten', '26036', '0081234536', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000037', 'Helena Warren', '26037', '0081234537', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000038', 'Indra Bekti', '26038', '0081234538', 'L', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000039', 'Julia Perez', '26039', '0081234539', 'P', 'd0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000040', 'Kunto Aji', '26040', '0081234540', 'L', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT (nis) DO NOTHING;

-- 9. Penugasan Mengajar (Bu Rina mengajar Informatika di Kelas X-A Semester Ganjil)
INSERT INTO teaching_assignments (
  id, teacher_id, class_id, subject_id, semester_id, weight_formative, weight_summative, kktp_default
) VALUES
('f0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 40.00, 60.00, 75.00),
('f0000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 40.00, 60.00, 75.00)
ON CONFLICT (teacher_id, class_id, subject_id, semester_id) DO NOTHING;

-- 10. Jadwal Mengajar (Bu Rina: Senin Jam 1-3 di Lab Komputer)
INSERT INTO schedules (id, assignment_id, day_of_week, start_period, end_period, room, notes) VALUES
('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1, 1, 3, 'Lab Komputer 1', 'Membawa laptop/modul')
ON CONFLICT DO NOTHING;

-- 11. Tujuan Pembelajaran (TP)
INSERT INTO learning_objectives (id, assignment_id, code, description, sort_order, kktp) VALUES
('20000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'TP 1.1', 'Memahami konsep berpikir komputasional dan dekomposisi persoalan.', 1, 75.00),
('20000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'TP 1.2', 'Menerapkan logika algoritma dan pemrograman terstruktur dasar.', 2, 75.00)
ON CONFLICT DO NOTHING;

-- 12. Agenda Pertemuan & Presensi Contoh
INSERT INTO agendas (id, assignment_id, schedule_id, date, start_period, end_period, topic, activity, reflection, status) VALUES
('30000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-08-03', 1, 3, 'Pengenalan Berpikir Komputasional', 'Diskusi kelompok dan studi kasus pemecahan masalah', 'Sebagian besar siswa antusias dan paham konsep dasar', 'Terlaksana')
ON CONFLICT DO NOTHING;

-- Presensi untuk 40 Siswa pada Agenda Pertama
INSERT INTO attendances (agenda_id, student_id, status, note)
SELECT 
  '30000000-0000-0000-0000-000000000001',
  id,
  CASE 
    WHEN nis = '26003' THEN 'sakit'::attendance_status
    WHEN nis = '26005' THEN 'izin'::attendance_status
    ELSE 'hadir'::attendance_status
  END,
  CASE 
    WHEN nis = '26003' THEN 'Surat dokter terlampir'
    WHEN nis = '26005' THEN 'Izin acara keluarga'
    ELSE NULL
  END
FROM students
WHERE class_id = 'd0000000-0000-0000-0000-000000000001'
ON CONFLICT (agenda_id, student_id) DO NOTHING;

-- 13. Asesmen & Nilai Contoh
INSERT INTO assessments (id, assignment_id, title, category, type, date, max_score) VALUES
('40000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Kuis Berpikir Komputasional', 'formatif', 'lainnya', '2026-08-10', 100.00),
('40000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'SLM 1: Algoritma & Logika', 'sumatif', 'SLM', '2026-09-01', 100.00)
ON CONFLICT DO NOTHING;

-- Nilai untuk beberapa siswa pada Kuis Formatif
INSERT INTO scores (assessment_id, student_id, score, remedial_score, needs_enrichment)
SELECT 
  '40000000-0000-0000-0000-000000000001',
  id,
  CASE 
    WHEN nis = '26001' THEN 88.00
    WHEN nis = '26002' THEN 92.00
    WHEN nis = '26003' THEN 65.00
    ELSE 80.00
  END,
  CASE 
    WHEN nis = '26003' THEN 75.00
    ELSE NULL
  END,
  CASE 
    WHEN nis = '26002' THEN true
    ELSE false
  END
FROM students
WHERE class_id = 'd0000000-0000-0000-0000-000000000001'
ON CONFLICT (assessment_id, student_id) DO NOTHING;
