import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Ambil user yang sedang aktif
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rute publik yang tidak memerlukan autentikasi
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico");

  // Cek cookie demo untuk pengujian lokal
  const demoRole = request.cookies.get("demo_role")?.value;
  if (demoRole) {
    if (pathname === "/login") {
      const target = demoRole === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (pathname.startsWith("/admin") && demoRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // 1. Jika belum login dan mengakses halaman yang dilindungi
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Jika sudah login
  if (user) {
    // Ambil profil user untuk cek peran & status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active, must_change_password")
      .eq("id", user.id)
      .single<{ role: string; is_active: boolean; must_change_password: boolean }>();

    // Cek jika akun dinonaktifkan
    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_disabled");
      return NextResponse.redirect(url);
    }

    // Cek jika pengguna wajib mengganti password saat login pertama
    if (profile && profile.must_change_password && pathname !== "/ganti-password") {
      const url = request.nextUrl.clone();
      url.pathname = "/ganti-password";
      return NextResponse.redirect(url);
    }

    // Jika sudah di halaman ganti password tetapi tidak perlu ganti password
    if (profile && !profile.must_change_password && pathname === "/ganti-password") {
      const url = request.nextUrl.clone();
      url.pathname = profile.role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }

    // Proteksi Rute Admin: Hanya peran admin yang boleh membuka /admin/*
    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Jika sudah login dan mencoba membuka halaman login
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
