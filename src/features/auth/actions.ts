"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, changePasswordSchema, type LoginInput, type ChangePasswordInput } from "./schemas";
import { redirect } from "next/navigation";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  mustChangePassword?: boolean;
}

/**
 * Server Action: Login dengan Email & Password
 */
export async function loginWithPasswordAction(input: LoginInput): Promise<ActionResult> {
  // 1. Validasi Zod di Server
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message || "Data masukan tidak valid",
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  // 2. Autentikasi ke Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: "Email atau password yang Anda masukkan salah.",
    };
  }

  // 3. Verifikasi status akun di tabel profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, must_change_password")
    .eq("id", data.user.id)
    .single<{ role: string; is_active: boolean; must_change_password: boolean }>();

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Akun Anda telah dinonaktifkan oleh administrator sekolah.",
    };
  }

  return {
    ok: true,
    mustChangePassword: profile?.must_change_password ?? false,
    data: {
      role: profile?.role ?? "guru",
    },
  };
}

/**
 * Server Action: Inisialisasi Google OAuth Login
 */
export async function loginWithGoogleAction(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return {
      ok: false,
      error: error?.message || "Gagal menginisialisasi login dengan Google",
    };
  }

  return {
    ok: true,
    data: { url: data.url },
  };
}

/**
 * Server Action: Ganti Password Wajib
 */
export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message || "Password tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  // Update password di Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (updateError) {
    return {
      ok: false,
      error: updateError.message || "Gagal memperbarui password",
    };
  }

  // Matikan flag must_change_password di tabel profiles
  await supabase
    .from("profiles")
    // @ts-expect-error Update typing
    .update({ must_change_password: false })
    .eq("id", user.id);

  return {
    ok: true,
  };
}

/**
 * Server Action: Logout
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
