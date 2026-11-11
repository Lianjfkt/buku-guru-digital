import { getAssessmentDetail } from '@/features/guru/penilaian/actions';
import AssessmentScoreSheet from './AssessmentScoreSheet';
import { EmptyState } from '@/components/feedback/EmptyState';

export const metadata = { title: 'Input Nilai Asesmen | Ruang Guru' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await getAssessmentDetail(id);

  if (res.error || !res.data) {
    return (
      <EmptyState
        icon="⚠️"
        title="Asesmen Tidak Ditemukan"
        description={res.error || 'Data asesmen tidak ditemukan atau Anda tidak memiliki akses.'}
      />
    );
  }

  return <AssessmentScoreSheet assessment={res.data as any} />;
}

