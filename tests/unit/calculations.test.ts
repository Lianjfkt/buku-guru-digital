import { describe, it, expect } from "vitest";

// Logika Kalkulasi Kurikulum Merdeka & Presensi (sesuai fungsi SQL & spesifikasi PRD)

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
  // Nilai remedial dibatasi maksimal sebesar KKTP/ambang batas
  return Math.min(nilaiRemedial, kktp);
}

export function isJadwalBentrok(
  jadwalA: { start: number; end: number },
  jadwalB: { start: number; end: number }
): boolean {
  return !(jadwalA.end < jadwalB.start || jadwalA.start > jadwalB.end);
}

describe("Perhitungan Bisnis Kurikulum Merdeka & Administrasi Guru", () => {
  describe("Kehadiran", () => {
    it("menghitung persentase kehadiran dengan benar", () => {
      expect(hitungPersentaseKehadiran(16, 20)).toBe(80.0);
      expect(hitungPersentaseKehadiran(19, 20)).toBe(95.0);
      expect(hitungPersentaseKehadiran(0, 0)).toBe(100.0);
    });

    it("mendeteksi siswa perlu perhatian (<80%)", () => {
      const persentase = hitungPersentaseKehadiran(15, 20); // 75%
      expect(persentase < 80).toBe(true);
    });
  });

  describe("Nilai Akhir Berbobot", () => {
    it("menghitung nilai akhir dengan bobot 40% formatif dan 60% sumatif", () => {
      const formatif = 80;
      const sumatif = 90;
      // 80 * 0.4 = 32, 90 * 0.6 = 54 -> 86
      expect(hitungNilaiAkhirBerbobot(formatif, sumatif, 40, 60)).toBe(86.0);
    });

    it("menghitung nilai akhir dengan bobot kustom (e.g. 50:50)", () => {
      expect(hitungNilaiAkhirBerbobot(70, 80, 50, 50)).toBe(75.0);
    });
  });

  describe("Ketercapaian Tujuan Pembelajaran (TP)", () => {
    it("mengelompokkan predikat capaian TP dengan benar", () => {
      expect(tentukanKetercapaianTP(95)).toBe("Sangat Tercapai");
      expect(tentukanKetercapaianTP(80)).toBe("Tercapai");
      expect(tentukanKetercapaianTP(68)).toBe("Cukup");
      expect(tentukanKetercapaianTP(50)).toBe("Belum Tercapai");
    });
  });

  describe("Remedial & Batas Nilai Maksimal", () => {
    it("membatasi nilai remedial maksimum sesuai KKTP", () => {
      // Nilai asli 55 (di bawah KKTP 75), ujian remedial dapat 90 -> efektif dihitung 75
      expect(hitungNilaiEfektifRemedial(55, 90, 75)).toBe(75);

      // Nilai remedial dapat 70 -> efektif dihitung 70
      expect(hitungNilaiEfektifRemedial(55, 70, 75)).toBe(70);

      // Tanpa remedial -> nilai asli
      expect(hitungNilaiEfektifRemedial(85, null, 75)).toBe(85);
    });
  });

  describe("Deteksi Bentrok Jadwal", () => {
    it("mendeteksi bentrok pada jam yang tumpang tindih", () => {
      // Jam 1-3 dan Jam 2-4 -> bentrok
      expect(isJadwalBentrok({ start: 1, end: 3 }, { start: 2, end: 4 })).toBe(true);
      // Jam 1-2 dan Jam 2-3 -> bentrok di jam ke-2
      expect(isJadwalBentrok({ start: 1, end: 2 }, { start: 2, end: 3 })).toBe(true);
      // Jam 1-2 dan Jam 3-4 -> tidak bentrok
      expect(isJadwalBentrok({ start: 1, end: 2 }, { start: 3, end: 4 })).toBe(false);
    });
  });
});
