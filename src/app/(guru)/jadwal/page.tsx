import { getJadwalGuru, getPenugasanGuru, getJamPelajaran } from '@/features/guru/jadwal/actions';
import JadwalClient from './JadwalClient';
import { EmptyState } from '@/components/feedback/EmptyState';

export const metadata = { title: 'Jadwal Mengajar | Ruang Guru' };

export default async function JadwalPage() {
  const [jadwalResult, penugasanResult, jamResult] = await Promise.all([
    getJadwalGuru(),
    getPenugasanGuru(),
    getJamPelajaran(),
  ]);

  const jadwalList = jadwalResult.data ?? [];
  const penugasanList = penugasanResult.data ?? [];
  const jamPelajaranList = jamResult.data ?? [];

  if (penugasanList.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Belum Ada Penugasan"
        description="Anda belum memiliki penugasan mengajar. Hubungi admin untuk mendapatkan penugasan."
      />
    );
  }

  return (
    <JadwalClient
      initialJadwal={jadwalList}
      penugasanList={penugasanList}
      jamPelajaranList={jamPelajaranList}
    />
  );
}

