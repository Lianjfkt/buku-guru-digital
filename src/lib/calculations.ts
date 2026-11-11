/**
 * Utilitas Kalkulasi Logika Bisnis Kurikulum Merdeka & Administrasi Guru
 * Digunakan untuk perhitungan client-side, form validasi, dan sinkronisasi dengan database functions.
 */

export function hitungPersentaseKehadiran(totalHadir: number, totalSesi: number): number {
  if (totalSesi <= 0) return 100.0;
  return Number(((totalHadir / totalSesi) * 100).toFixed(2));
}

export function hitungNilaiAkhirBerbobot(
  rataFormatif: number,
  rataSumatif: number,
  bobotFormatif: number = 40,
  bobotSumatif: number = 60
): number {
  const finalScore = (rataFormatif * bobotFormatif) / 100 + (rataSumatif * bobotSumatif) / 100;
  return Number(finalScore.toFixed(2));
}

export function tentukanKetercapaianTP(
  nilai: number,
  ambang: { sangat_tercapai: number; tercapai: number; cukup: number } = {
    sangat_tercapai: 90,
    tercapai: 75,
    cukup: 60,
  }
): "Sangat Tercapai" | "Tercapai" | "Cukup" | "Belum Tercapai" {
  if (nilai >= ambang.sangat_tercapai) return "Sangat Tercapai";
  if (nilai >= ambang.tercapai) return "Tercapai";
  if (nilai >= ambang.cukup) return "Cukup";
  return "Belum Tercapai";
}

export function hitungNilaiEfektifRemedial(
  nilaiAsli: number,
  nilaiRemedial: number | null | undefined,
  kktp: number = 75
): number {
  if (nilaiRemedial === null || nilaiRemedial === undefined) return nilaiAsli;
  return Math.min(nilaiRemedial, kktp);
}

export function isJadwalBentrok(
  jadwalA: { start: number; end: number },
  jadwalB: { start: number; end: number }
): boolean {
  return !(jadwalA.end < jadwalB.start || jadwalA.start > jadwalB.end);
}

