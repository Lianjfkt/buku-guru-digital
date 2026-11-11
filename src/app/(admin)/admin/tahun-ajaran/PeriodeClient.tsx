'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { formatTanggal } from '@/lib/utils';
import { lockPeriodAction, deletePeriodDataAction } from '@/features/admin/advanced/actions';

interface Period {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  locked_until: string | null;
}

interface Props {
  periods: Period[];
}

export default function PeriodeClient({ periods }: Props) {
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [lockDate, setLockDate] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleLock = async (id: string) => {
    if (!lockDate) {
      alert('Pilih tanggal batas penguncian');
      return;
    }
    setIsPending(true);
    const res = await lockPeriodAction(id, lockDate);
    setIsPending(false);
    if (res.error) {
      alert(res.error);
    } else {
      alert('Berhasil mengatur penguncian periode!');
      window.location.reload();
    }
  };

  const handleDeleteData = async (period: Period) => {
    if (period.is_active) {
      alert('Periode aktif tidak dapat dibersihkan datanya!');
      return;
    }
    const confirmName = prompt(
      `PERINGATAN: Tindakan ini akan menghapus permanen seluruh nilai, presensi, dan agenda pada periode "${period.name}". Ketik nama periode untuk konfirmasi:`
    );
    if (confirmName !== period.name) {
      alert('Nama periode tidak cocok. Tindakan dibatalkan.');
      return;
    }

    setIsPending(true);
    const res = await deletePeriodDataAction(period.id);
    setIsPending(false);
    if (res.error) {
      alert(res.error);
    } else {
      alert('Data arsip periode berhasil dibersihkan.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Tahun Ajaran & Penguncian Nilai</h1>
        <p className="text-sm text-white/60 mt-1">
          Kunci perubahan nilai semester lampau untuk mencegah manipulasi data (Period Locking Guard)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {periods.map(p => {
          const isLocked = p.locked_until && new Date(p.locked_until) > new Date();

          return (
            <GlassCard key={p.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <div className="text-xs text-white/60 mt-0.5">
                    {formatTanggal(p.start_date)} – {formatTanggal(p.end_date)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    p.is_active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {p.is_active ? 'Aktif' : 'Arsip'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs space-y-1">
                <div className="text-white/70">
                  Status Kunci Nilai:{' '}
                  <strong className={isLocked ? 'text-amber-400' : 'text-emerald-400'}>
                    {isLocked ? `Terkunci hingga ${formatTanggal(p.locked_until!)}` : 'Terbuka (Dapat Diedit)'}
                  </strong>
                </div>
                <p className="text-white/40 text-[11px]">
                  Jika terkunci, database trigger `guard_period_locking` akan memblokir perubahan nilai dan presensi.
                </p>
              </div>

              {lockingId === p.id ? (
                <div className="flex items-center gap-2 pt-2">
                  <GlassInput
                    type="date"
                    value={lockDate}
                    onChange={e => setLockDate(e.target.value)}
                  />
                  <GlassButton
                    variant="primary"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleLock(p.id)}
                  >
                    Simpan
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setLockingId(null)}
                  >
                    Batal
                  </GlassButton>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setLockingId(p.id);
                      setLockDate(p.locked_until || new Date().toISOString().split('T')[0]);
                    }}
                  >
                    🔒 Atur Penguncian Nilai
                  </GlassButton>

                  {!p.is_active && (
                    <GlassButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteData(p)}
                      disabled={isPending}
                    >
                      🗑️ Bersihkan Arsip Data
                    </GlassButton>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

