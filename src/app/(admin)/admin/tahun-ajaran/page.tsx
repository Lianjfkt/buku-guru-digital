import { getSchoolPeriods } from '@/features/admin/advanced/actions';
import PeriodeClient from './PeriodeClient';

export const metadata = { title: 'Tahun Ajaran & Penguncian | Admin Ruang Guru' };

export default async function PeriodePage() {
  const res = await getSchoolPeriods();
  const periods = res.data ?? [];

  return <PeriodeClient periods={periods as any} />;
}

