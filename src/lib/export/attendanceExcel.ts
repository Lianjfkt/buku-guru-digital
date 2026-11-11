import ExcelJS from 'exceljs';

export interface AttendanceStudentSummary {
  student_id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string;
  total_meetings: number;
  hadir_count: number;
  sakit_count: number;
  izin_count: number;
  alpa_count: number;
  attendance_percentage: number;
  needs_attention: boolean;
}

export interface ExportAttendanceOptions {
  schoolName: string;
  subjectName: string;
  className: string;
  semesterName: string;
  teacherName: string;
  threshold: number;
  data: AttendanceStudentSummary[];
}

export async function generateAttendanceExcel(options: ExportAttendanceOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ruang Guru Digital';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Rekap Kehadiran', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }, // A4 landscape
  });

  // Judul & Header Info Sekolah
  sheet.mergeCells('A1:I1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `REKAP PRESENSI SISWA - ${options.schoolName.toUpperCase()}`;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A2:I2');
  const subTitle = sheet.getCell('A2');
  subTitle.value = `Mata Pelajaran: ${options.subjectName} | Kelas: ${options.className} | Periode: ${options.semesterName}`;
  subTitle.font = { italic: true, size: 11, color: { argb: 'FF475569' } };
  subTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A3:I3');
  const teacherCell = sheet.getCell('A3');
  teacherCell.value = `Guru Pengampu: ${options.teacherName}`;
  teacherCell.font = { size: 10, color: { argb: 'FF64748B' } };
  teacherCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.addRow([]); // Blank row

  // Table Headers (Row 5)
  const headerRow = sheet.addRow([
    'No',
    'NIS',
    'Nama Lengkap Siswa',
    'L/P',
    'Hadir (H)',
    'Sakit (S)',
    'Izin (I)',
    'Alpa (A)',
    '% Kehadiran',
  ]);

  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }, // Blue 500
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Data rows
  options.data.forEach((st, idx) => {
    const row = sheet.addRow([
      idx + 1,
      st.nis,
      st.full_name,
      st.gender,
      st.hadir_count,
      st.sakit_count,
      st.izin_count,
      st.alpa_count,
      `${st.attendance_percentage}%`,
    ]);

    const isBelowThreshold = st.attendance_percentage < options.threshold;

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if ([1, 2, 4, 5, 6, 7, 8, 9].includes(colNumber)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      if (isBelowThreshold) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF1F2' }, // Red 50
        };
      }
    });

    if (isBelowThreshold) {
      row.getCell(9).font = { bold: true, color: { argb: 'FFE11D48' } };
    }
  });

  // Adjust column widths
  sheet.getColumn(1).width = 6;
  sheet.getColumn(2).width = 14;
  sheet.getColumn(3).width = 32;
  sheet.getColumn(4).width = 8;
  sheet.getColumn(5).width = 12;
  sheet.getColumn(6).width = 12;
  sheet.getColumn(7).width = 12;
  sheet.getColumn(8).width = 12;
  sheet.getColumn(9).width = 15;

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

