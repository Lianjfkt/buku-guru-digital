import { getAgendas } from '@/features/guru/agenda/actions';
import { getPenugasanGuru } from '@/features/guru/jadwal/actions';
import AgendaClient from './AgendaClient';
import { EmptyState } from '@/components/feedback/EmptyState';

export const metadata = { title: 'Agenda Mengajar | Ruang Guru' };

export default async function AgendaPage() {
  const [agendasRes, penugasanRes] = await Promise.all([
    getAgendas(),
    getPenugasanGuru(),
  ]);

  const agendas = agendasRes.data ?? [];
  const penugasanList = penugasanRes.data ?? [];

  if (penugasanList.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="Belum Ada Penugasan"
        description="Anda belum memiliki penugasan mengajar aktif untuk mengelola agenda."
      />
    );
  }

  return (
    <AgendaClient
      initialAgendas={agendas}
      penugasanList={penugasanList}
    />
  );
}

