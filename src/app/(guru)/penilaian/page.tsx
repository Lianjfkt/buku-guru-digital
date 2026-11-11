import { getPenugasanGuru } from '@/features/guru/jadwal/actions';
import { getAssessments } from '@/features/guru/penilaian/actions';
import PenilaianClient from './PenilaianClient';
import { EmptyState } from '@/components/feedback/EmptyState';

export const metadata = { title: 'Penilaian Siswa | Ruang Guru' };

interface Props {
  searchParams: Promise<{ assignment_id?: string }>;
}

export default async function PenilaianPage({ searchParams }: Props) {
  const { assignment_id } = await searchParams;
  const penugasanRes = await getPenugasanGuru();
  const penugasanList = (penugasanRes.data ?? []) as any[];

  if (penugasanList.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Belum Ada Penugasan"
        description="Anda belum memiliki penugasan mengajar untuk mengelola asesmen."
      />
    );
  }

  const selectedId = assignment_id || penugasanList[0].id;
  const assessmentsRes = await getAssessments(selectedId);
  const assessments = assessmentsRes.data ?? [];

  return (
    <PenilaianClient
      penugasanList={penugasanList}
      selectedAssignmentId={selectedId}
      assessments={assessments}
    />
  );
}

