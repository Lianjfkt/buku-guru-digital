import { getAuditLogs } from '@/features/admin/advanced/actions';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatTanggal, formatWaktu } from '@/lib/utils';

export const metadata = { title: 'Audit Log Sistem | Admin Ruang Guru' };

export default async function AuditLogPage() {
  const res = await getAuditLogs();
  const logs = res.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log Keamanan & Aktivitas</h1>
        <p className="text-sm text-white/60 mt-1">
          Catatan riwayat transaksi dan manipulasi data sistem secara real-time
        </p>
      </div>

      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="py-2.5 px-3">Waktu</th>
              <th className="py-2.5 px-3">Pengguna</th>
              <th className="py-2.5 px-3 text-center">Operasi</th>
              <th className="py-2.5 px-3">Tabel</th>
              <th className="py-2.5 px-3">ID Record</th>
              <th className="py-2.5 px-3">Detail Perubahan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/40">
                  Belum ada catatan aktivitas di log audit.
                </td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-white/[0.03]">
                  <td className="py-2 px-3 text-white/60 whitespace-nowrap">
                    {formatTanggal(log.created_at)} {formatWaktu(log.created_at)}
                  </td>
                  <td className="py-2 px-3 font-sans text-white">
                    {log.user?.full_name || 'System / Trigger'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase ${
                        log.operation === 'INSERT'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.operation === 'UPDATE'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {log.operation}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-white/70">{log.table_name}</td>
                  <td className="py-2 px-3 text-white/40 truncate max-w-[120px]">{log.record_id}</td>
                  <td className="py-2 px-3 text-white/60 truncate max-w-[240px]">
                    {log.new_data ? JSON.stringify(log.new_data) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

