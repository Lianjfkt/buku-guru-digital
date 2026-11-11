import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatTanggal, formatWaktu } from "@/lib/utils";

export const metadata = { title: "Notifikasi | Ruang Guru" };

export default async function NotifikasiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let notifications: any[] = [];
  if (user) {
    const { data } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    notifications = data || [];
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-500" /> Pusat Notifikasi
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Pengingat presensi tertunda, agenda mengajar, dan pengumuman sistem
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <GlassCard className="p-8 text-center text-white/50">
            Tidak ada notifikasi baru saat ini.
          </GlassCard>
        ) : (
          notifications.map((n) => (
            <GlassCard key={n.id} className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">{n.title}</span>
                <span className="text-[11px] text-white/40">
                  {formatTanggal(n.created_at)} {formatWaktu(n.created_at)}
                </span>
              </div>
              <p className="text-xs text-white/70">{n.body}</p>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

