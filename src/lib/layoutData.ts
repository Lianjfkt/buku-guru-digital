import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getLayoutData(defaultRole: "admin" | "guru") {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("demo_role")?.value as "admin" | "guru" | undefined;

  let userName = defaultRole === "admin" ? "Administrator Sekolah" : "Guru Pengajar";
  let userRole = demoRole || defaultRole;
  let isHomeroom = false;

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      userName = profile.full_name || userName;
      userRole = profile.role || userRole;
    }

    const { data: hrClass } = await (supabase as any)
      .from("classes")
      .select("id")
      .eq("homeroom_teacher_id", user.id)
      .is("deleted_at", null)
      .limit(1);

    isHomeroom = Boolean(hrClass && hrClass.length > 0);
  } else if (demoRole === "admin") {
    userName = "Admin Demo";
  } else if (demoRole === "guru") {
    userName = "Guru Demo";
    isHomeroom = true;
  }

  const [{ data: settings }, { data: semester }] = await Promise.all([
    (supabase as any).from("app_settings").select("school_name").limit(1).single(),
    (supabase as any).from("semesters").select("name").eq("is_active", true).limit(1).single(),
  ]);

  return {
    userName,
    userRole,
    isHomeroom,
    schoolName: settings?.school_name || "Buku Guru Digital",
    semesterName: semester?.name || "Ganjil 2026/2027",
  };
}

