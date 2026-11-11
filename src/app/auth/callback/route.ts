import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled
          }
        },
      },
    });

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && authData.user) {
      // Periksa apakah pengguna terdaftar dan aktif di profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active, must_change_password")
        .eq("id", authData.user.id)
        .single<{ role: string; is_active: boolean; must_change_password: boolean }>();

      // Jika email belum didaftarkan oleh admin sekolah atau akun nonaktif
      if (!profile || profile.is_active === false) {
        await supabase.auth.signOut();
        const errorType = !profile ? "not_registered" : "account_disabled";
        return NextResponse.redirect(`${origin}/login?error=${errorType}`);
      }

      // Jika wajib ganti password
      if (profile.must_change_password) {
        return NextResponse.redirect(`${origin}/ganti-password`);
      }

      // Arahkan sesuai peran pengguna
      const redirectPath = profile.role === "admin" ? "/admin/dashboard" : next;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Jika kode gagal dipertukarkan
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
