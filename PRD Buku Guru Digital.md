# PRD: Ruang Guru

*Product Requirements Document | Versi 1.1 | 11 November 2026 | Status: Draft untuk ditinjau*

## 1. Ringkasan Eksekutif

**Ruang Guru** (nama sementara) adalah aplikasi web untuk satu sekolah yang membantu guru mengelola jadwal mengajar, agenda mengajar, daftar hadir siswa, dan penilaian formatif/sumatif sesuai Kurikulum Merdeka. Admin sekolah mengelola data master dan memantau kepatuhan administrasi guru. Sebagian guru juga berperan sebagai wali kelas dengan akses baca ke rekap kelasnya.

Aplikasi dibangun dengan Next.js, Supabase (Postgres, Auth, RLS, Storage), dan di-deploy di Vercel, dengan tampilan glassmorphism yang mobile-first.

**Nilai utama:** administrasi guru yang biasanya tersebar di buku, Excel, dan chat menjadi satu tempat; presensi satu kelas selesai kurang dari 1 menit; rekap kehadiran dan nilai otomatis; ekspor Excel/PDF siap cetak.

## 2. Latar Belakang dan Masalah

| Masalah | Dampak |
| --- | --- |
| Jadwal, agenda, presensi, dan nilai dicatat terpisah (buku jurnal, Excel, kertas) | Pencatatan ganda, mudah hilang, sulit direkap |
| Rekap kehadiran dan nilai akhir dihitung manual | Memakan waktu, rawan salah hitung, terutama saat akhir semester |
| Penilaian Kurikulum Merdeka (TP, formatif, sumatif) tidak punya alat bantu yang pas | Ketercapaian TP sulit dipantau per siswa |
| Admin tidak punya gambaran real-time guru mana yang belum mengisi presensi/agenda | Keterlambatan administrasi dan laporan |
| Data siswa tersebar di banyak berkas tanpa kontrol akses | Risiko privasi dan kebocoran data |

## 3. Tujuan dan Metrik Keberhasilan

### 3.1 Tujuan produk

1. Mempercepat pencatatan harian guru (jadwal, agenda, presensi, nilai).
2. Menghasilkan rekap dan laporan otomatis yang akurat.
3. Menjaga keamanan data siswa melalui pembatasan akses per peran.
4. Memberi admin visibilitas kepatuhan administrasi tanpa harus menagih satu per satu.

### 3.2 Metrik keberhasilan

| Metrik | Target | Cara ukur |
| --- | --- | --- |
| Waktu mengisi presensi satu kelas (30-40 siswa) | < 60 detik | Uji pengguna + timestamp |
| Guru aktif mingguan dari seluruh guru terdaftar | >= 80% setelah 1 bulan | Audit log / analitik |
| Presensi terisi untuk agenda yang terlaksana | >= 95% | Query agenda vs presensi |
| Kesalahan perhitungan nilai akhir | 0 pada uji otomatis | Unit test |
| Kelulusan uji RLS antar guru | 100% | Test RLS di CI |
| Skor Lighthouse mobile | >= 85 | Lighthouse CI |
| Kepuasan guru (survei sederhana) | >= 4 dari 5 | Survei setelah 1 semester |

### 3.3 Di luar cakupan (Non-Goals) versi 1

- Akses siswa dan orang tua (portal siswa/wali murid).
- Penyusunan jadwal otomatis lintas guru (auto-scheduling).
- Integrasi langsung ke Dapodik, e-Rapor, atau sistem pemerintah.
- Aplikasi native iOS/Android (cukup web responsif dan PWA).
- Banyak sekolah (multi-tenant). Versi 1 untuk satu sekolah.
- Penilaian sikap/P5 yang lengkap (hanya catatan perkembangan).
- Pembayaran, keuangan, atau PPDB.

## 4. Pengguna dan Persona

| Peran | Deskripsi | Kebutuhan utama |
| --- | --- | --- |
| **Admin** | Operator/tata usaha atau wakil kepala sekolah | Kelola master data dan akun guru, pantau kepatuhan, kunci periode, lihat audit log |
| **Guru** | Pengajar mapel di satu atau lebih kelas | Input jadwal, agenda, presensi, TP, nilai; rekap dan ekspor |
| **Wali Kelas** | Guru dengan perwalian satu kelas | Semua kebutuhan guru, plus melihat leger dan rekap semua mapel kelasnya (baca saja) |

**Persona 1: Bu Rina (guru, 38 tahun).** Mengajar 5 kelas, lebih sering memakai HP di sela jam pelajaran. Sinyal sekolah kadang buruk. Ingin presensi cepat dan tidak ingin mengetik ulang data yang sama.

**Persona 2: Pak Dedi (admin/TU, 45 tahun).** Mengurus data siswa dan akun guru, sering diminta rekap mendadak oleh kepala sekolah. Ingin impor data massal dan laporan sekali klik.

**Persona 3: Bu Sari (wali kelas, 42 tahun).** Perlu rekap kehadiran dan nilai seluruh mapel di kelasnya untuk keperluan rapor dan pertemuan orang tua.

## 5. Ruang Lingkup Rilis

| Fase | Isi |
| --- | --- |
| **MVP (Fase 1)** | Auth (login Google dan email/password), peran, master data, penugasan, jadwal mengajar, agenda, presensi, TP dan penilaian, rekap otomatis, ekspor Excel/PDF dasar, dashboard, RLS dan audit log |
| **Fase 2** | Wali kelas (leger, rekap gabungan), impor siswa dari Excel, remedial/pengayaan, catatan perkembangan, profil siswa, notifikasi dalam aplikasi, penguncian periode, arsip tahun ajaran, kop dan tanda tangan PDF |
| **Fase 3** | PWA dengan presensi offline, command palette, cadangan data, Sentry, optimasi performa lanjutan, penghapusan data per periode |

Catatan: prioritas P0 = wajib MVP, P1 = Fase 2, P2 = Fase 3.

## 6. Persyaratan Fungsional

### 6.1 Autentikasi dan Manajemen Akun

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| AUTH-01 | Login email + password; logout; sesi aman (cookie httpOnly) | P0 |
| AUTH-02 | Admin membuat, mengubah, menonaktifkan akun guru dan mereset password | P0 |
| AUTH-03 | Pengguna yang memakai password wajib menggantinya saat login pertama; password minimal 10 karakter | P0 |
| AUTH-04 | Rate limit pada login dan aksi sensitif | P0 |
| AUTH-05 | Akun nonaktif tidak dapat masuk | P0 |
| AUTH-06 | Middleware melindungi route berdasarkan peran | P0 |
| AUTH-07 | Login dengan akun Google (Gmail) melalui Supabase Auth; hanya email yang sudah didaftarkan admin yang dapat masuk (pendaftaran mandiri dinonaktifkan) | P0 |
| AUTH-08 | Admin mendaftarkan guru dengan alamat Gmail; login Google pertama menautkan akun ke profil berdasarkan email terverifikasi. Email + password tetap tersedia untuk guru tanpa Gmail | P0 |

### 6.2 Master Data (Admin)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| MD-01 | CRUD tahun ajaran dan semester (satu semester aktif) | P0 |
| MD-02 | CRUD kelas (nama, tingkat, fase A-F) | P0 |
| MD-03 | CRUD siswa (nama, NIS unik, NISN, gender, kelas) | P0 |
| MD-04 | CRUD mata pelajaran | P0 |
| MD-05 | CRUD jam pelajaran (jam ke-, mulai, selesai, istirahat) | P0 |
| MD-06 | CRUD hari libur | P0 |
| MD-07 | Penugasan mengajar: guru, kelas, mapel, semester (kombinasi unik) | P0 |
| MD-08 | Penetapan wali kelas per kelas | P1 |
| MD-09 | Impor siswa dari Excel/CSV dengan template, pratinjau, validasi, laporan error, dan proses idempoten | P1 |
| MD-10 | Soft delete untuk data master; data historis tidak hilang | P0 |

### 6.3 Jadwal Mengajar (Guru)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| JD-01 | Guru menambah/ubah/hapus jadwal miliknya: hari, jam ke- mulai-selesai, penugasan (kelas + mapel), ruangan, catatan | P0 |
| JD-02 | Waktu mulai/selesai terisi otomatis dari master jam pelajaran | P0 |
| JD-03 | Tampilan grid mingguan (desktop) dan satu hari per layar dengan tab hari (mobile) | P0 |
| JD-04 | Blokir jadwal yang bentrok dengan jadwal guru sendiri (validasi client dan server) | P0 |
| JD-05 | Peringatan (tidak memblokir) jika kelas sudah dipakai guru lain pada hari/jam yang sama | P0 |
| JD-06 | Salin jadwal dari semester sebelumnya | P1 |
| JD-07 | Ekspor jadwal mingguan ke PDF dan Excel | P1 |
| JD-08 | Admin melihat jadwal semua guru/kelas dan mendeteksi bentrok (baca saja) | P1 |

### 6.4 Agenda Mengajar

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| AG-01 | CRUD agenda: tanggal, jam ke-, kelas, mapel, topik, TP, kegiatan, refleksi, status (Dijadwalkan/Terlaksana/Tidak Terlaksana) dan alasan | P0 |
| AG-02 | Daftar agenda dengan filter tanggal, kelas, mapel, status; tampilan kalender mingguan/bulanan | P0 |
| AG-03 | Buat agenda otomatis dari jadwal untuk rentang tanggal, melewati hari libur, tanpa duplikat | P0 |
| AG-04 | Form agenda baru dapat memilih dari jadwal saya | P0 |
| AG-05 | Tombol cepat ke presensi dari agenda | P0 |
| AG-06 | Duplikasi agenda ke pertemuan berikutnya | P1 |

### 6.5 Daftar Hadir Siswa

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| PR-01 | Satu agenda = satu sesi presensi; status Hadir/Sakit/Izin/Alpa + catatan | P0 |
| PR-02 | Tombol Tandai semua hadir; simpan dengan upsert; indikator tersimpan | P0 |
| PR-03 | Rekap kehadiran per siswa/kelas/periode (jumlah H/S/I/A dan persentase) | P0 |
| PR-04 | Sorot siswa di bawah ambang kehadiran (default 80%, dapat diatur) | P0 |
| PR-05 | UI mobile dengan target sentuh >= 44 px; status disertai label teks | P0 |
| PR-06 | Mode offline: antrian IndexedDB, badge Menunggu sinkronisasi, sinkron otomatis, konflik diselesaikan berdasarkan updated\_at | P2 |

### 6.6 Penilaian Kurikulum Merdeka

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| PN-01 | Guru mengelola daftar TP per penugasan (kode, deskripsi, urutan, KKTP) | P0 |
| PN-02 | Asesmen formatif (terkait 1+ TP) dan sumatif (SLM, SAS, SAT, lainnya) | P0 |
| PN-03 | Input nilai tabel siswa x asesmen: navigasi Tab/Enter/panah, paste dari Excel, validasi 0-100, nilai boleh kosong, simpan otomatis dengan indikator | P0 |
| PN-04 | Bobot formatif vs sumatif per penugasan (default 40:60) | P0 |
| PN-05 | Rekap otomatis: rata-rata formatif, rata-rata sumatif, nilai akhir berbobot | P0 |
| PN-06 | Ketercapaian per TP (Belum Tercapai/Cukup/Tercapai/Sangat Tercapai) dengan ambang yang dapat diatur | P0 |
| PN-07 | Distribusi nilai kelas dalam grafik | P1 |
| PN-08 | Remedial: nilai asli tetap tersimpan, nilai remedial dibatasi maksimum sesuai pengaturan; penanda pengayaan | P1 |
| PN-09 | Draft deskripsi capaian per siswa yang dapat diedit guru | P1 |

### 6.7 Wali Kelas, Profil Siswa, dan Catatan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| WK-01 | Wali kelas membaca rekap kehadiran dan nilai semua mapel di kelasnya (tanpa hak ubah) | P1 |
| WK-02 | Leger nilai kelas (siswa x mapel) dan rekap kehadiran gabungan, dengan ekspor | P1 |
| PS-01 | Profil siswa: identitas, grafik kehadiran, nilai per mapel, ketercapaian TP, catatan | P1 |
| CN-01 | Catatan perkembangan siswa (akademik/sikap/perilaku/prestasi) terlihat oleh pembuat, wali kelas, dan admin | P1 |

### 6.8 Ekspor dan Laporan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| EX-01 | Ekspor Excel: rekap kehadiran, daftar nilai, agenda | P0 |
| EX-02 | Ekspor PDF dengan format rapi dan siap cetak | P0 |
| EX-03 | PDF berkop (nama, alamat, logo sekolah) dan kolom tanda tangan guru/wali kelas/kepala sekolah | P1 |
| EX-04 | Ekspor hanya sesuai hak akses pengguna | P0 |

### 6.9 Dashboard dan Notifikasi

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| DB-01 | Dashboard guru: jadwal hari ini (penanda sesi berlangsung), agenda mendatang, presensi belum diisi, ringkasan nilai | P0 |
| DB-02 | Dashboard admin: jumlah guru/siswa/kelas, kehadiran sekolah, agenda belum terlaksana, guru belum isi presensi | P0 |
| DB-03 | Siswa perlu perhatian (kehadiran rendah atau nilai di bawah KKTP) | P1 |
| NT-01 | Notifikasi dalam aplikasi (ikon lonceng, jumlah belum dibaca): presensi belum diisi, agenda hari ini, periode akan dikunci, perubahan penugasan | P1 |

### 6.10 Administrasi Sistem

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| AD-01 | Pengaturan sekolah: nama, alamat, logo, kepala sekolah, NIP, tanda tangan | P1 |
| AD-02 | Pengaturan ambang: kehadiran, KKTP default, kategori ketercapaian, batas remedial | P0 |
| AD-03 | Penguncian periode: data sebelum tanggal tertentu hanya dapat diubah admin dengan alasan tercatat | P1 |
| AD-04 | Arsip tahun ajaran (read-only) | P1 |
| AD-05 | Audit log: pencatatan perubahan nilai, presensi, agenda, penugasan, siswa, akun; penampil dengan filter | P0 |
| AD-06 | Ekspor cadangan data (Excel/JSON) | P2 |
| AD-07 | Hapus data per periode: admin menghapus permanen data semester/tahun ajaran tertentu (agenda, presensi, nilai, jadwal, TP) setelah konfirmasi berlapis dan hanya untuk periode yang sudah diarsipkan; aksi dicatat di audit log. Dirilis bersama atau setelah AD-06 (cadangan) | P2 |
| AD-08 | Retensi: data disimpan tanpa batas waktu sampai admin menghapusnya per periode; tidak ada penghapusan otomatis | P0 |

## 7. Alur Pengguna Utama

**Alur A: Pengaturan awal semester (Admin)**

1. Admin membuat tahun ajaran dan semester aktif.
2. Admin menambah kelas, mapel, jam pelajaran, dan hari libur.
3. Admin mengimpor siswa dari Excel dan memeriksa laporan validasi.
4. Admin membuat akun guru, lalu membuat penugasan mengajar dan menetapkan wali kelas.
5. Guru menerima akun dan wajib mengganti password saat login pertama.

**Alur B: Persiapan guru**

1. Guru membuka menu Jadwal dan memilih penugasan miliknya, lalu mengisi hari dan jam.
2. Sistem memvalidasi bentrok dan menyimpan jadwal.
3. Guru menyusun daftar TP untuk tiap penugasan.
4. Guru memakai Buat agenda dari jadwal untuk rentang tanggal tertentu; agenda berstatus Dijadwalkan terbentuk, melewati hari libur.

**Alur C: Hari mengajar**

1. Guru membuka Dashboard dan melihat Jadwal hari ini.
2. Guru membuka sesi, mengisi topik dan TP, lalu menekan Isi presensi.
3. Guru menekan Tandai semua hadir, mengubah siswa yang tidak hadir, dan sistem menyimpan.
4. Guru menandai agenda Terlaksana dan menulis refleksi singkat.

**Alur D: Penilaian**

1. Guru membuat asesmen formatif atau sumatif dan menautkannya ke TP.
2. Guru menginput atau menempelkan nilai dari Excel pada tabel nilai.
3. Sistem menghitung rata-rata, nilai akhir berbobot, dan ketercapaian TP.
4. Guru menandai siswa remedial/pengayaan dan mengekspor daftar nilai ke PDF/Excel.

**Alur E: Akhir semester (Wali Kelas dan Admin)**

1. Wali kelas membuka leger dan rekap kehadiran gabungan, lalu mengekspornya.
2. Admin memeriksa kepatuhan (presensi belum terisi), lalu mengunci periode.
3. Admin mengarsipkan tahun ajaran saat pergantian.

## 8. Persyaratan Non-Fungsional

| Kategori | Persyaratan |
| --- | --- |
| **Performa** | Halaman utama dimuat < 2,5 detik pada 4G; interaksi input nilai/presensi < 200 ms (optimistic update); paginasi sisi server untuk daftar besar |
| **Ketersediaan** | Mengikuti SLA Vercel dan Supabase; tampilkan pesan ramah saat layanan bermasalah |
| **Skalabilitas** | Target awal: 1 sekolah, hingga 100 guru, 2.000 siswa, 5 tahun data |
| **Keamanan** | RLS aktif di semua tabel (default deny); service role key hanya di server; validasi zod di server; security headers; bucket Storage privat dengan signed URL |
| **Privasi** | Data siswa hanya terlihat oleh yang berhak; tidak ada data pribadi di log; ekspor mengikuti hak akses |
| **Aksesibilitas** | Kontras WCAG AA; navigasi keyboard; label form; dukung prefers-reduced-motion dan prefers-reduced-transparency |
| **Kompatibilitas** | Chrome, Edge, Firefox, Safari dua versi terakhir; HP Android kelas menengah; layar 360 px hingga desktop |
| **Lokalisasi** | Seluruh antarmuka Bahasa Indonesia; format tanggal dan angka lokal (WIB) |
| **Keandalan data** | Soft delete, audit log tidak dapat diubah/dihapus, perhitungan penting dilakukan di database |
| **Kemudahan pemeliharaan** | TypeScript strict, struktur modular per fitur, CI (lint, typecheck, unit test, build) |
| **Observabilitas** | Penanganan error terpusat; Sentry opsional |

## 9. Model Data (Ringkas)

**Entitas utama:** profiles, academic\_years, semesters, classes, students, subjects, school\_periods, holidays, teaching\_assignments, schedules, learning\_objectives, agendas, agenda\_objectives, attendances, assessments, assessment\_objectives, scores, student\_notes, notifications, app\_settings, audit\_logs.

**Relasi kunci:**

- Satu *teaching\_assignment* menghubungkan guru, kelas, mapel, dan semester; menjadi induk bagi jadwal, TP, agenda, dan asesmen. Karena itu RLS cukup berpatokan pada kepemilikan penugasan.
- *agendas* memiliki satu set *attendances* (satu baris per siswa).
- *assessments* memiliki banyak *scores* (satu baris per siswa) dan tertaut ke TP.
- *classes.homeroom\_teacher\_id* menandai wali kelas.

**Aturan data penting:**

- Unik: NIS siswa; kombinasi penugasan (guru, kelas, mapel, semester); (agenda\_id, student\_id) pada presensi; (assessment\_id, student\_id) pada nilai; (schedule\_id, tanggal) pada agenda.
- Pembatasan: nilai 0-100; end\_period >= start\_period; day\_of\_week 1-6.
- Penghitungan rekap kehadiran/nilai/bentrok diimplementasikan sebagai SQL function atau view.
- Diagram ERD lengkap disimpan di `docs/ERD.md`.

## 10. Keamanan dan Privasi

| Peran | Akses |
| --- | --- |
| Admin | Tulis pada master data dan penugasan; baca seluruh data guru; baca audit log; kunci periode |
| Guru | Baca/tulis hanya data dari penugasannya (jadwal, agenda, presensi, TP, asesmen, nilai, catatan buatannya); baca siswa dan kelas yang terkait |
| Wali Kelas | Seperti guru, ditambah baca saja untuk data kelas perwaliannya |

**Prinsip:**

- Default deny pada RLS; helper SECURITY DEFINER: is\_admin(), is\_my\_assignment(), is\_homeroom\_of(), can\_view\_student().
- Penjaga penguncian pada trigger database sehingga tidak bisa dilewati dari client.
- Audit log hanya dapat ditambah (append-only) dan dibaca admin.
- Pembuatan akun melalui Admin API di server saja.
- Pengujian RLS otomatis: guru A tidak dapat membaca/mengubah data guru B.
- Pertimbangkan kepatuhan UU Pelindungan Data Pribadi (UU PDP): data minimum, akses berbasis peran, dan retensi data sesuai keputusan admin (data disimpan sampai admin menghapusnya per periode).

**Login Google:** hanya email yang sudah didaftarkan admin yang dapat masuk (pendaftaran mandiri di Supabase dinonaktifkan), akun ditautkan lewat email yang terverifikasi Google, dan akun nonaktif (is\_active = false) ditolak oleh middleware. Guru yang berhenti atau pindah cukup dinonaktifkan oleh admin. Sarankan guru mengaktifkan verifikasi 2 langkah pada akun Google mereka.

## 11. Desain Antarmuka (UI/UX)

- **Tema:** glassmorphism (panel semi-transparan, backdrop blur, border tipis, radius besar) di atas latar gradien mesh; mode terang dan gelap.
- **Keterbacaan lebih utama dari efek:** tabel dan input memakai lapisan glass yang lebih solid; kontras minimal WCAG AA; ada fallback tanpa blur.
- **Mobile-first:** sidebar di desktop, bottom navigation/drawer di HP; presensi dan input nilai dioptimalkan untuk layar kecil.
- **Komponen standar:** GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal, GlassTable, DataTable, StatusBadge, EmptyState, Skeleton, ConfirmDialog.
- **Umpan balik:** skeleton saat memuat, toast sukses/gagal, konfirmasi sebelum hapus, empty state informatif, halaman error yang ramah.
- **Warna status presensi:** Hadir (hijau), Sakit (kuning), Izin (biru), Alpa (merah), selalu disertai teks.
- **Performa visual:** batasi backdrop-filter pada elemen berulang seperti baris tabel.

**Peta navigasi**

| Peran | Halaman |
| --- | --- |
| Guru | Dashboard, Jadwal, Agenda (+ Presensi), Kehadiran, Penilaian, Profil Siswa, Wali Kelas, Notifikasi |
| Admin | Dashboard, Guru, Siswa (+ Impor), Kelas, Mapel, Penugasan, Jam Pelajaran, Hari Libur, Jadwal, Tahun Ajaran, Rekap, Pengaturan, Audit Log, Cadangan |

## 12. Arsitektur dan Teknologi

| Lapisan | Pilihan |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript strict, Tailwind CSS |
| Backend/BaaS | Supabase: Postgres, Auth, RLS, Storage |
| Hosting | Vercel (aplikasi), Supabase Cloud (database) |
| Form dan validasi | react-hook-form + zod |
| State data | TanStack Query |
| Ekspor | exceljs (Excel), jspdf + autotable atau react-pdf (PDF) |
| Grafik | recharts |
| PWA/offline | Serwist/next-pwa, IndexedDB (idb) |
| Kualitas | ESLint, Prettier, Vitest, Playwright, GitHub Actions |

**Keputusan arsitektur:**

- Logika perhitungan (rekap, bentrok, generate agenda) berada di database agar konsisten dan dapat diuji.
- Mutasi lewat Server Actions/Route Handlers dengan validasi zod; hasil berbentuk { ok, error }.
- Tipe database dihasilkan otomatis dari Supabase (supabase gen types).
- Environment: NEXT\_PUBLIC\_SUPABASE\_URL, NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY, SUPABASE\_SERVICE\_ROLE\_KEY, NEXT\_PUBLIC\_SENTRY\_DSN (opsional).

**Login Google:** memakai provider Google pada Supabase Auth. OAuth client ID dan secret dibuat di Google Cloud Console dan dimasukkan ke dashboard Supabase, bukan ke kode. Daftarkan URL produksi Vercel dan URL lokal sebagai redirect URL.

## 13. Rencana Rilis dan Tonggak

| Tonggak | Isi | Kriteria selesai |
| --- | --- | --- |
| M1: Fondasi | Project, tooling, desain sistem glass, layout, skema DB, RLS, seed | Build lolos, RLS lulus uji dasar |
| M2: Auth dan Admin | Login, middleware, master data, akun, penugasan | Admin dapat menyiapkan satu semester penuh |
| M3: Jadwal, Agenda, Presensi | Jadwal mingguan, generate agenda, presensi, rekap kehadiran | Presensi satu kelas < 60 detik |
| M4: Penilaian | TP, asesmen, input nilai, bobot, rekap, ketercapaian | Unit test perhitungan lulus |
| M5: Ekspor dan Dashboard | Excel/PDF, dashboard guru/admin | Ekspor sesuai hak akses |
| M6: Fase 2 | Wali kelas, impor, remedial, catatan, notifikasi, penguncian, kop PDF | Uji coba dengan wali kelas |
| M7: Fase 3 dan Hardening | PWA offline, QA penuh, aksesibilitas, performa | Lighthouse mobile >= 85; CI hijau |
| M8: Pilot | Uji coba dengan 3-5 guru selama 2-4 minggu | Umpan balik terkumpul, bug kritis nol |
| M9: Peluncuran | Pelatihan singkat, dokumentasi, go-live | Seluruh guru dapat login dan mengisi presensi |

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Guru enggan beralih dari cara lama | Adopsi rendah | Pilot, UI sederhana, pelatihan singkat, impor Excel, tombol Tandai semua hadir |
| Sinyal internet sekolah tidak stabil | Presensi gagal tersimpan | Mode offline dengan antrian sinkronisasi (Fase 3); optimistic update; pesan status yang jelas |
| Kebocoran data antar guru | Pelanggaran privasi | RLS default deny, uji RLS otomatis di CI, audit log |
| Perhitungan nilai tidak sesuai kebijakan sekolah | Ketidakpercayaan pada rekap | Bobot dan ambang dapat dikonfigurasi, unit test, validasi bersama waka kurikulum |
| Efek glassmorphism mengganggu keterbacaan atau lambat di HP lama | Pengalaman buruk | Lapisan solid pada data, fallback tanpa blur, batasi backdrop-filter |
| Batas gratis Supabase/Vercel terlampaui | Layanan terbatas | Pantau penggunaan, siapkan rencana upgrade berbayar |
| Perubahan aturan kurikulum | Fitur penilaian usang | Struktur TP/asesmen fleksibel, ambang dan kategori dapat diatur |
| Scope terlalu besar untuk satu rilis | Keterlambatan | Fase bertahap (MVP lebih dahulu) dan dokumentasi keputusan |
| Akun Gmail pribadi guru diretas atau guru sudah pindah sekolah | Akses tidak sah ke data siswa | Hanya email terdaftar yang dapat masuk; admin menonaktifkan akun saat guru berhenti; saran verifikasi 2 langkah Google; audit log |

## 15. Asumsi dan Pertanyaan Terbuka

**Asumsi**

- Aplikasi untuk satu sekolah dengan satu admin atau lebih dan banyak guru.
- Guru memilih kelas dan mapel dari penugasan yang dibuat admin.
- Jadwal guru langsung aktif tanpa persetujuan admin.
- Pengguna berbahasa Indonesia; zona waktu WIB.
- Satu semester aktif dalam satu waktu.

**Keputusan pemilik produk (dijawab 11 November 2026)**

| Pertanyaan | Keputusan | Dampak pada PRD |
| --- | --- | --- |
| Persetujuan admin atas jadwal | Tidak perlu; jadwal guru langsung aktif | JD-01 tetap; tidak ada status persetujuan |
| Ambang ketercapaian TP dan rumus nilai akhir | Perlu penyesuaian (rincian menunggu) | Lihat pertanyaan terbuka di bawah; PN-04 dan PN-06 sudah dapat dikonfigurasi |
| Penanggung jawab data dan retensi | Admin; data disimpan sampai admin menghapus per periode | AD-07, AD-08, Bagian 10 |
| Login dengan Google | Ya, dengan akun Gmail | AUTH-07, AUTH-08, Bagian 10 dan 12 |
| Portal siswa/orang tua | Belum untuk saat ini | Tetap di luar cakupan (3.3) |
| Pemilik akun Supabase/Vercel dan pencadangan | Pemilik produk (satu orang) | Cadangan rutin lewat AD-06; simpan kredensial di password manager |

**Pertanyaan terbuka**

1. Penyesuaian apa yang dibutuhkan pada ambang ketercapaian TP dan rumus nilai akhir (bobot, kategori, pembulatan, aturan remedial)?
2. Apakah guru memakai Gmail pribadi (@gmail.com) atau akun Google Workspace sekolah? Jawabannya menentukan apakah login perlu dibatasi pada satu domain.

## 16. Lampiran: Glosarium

| Istilah | Arti |
| --- | --- |
| TP | Tujuan Pembelajaran |
| KKTP | Kriteria Ketercapaian Tujuan Pembelajaran |
| Formatif | Asesmen selama proses pembelajaran untuk memantau kemajuan |
| Sumatif | Asesmen di akhir lingkup materi/semester/tahun |
| SLM / SAS / SAT | Sumatif Lingkup Materi / Akhir Semester / Akhir Tahun |
| Fase A-F | Pembagian fase capaian pembelajaran Kurikulum Merdeka |
| RLS | Row Level Security, pembatasan akses data per baris di database |
| PWA | Progressive Web App, web app yang dapat dipasang dan bekerja offline terbatas |
| Leger | Rekap nilai seluruh mapel untuk satu kelas |
| Soft delete | Penghapusan logis (data ditandai terhapus, tidak benar-benar dihapus) |
