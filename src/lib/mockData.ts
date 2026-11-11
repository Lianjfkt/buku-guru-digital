export const MOCK_SETTINGS = {
  id: "00000000-0000-0000-0000-000000000001",
  school_name: "SMA Negeri 1 Teladan",
  address: "Jl. Pendidikan No. 45, Jakarta Selatan",
  principal_name: "Drs. H. Bambang Sudarsono, M.Pd.",
  principal_nip: "197001011995031001",
  attendance_threshold: 80,
  kktp_default: 75,
  remedial_max_score: 75,
};

export const MOCK_SEMESTER = {
  id: "b0000000-0000-0000-0000-000000000001",
  name: "Ganjil 2026/2027",
  start_date: "2026-07-15",
  end_date: "2026-12-20",
  is_active: true,
  locked_until: null,
};

export const MOCK_GURU = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    full_name: "Pak Dedi (Administrator)",
    nip: "198005122005011003",
    email: "admin@sekolah.sch.id",
    role: "admin",
    is_active: true,
    created_at: "2026-07-01T08:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    full_name: "Bu Rina Wulandari, S.Pd.",
    nip: "198503202009022001",
    email: "rina.wulandari@gmail.com",
    role: "guru",
    is_active: true,
    created_at: "2026-07-01T08:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    full_name: "Pak Ahmad Fauzi, M.Kom.",
    nip: "198711152010011004",
    email: "ahmad.fauzi@gmail.com",
    role: "guru",
    is_active: true,
    created_at: "2026-07-01T08:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    full_name: "Bu Sari Rahayu, M.Pd.",
    nip: "198207102008012006",
    email: "sari.rahayu@gmail.com",
    role: "guru",
    is_active: true,
    created_at: "2026-07-01T08:00:00Z",
  },
];

export const MOCK_KELAS = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "X-A",
    grade_level: 10,
    phase: "E",
    homeroom_teacher_id: "22222222-2222-2222-2222-222222222222",
    homeroom_teacher: { id: "22222222-2222-2222-2222-222222222222", full_name: "Bu Rina Wulandari, S.Pd." },
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "X-B",
    grade_level: 10,
    phase: "E",
    homeroom_teacher_id: "44444444-4444-4444-4444-444444444444",
    homeroom_teacher: { id: "44444444-4444-4444-4444-444444444444", full_name: "Bu Sari Rahayu, M.Pd." },
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "XI-IPA-1",
    grade_level: 11,
    phase: "F",
    homeroom_teacher_id: null,
    homeroom_teacher: null,
  },
];

export const MOCK_SUBJECTS = [
  { id: "c0000000-0000-0000-0000-000000000001", name: "Informatika", code: "INF" },
  { id: "c0000000-0000-0000-0000-000000000002", name: "Matematika", code: "MAT" },
  { id: "c0000000-0000-0000-0000-000000000003", name: "Bahasa Indonesia", code: "BIN" },
  { id: "c0000000-0000-0000-0000-000000000004", name: "Bahasa Inggris", code: "BIG" },
];

export const MOCK_SCHOOL_PERIODS = [
  { id: "p1", period_number: 1, start_time: "07:15", end_time: "08:00", is_break: false },
  { id: "p2", period_number: 2, start_time: "08:00", end_time: "08:45", is_break: false },
  { id: "p3", period_number: 3, start_time: "08:45", end_time: "09:30", is_break: false },
  { id: "p4", period_number: 4, start_time: "09:30", end_time: "10:00", is_break: true },
  { id: "p5", period_number: 5, start_time: "10:00", end_time: "10:45", is_break: false },
  { id: "p6", period_number: 6, start_time: "10:45", end_time: "11:30", is_break: false },
  { id: "p7", period_number: 7, start_time: "11:30", end_time: "12:15", is_break: false },
  { id: "p8", period_number: 8, start_time: "12:15", end_time: "13:00", is_break: true },
  { id: "p9", period_number: 9, start_time: "13:00", end_time: "13:45", is_break: false },
  { id: "p10", period_number: 10, start_time: "13:45", end_time: "14:30", is_break: false },
];

export const MOCK_HOLIDAYS = [
  { id: "h1", date: "2026-08-17", name: "Hari Kemerdekaan RI Ke-81", is_national_holiday: true },
  { id: "h2", date: "2026-10-08", name: "Maulid Nabi Muhammad SAW", is_national_holiday: true },
  { id: "h3", date: "2026-12-25", name: "Hari Raya Natal", is_national_holiday: true },
];

export const MOCK_STUDENTS = [
  { id: "e0000000-0000-0000-0000-000000000001", nis: "26001", nisn: "0081234501", full_name: "Aditya Pratama", gender: "L", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000002", nis: "26002", nisn: "0081234502", full_name: "Alina Rahmawati", gender: "P", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000003", nis: "26003", nisn: "0081234503", full_name: "Bayu Setiawan", gender: "L", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000004", nis: "26004", nisn: "0081234504", full_name: "Citra Kirana", gender: "P", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000005", nis: "26005", nisn: "0081234505", full_name: "Dimas Anggara", gender: "L", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000006", nis: "26006", nisn: "0081234506", full_name: "Dinda Permata", gender: "P", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000007", nis: "26007", nisn: "0081234507", full_name: "Eko Prasetyo", gender: "L", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
  { id: "e0000000-0000-0000-0000-000000000008", nis: "26008", nisn: "0081234508", full_name: "Fanny Safitri", gender: "P", class_id: "d0000000-0000-0000-0000-000000000001", class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A" }, is_active: true },
];

export const MOCK_ASSIGNMENTS = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    teacher_id: "22222222-2222-2222-2222-222222222222",
    class_id: "d0000000-0000-0000-0000-000000000001",
    subject_id: "c0000000-0000-0000-0000-000000000001",
    semester_id: "b0000000-0000-0000-0000-000000000001",
    weight_formative: 40,
    weight_summative: 60,
    kktp_default: 75,
    teacher: { id: "22222222-2222-2222-2222-222222222222", full_name: "Bu Rina Wulandari, S.Pd." },
    class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A", grade_level: 10, students: MOCK_STUDENTS },
    subject: { id: "c0000000-0000-0000-0000-000000000001", name: "Informatika", code: "INF" },
    semester: { id: "b0000000-0000-0000-0000-000000000001", name: "Ganjil 2026/2027", is_active: true },
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    teacher_id: "33333333-3333-3333-3333-333333333333",
    class_id: "d0000000-0000-0000-0000-000000000001",
    subject_id: "c0000000-0000-0000-0000-000000000002",
    semester_id: "b0000000-0000-0000-0000-000000000001",
    weight_formative: 40,
    weight_summative: 60,
    kktp_default: 75,
    teacher: { id: "33333333-3333-3333-3333-333333333333", full_name: "Pak Ahmad Fauzi, M.Kom." },
    class: { id: "d0000000-0000-0000-0000-000000000001", name: "X-A", grade_level: 10, students: MOCK_STUDENTS },
    subject: { id: "c0000000-0000-0000-0000-000000000002", name: "Matematika", code: "MAT" },
    semester: { id: "b0000000-0000-0000-0000-000000000001", name: "Ganjil 2026/2027", is_active: true },
  },
];

export const MOCK_SCHEDULES = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    day_of_week: 1, // Senin
    start_period: 1,
    end_period: 3,
    room: "Lab Komputer 1",
    assignment: MOCK_ASSIGNMENTS[0],
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    day_of_week: 3, // Rabu
    start_period: 5,
    end_period: 7,
    room: "Lab Komputer 2",
    assignment: MOCK_ASSIGNMENTS[0],
  },
];

export const MOCK_AGENDAS = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    date: "2026-08-03",
    topic: "Pengenalan Berpikir Komputasional",
    activity: "Diskusi kelompok mengenai 4 pilar berpikir komputasional dan dekomposisi masalah.",
    reflection: "Siswa sangat aktif saat studi kasus pemecahan persoalan nyata.",
    status: "Terlaksana",
    not_held_reason: null,
    assignment_id: "f0000000-0000-0000-0000-000000000001",
    assignment: MOCK_ASSIGNMENTS[0],
    tp: { id: "tp1", code: "TP 1.1", description: "Memahami konsep berpikir komputasional" },
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    date: "2026-08-10",
    topic: "Algoritma Dasar & Flowchart",
    activity: "Praktik pembuatan diagram alir pemecahan masalah.",
    reflection: null,
    status: "Dijadwalkan",
    not_held_reason: null,
    assignment_id: "f0000000-0000-0000-0000-000000000001",
    assignment: MOCK_ASSIGNMENTS[0],
    tp: { id: "tp2", code: "TP 1.2", description: "Menerapkan logika algoritma dasar" },
  },
];

export const MOCK_ATTENDANCES = MOCK_STUDENTS.map((s, idx) => ({
  student_id: s.id,
  status: idx === 2 ? "sakit" : idx === 4 ? "izin" : "hadir",
  note: idx === 2 ? "Surat dokter terlampir" : idx === 4 ? "Izin keluarga" : null,
}));

export const MOCK_ASSESSMENTS = [
  {
    id: "40000000-0000-0000-0000-000000000001",
    title: "Kuis Formatif: Berpikir Komputasional",
    category: "formatif",
    type: "lainnya",
    date: "2026-08-10",
    max_score: 100,
    assignment_id: "f0000000-0000-0000-0000-000000000001",
    assignment: MOCK_ASSIGNMENTS[0],
    tp: { id: "tp1", code: "TP 1.1", description: "Memahami konsep berpikir komputasional" },
    scores: MOCK_STUDENTS.map((s, idx) => ({
      student_id: s.id,
      score: idx === 2 ? 65 : 80 + (idx * 2) % 20,
      remedial_score: idx === 2 ? 75 : null,
      note: idx === 2 ? "Tuntas setelah remedi" : "Baik",
    })),
    remedial_max_rule: "kktp",
  },
  {
    id: "40000000-0000-0000-0000-000000000002",
    title: "SLM 1: Algoritma & Logika",
    category: "sumatif",
    type: "SLM",
    date: "2026-09-01",
    max_score: 100,
    assignment_id: "f0000000-0000-0000-0000-000000000001",
    assignment: MOCK_ASSIGNMENTS[0],
    tp: { id: "tp2", code: "TP 1.2", description: "Menerapkan logika algoritma dasar" },
    scores: [],
    remedial_max_rule: "kktp",
  },
];

export const MOCK_STUDENT_NOTES = [
  {
    id: "sn1",
    student_id: "e0000000-0000-0000-0000-000000000001",
    category: "prestasi",
    note: "Meraih Juara 2 Lomba Karya Ilmiah Remaja (KIR) tingkat Kota.",
    date: "2026-08-15",
  },
  {
    id: "sn2",
    student_id: "e0000000-0000-0000-0000-000000000003",
    category: "sikap",
    note: "Menunjukkan peningkatan kedisiplinan dan keaktifan di kelas.",
    date: "2026-08-20",
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: "al1",
    table_name: "scores",
    operation: "INSERT",
    record_id: "sc-001",
    old_data: null,
    new_data: { assessment_id: "40000000-0000-0000-0000-000000000001", score: 88 },
    created_at: "2026-08-10T10:15:00Z",
    user: { id: "22222222-2222-2222-2222-222222222222", full_name: "Bu Rina Wulandari, S.Pd.", role: "guru" },
  },
  {
    id: "al2",
    table_name: "attendances",
    operation: "INSERT",
    record_id: "att-001",
    old_data: null,
    new_data: { agenda_id: "30000000-0000-0000-0000-000000000001", total_records: 40 },
    created_at: "2026-08-03T09:30:00Z",
    user: { id: "22222222-2222-2222-2222-222222222222", full_name: "Bu Rina Wulandari, S.Pd.", role: "guru" },
  },
];

