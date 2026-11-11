import { getWaliKelasData, getLegerKelas } from '@/features/guru/wali-kelas/actions';
import WaliKelasClient from './WaliKelasClient';
import { EmptyState } from '@/components/feedback/EmptyState';

export const metadata = { title: 'Portal Wali Kelas | Ruang Guru' };

interface Props {
  searchParams: Promise<{ class_id?: string }>;
}

export default async function WaliKelasPage({ searchParams }: Props) {
  const { class_id } = await searchParams;
  const wkRes = await getWaliKelasData();

  if (wkRes.error || !wkRes.data || wkRes.data.classes.length === 0) {
    return (
      <EmptyState
        icon="🧑‍🏫"
        title="Bukan Wali Kelas"
        description="Akun Anda saat ini belum ditugaskan sebagai wali kelas untuk kelas aktif manapun. Hubungi admin sekolah jika ini keliru."
      />
    );
  }

  const classes = wkRes.data.classes as any[];
  const selectedClassId = class_id || classes[0].id;
  const legerRes = await getLegerKelas(selectedClassId);

  return (
    <WaliKelasClient
      classes={classes}
      selectedClassId={selectedClassId}
      initialLeger={legerRes.data as any}
    />
  );
}

