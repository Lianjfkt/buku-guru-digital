"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassModal } from "@/components/ui/GlassModal";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { saveGuruAction, toggleGuruStatusAction, resetGuruPasswordAction } from "@/features/admin/actions";
import { toast } from "sonner";
import { UserPlus, Search, Edit2, Key, ShieldCheck } from "lucide-react";

interface GuruItem {
  id: string;
  full_name: string;
  nip: string | null;
  email: string;
  role: "admin" | "guru";
  is_active: boolean;
}

export default function AdminGuruPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<GuruItem | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [role, setRole] = useState<"admin" | "guru">("guru");
  const [password, setPassword] = useState("");
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Data Dummy Simulasi
  const [guruList, setGuruList] = useState<GuruItem[]>([
    {
      id: "11111111-1111-1111-1111-111111111111",
      full_name: "Pak Dedi (Administrator)",
      nip: "198005122005011003",
      email: "admin@sekolah.sch.id",
      role: "admin",
      is_active: true,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      full_name: "Bu Rina Wulandari, S.Pd.",
      nip: "198503202009022001",
      email: "rina.wulandari@gmail.com",
      role: "guru",
      is_active: true,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      full_name: "Pak Ahmad Fauzi, M.Kom.",
      nip: "198711152010011004",
      email: "ahmad.fauzi@gmail.com",
      role: "guru",
      is_active: true,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      full_name: "Bu Sari Rahayu, M.Pd.",
      nip: "198207102008012006",
      email: "sari.rahayu@gmail.com",
      role: "guru",
      is_active: false,
    },
  ]);

  const filtered = guruList.filter(
    (g) =>
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      (g.nip && g.nip.includes(search))
  );

  const handleOpenAdd = () => {
    setSelectedGuru(null);
    setFullName("");
    setEmail("");
    setNip("");
    setRole("guru");
    setPassword("");
    setModalOpen(true);
  };

  const handleOpenEdit = (guru: GuruItem) => {
    setSelectedGuru(guru);
    setFullName(guru.full_name);
    setEmail(guru.email);
    setNip(guru.nip || "");
    setRole(guru.role);
    setPassword("");
    setModalOpen(true);
  };

  const handleSaveGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await saveGuruAction({
      id: selectedGuru ? selectedGuru.id : undefined,
      full_name: fullName,
      email,
      nip: nip || null,
      role,
      password: password || undefined,
      is_active: selectedGuru ? selectedGuru.is_active : true,
    });

    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan akun guru");
      return;
    }

    if (selectedGuru) {
      setGuruList((prev) =>
        prev.map((g) =>
          g.id === selectedGuru.id
            ? { ...g, full_name: fullName, email, nip: nip || null, role }
            : g
        )
      );
      toast.success("Data guru berhasil diperbarui");
    } else {
      const newG: GuruItem = {
        id: crypto.randomUUID(),
        full_name: fullName,
        email,
        nip: nip || null,
        role,
        is_active: true,
      };
      setGuruList((prev) => [...prev, newG]);
      toast.success("Akun guru berhasil dibuat");
    }

    setModalOpen(false);
  };

  const handleToggleStatus = async (guru: GuruItem) => {
    const nextStatus = !guru.is_active;
    const res = await toggleGuruStatusAction(guru.id, nextStatus);
    if (!res.ok) {
      toast.error("Gagal mengubah status akun");
      return;
    }
    setGuruList((prev) =>
      prev.map((g) => (g.id === guru.id ? { ...g, is_active: nextStatus } : g))
    );
    toast.success(nextStatus ? "Akun diaktifkan kembali" : "Akun dinonaktifkan");
  };

  const handleResetPassword = async () => {
    if (!selectedGuru) return;
    setIsLoading(true);
    const res = await resetGuruPasswordAction(selectedGuru.id, resetPasswordVal);
    setIsLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal mereset password");
      return;
    }

    toast.success(`Password untuk ${selectedGuru.full_name} berhasil direset!`);
    setResetModalOpen(false);
    setResetPasswordVal("");
  };

  return (
    <AppLayout role="admin" userName="Pak Dedi (Administrator)">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Manajemen Akun Guru & Staf
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola pendaftaran akun Gmail Google SSO, password awal, status aktif, dan reset password.
            </p>
          </div>
          <GlassButton size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<UserPlus className="w-4 h-4" />}>
            Tambah Akun Guru
          </GlassButton>
        </div>

        {/* Filter bar */}
        <GlassCard className="p-3 sm:p-4">
          <div className="max-w-md">
            <GlassInput
              placeholder="Cari berdasarkan nama, email, atau NIP..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Table */}
        <GlassTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nama Lengkap & NIP</TableHeaderCell>
              <TableHeaderCell>Email Login</TableHeaderCell>
              <TableHeaderCell>Peran</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {filtered.map((guru) => (
              <TableRow key={guru.id}>
                <TableCell>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{guru.full_name}</p>
                  <p className="text-xs text-slate-400">NIP: {guru.nip || "-"}</p>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  {guru.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      guru.role === "admin"
                        ? "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                        : "bg-brand-500/15 text-brand-700 dark:text-brand-300"
                    }`}
                  >
                    {guru.role === "admin" ? "Admin" : "Guru"}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(guru)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                      guru.is_active
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {guru.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(guru)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Ubah Data"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuru(guru);
                        setResetModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </GlassTable>

        {/* Modal Form Tambah/Ubah Guru */}
        <GlassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedGuru ? "Ubah Akun Guru" : "Tambah Akun Guru Baru"}
          description="Daftarkan guru dengan Gmail untuk login Google SSO, atau isi password awal."
        >
          <form onSubmit={handleSaveGuru} className="space-y-4">
            <GlassInput
              label="Nama Lengkap & Gelar"
              placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <GlassInput
              label="Alamat Email (Gmail / Akun Sekolah)"
              type="email"
              placeholder="nama.guru@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!selectedGuru}
              helperText={
                selectedGuru
                  ? "Email auth tidak dapat diubah langsung"
                  : "Guru dapat langsung masuk dengan Google jika menggunakan Gmail"
              }
            />

            <GlassInput
              label="NIP (Opsional)"
              placeholder="19850101201001..."
              value={nip}
              onChange={(e) => setNip(e.target.value)}
            />

            {!selectedGuru && (
              <GlassInput
                label="Password Awal (Khusus Tanpa Akun Google)"
                type="password"
                placeholder="Minimal 10 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Kosongkan jika guru akan login via akun Google SSO"
              />
            )}

            <div className="pt-2 flex justify-end gap-2">
              <GlassButton type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm" isLoading={isLoading}>
                {selectedGuru ? "Simpan Perubahan" : "Daftarkan Guru"}
              </GlassButton>
            </div>
          </form>
        </GlassModal>

        {/* Modal Reset Password */}
        <GlassModal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title={`Reset Password: ${selectedGuru?.full_name}`}
          description="Pengguna akan diwajibkan mengganti password baru ini saat login berikutnya."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <GlassInput
              label="Password Baru"
              type="password"
              placeholder="Minimal 10 karakter"
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <GlassButton type="button" variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
                Batal
              </GlassButton>
              <GlassButton
                type="button"
                variant="danger"
                size="sm"
                onClick={handleResetPassword}
                isLoading={isLoading}
                disabled={resetPasswordVal.length < 10}
              >
                Setel Ulang Password
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </AppLayout>
  );
}

