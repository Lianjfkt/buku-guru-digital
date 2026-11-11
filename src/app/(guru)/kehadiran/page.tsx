import { getPenugasanGuru } from '@/features/guru/jadwal/actions';
import { getAttendanceRecap } from '@/features/guru/kehadiran/actions';
import KehadiranClient from './KehadiranClient';
import { EmptyState } from '@/components/feedback/EmptyState';

export const metadata = { title: 'Rekap Kehadiran | Ruang Guru' };

interface Props {
  searchParams: Promise<{ assignment_id?: string }>;
}

export default async function KehadiranPage({ searchParams }: Props) {
  const { assignment_id } = await searchParams;
  const penugasanRes = await getPenugasanGuru();
  const penugasanList = penugasanRes.data ?? [];

  if (penugasanList.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="Belum Ada Penugasan"
        description="Anda belum memiliki penugasan mengajar untuk melihat rekap kehadiran."
      />
    );
  }

  const selectedId = assignment_id || penugasanList[0].id;
  const recapRes = await getAttendanceRecap(selectedId);

  return (
    <KehadiranClient
      penugasanList={penugasanList}
      initialData={recapRes.data}
      selectedAssignmentId={selectedId}
    />
  );
}

