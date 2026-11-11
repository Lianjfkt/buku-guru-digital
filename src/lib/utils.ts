import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Gabungkan kelas Tailwind dengan penanganan konflik otomatis
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal dalam Bahasa Indonesia (WIB)
 * Contoh: "Senin, 17 Agustus 2026"
 */
export function formatTanggal(date: Date | string, formatStr: string = "EEEE, d MMMM yyyy"): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, formatStr, { locale: id });
  } catch {
    return "-";
  }
}

/**
 * Format jam dalam WIB (HH:mm)
 */
export function formatWaktu(timeStr: string | null | undefined): string {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5);
}

/**
 * Format persentase dengan 1 desimal
 */
export function formatPersen(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0%";
  return `${val.toFixed(1).replace(".", ",")}%`;
}

/**
 * Format angka nilai (0-100)
 */
export function formatNilai(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(".", ",");
}

