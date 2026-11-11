"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/features/auth/schemas";
import { changePasswordAction } from "@/features/auth/actions";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { toast } from "sonner";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function GantiPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    setIsSubmitting(true);
    try {
      const res = await changePasswordAction(values);
      if (!res.ok) {
        toast.error(res.error || "Gagal mengganti password");
        setIsSubmitting(false);
        return;
      }

      toast.success("Password baru berhasil disimpan!");
      router.push("/dashboard");
    } catch {
      toast.error("Terjadi kendala saat menghubungi server");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-8">
      <div className="mesh-gradient" />

      <header className="flex items-center justify-between max-w-5xl mx-auto w-full py-2">
        <div className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
          Ruang Guru Digital
        </div>
        <ThemeToggle />
      </header>

      <main className="flex items-center justify-center py-8">
        <GlassCard className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Perbarui Password Anda
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demi keamanan akun sekolah Anda, silakan buat password baru minimal 10 karakter sebelum melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput
              label="Password Baru"
              type="password"
              placeholder="Minimal 10 karakter"
              helperText="Gunakan kombinasi huruf, angka, atau simbol"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <GlassInput
              label="Ulangi Password Baru"
              type="password"
              placeholder="Ketik ulang password baru"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full font-bold"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Simpan Password Baru
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </main>

      <footer className="text-center text-xs text-slate-400 py-2">
        Keamanan Data & Privasi Terproteksi
      </footer>
    </div>
  );
}

