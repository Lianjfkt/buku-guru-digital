# Catatan Keputusan Desain (Architectural Decisions)

Dokumen ini mencatat keputusan desain, arsitektur, dan teknologi yang diambil selama pembangunan sistem **Ruang Guru (Buku Guru Digital)**.

---

## 1. Pilihan Teknologi Inti
- **Framework Frontend/Backend:** Next.js (App Router) + TypeScript Strict.
- **Styling:** Tailwind CSS dengan kustomisasi Glassmorphism (gradient mesh, background blur, dark/light theme).
- **Backend as a Service (BaaS):** Supabase (PostgreSQL, Supabase Auth, Row Level Security, Storage).
- **Client Auth:** `@supabase/ssr` menggunakan cookie HttpOnly untuk menjaga keamanan sesi di Server Components, Route Handlers, dan Server Actions.
- **Validasi Data:** Zod pada sisi client (`react-hook-form` + `@hookform/resolvers`) dan wajib di sisi server sebelum mutasi data.
- **Ekspor Dokumen:** `exceljs` untuk spreadsheet Excel (.xlsx) dan `jspdf` + `jspdf-autotable` untuk dokumen PDF siap cetak.
- **Testing:** `vitest` untuk unit test (formula kalkulasi & logika bisnis) dan `playwright` untuk E2E testing alur kritis.
