"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassTable, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/GlassTable";
import { importStudentsAction, getKelasList } from "@/features/admin/actions";
import { toast } from "sonner";
import { Upload, Download, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ParsedRow {
  rowNumber: number;
  nis: string;
  full_name: string;
  nisn?: string;
  gender: "L" | "P";
  class_name: string;
  class_id?: string;
  isValid: boolean;
  errors: string[];
}

export default function AdminImporSiswaPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Kelas map untuk lookup ID dinamis dari database
  const [classMap, setClassMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchClasses() {
      const res = await getKelasList();
      if (res.ok && res.data) {
        const map: Record<string, string> = {};
        res.data.forEach((c: any) => {
          map[c.name] = c.id;
          map[`Kelas ${c.name}`] = c.id;
        });
        setClassMap(map);
      }
    }
    fetchClasses();
  }, []);

  const handleDownloadTemplate = () => {
    // Buat file CSV template
    const headers = "nis,full_name,nisn,gender,class_name\n";
    const sample = "26041,Ahmad Dani,0081234541,L,X-A\n26042,Bunga Citra,0081234542,P,X-A\n";
    const blob = new Blob([headers + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_impor_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template CSV berhasil diunduh");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("File tidak memiliki data siswa");
        return;
      }

      const parsed: ParsedRow[] = [];
      const seenNis = new Set<string>();

      // Abaikan baris 0 (header)
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());
        const nis = parts[0] || "";
        const full_name = parts[1] || "";
        const nisn = parts[2] || "";
        const rawGender = (parts[3] || "").toUpperCase();
        const class_name = parts[4] || "";

        const errors: string[] = [];

        if (!nis) errors.push("NIS wajib diisi");
        if (seenNis.has(nis)) errors.push("NIS duplikat di file ini");
        if (nis) seenNis.add(nis);

        if (!full_name || full_name.length < 2) errors.push("Nama siswa minimal 2 karakter");
        if (rawGender !== "L" && rawGender !== "P") errors.push("Gender harus 'L' atau 'P'");
        if (!class_name || !classMap[class_name]) errors.push(`Kelas '${class_name}' tidak terdaftar`);

        const gender = rawGender === "P" ? "P" : "L";
        const class_id = classMap[class_name];

        parsed.push({
          rowNumber: i + 1,
          nis,
          full_name,
          nisn,
          gender,
          class_name,
          class_id,
          isValid: errors.length === 0,
          errors,
        });
      }

      setRows(parsed);
      toast.info(`Berhasil membaca ${parsed.length} baris data`);
    };

    reader.readAsText(file);
  };

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);

  const handleSaveImport = async () => {
    if (validRows.length === 0) {
      toast.error("Tidak ada baris data valid yang dapat disimpan");
      return;
    }

    setIsProcessing(true);

    const payload = validRows.map((r) => ({
      nis: r.nis,
      full_name: r.full_name,
      nisn: r.nisn || null,
      gender: r.gender,
      class_id: r.class_id!,
    }));

    const res = await importStudentsAction(payload);
    setIsProcessing(false);

    if (!res.ok) {
      toast.error(res.error || "Gagal mengimpor siswa");
      return;
    }

    toast.success(`Berhasil mengimpor ${payload.length} data siswa!`);
    router.push("/admin/siswa");
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/siswa">
              <button type="button" className="p-2 rounded-xl glass-solid hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Impor Data Siswa Masal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah berkas CSV/Excel, tinjau pratinjau validasi, dan simpan secara idempoten.
              </p>
            </div>
          </div>
          <GlassButton size="sm" variant="outline" onClick={handleDownloadTemplate} leftIcon={<Download className="w-4 h-4" />}>
            Unduh Template CSV
          </GlassButton>
        </div>

        {/* Upload Zone */}
        <GlassCard className="p-6 text-center space-y-4 border-2 border-dashed border-brand-500/30">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Pilih Berkas CSV / Excel Siswa
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {fileName ? `File terpilih: ${fileName}` : "Format file harus menyertakan header: nis, full_name, nisn, gender, class_name"}
            </p>
          </div>
          <label className="inline-block cursor-pointer">
            <span className="inline-flex items-center justify-center h-10 px-4 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition">
              Cari Berkas...
            </span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </GlassCard>

        {/* Preview Summary */}
        {rows.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl glass-solid">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> {validRows.length} Baris Valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" /> {invalidRows.length} Baris Error (Akan Dilewati)
                  </span>
                )}
              </div>
              <GlassButton
                size="sm"
                variant="primary"
                onClick={handleSaveImport}
                isLoading={isProcessing}
                disabled={validRows.length === 0}
              >
                Konfirmasi Simpan {validRows.length} Siswa
              </GlassButton>
            </div>

            {/* Table Preview */}
            <GlassTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Baris</TableHeaderCell>
                  <TableHeaderCell>NIS</TableHeaderCell>
                  <TableHeaderCell>Nama Siswa</TableHeaderCell>
                  <TableHeaderCell>L/P</TableHeaderCell>
                  <TableHeaderCell>Kelas</TableHeaderCell>
                  <TableHeaderCell>Status Validasi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {rows.map((r) => (
                  <TableRow key={r.rowNumber} className={!r.isValid ? "bg-rose-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{r.rowNumber}</TableCell>
                    <TableCell className="font-mono font-bold">{r.nis || "-"}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {r.full_name || "-"}
                    </TableCell>
                    <TableCell>{r.gender}</TableCell>
                    <TableCell>{r.class_name || "-"}</TableCell>
                    <TableCell>
                      {r.isValid ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                          Siap Diimpor
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400" title={r.errors.join(", ")}>
                          {r.errors.join("; ")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </GlassTable>
          </div>
        )}
      </div>
  );
}

