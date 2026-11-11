import { getAgendaDetail } from '@/features/guru/agenda/actions';
import AgendaDetailClient from './AgendaDetailClient';
import { EmptyState } from '@/components/feedback/EmptyState';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Presensi Siswa | Ruang Guru' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AgendaDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await getAgendaDetail(id);

  if (res.error || !res.data) {
    return (
      <EmptyState
        icon="⚠️"
        title="Agenda Tidak Ditemukan"
        description={res.error || 'Agenda pembelajaran tidak ditemukan atau Anda tidak memiliki akses.'}
      />
    );
  }

  return <AgendaDetailClient agenda={res.data as any} />;
}

