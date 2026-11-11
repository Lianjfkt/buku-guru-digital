import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportAttendanceOptions } from './attendanceExcel';

export function generateAttendancePdf(options: ExportAttendanceOptions): Uint8Array {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header Sekolah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`REKAP KEHADIRAN SISWA - ${options.schoolName.toUpperCase()}`, 148.5, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Mata Pelajaran: ${options.subjectName} | Kelas: ${options.className} | Periode: ${options.semesterName}`,
    148.5,
    22,
    { align: 'center' }
  );
  doc.text(`Guru Pengampu: ${options.teacherName} | Batas Minimal: ${options.threshold}%`, 148.5, 27, { align: 'center' });

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(14, 31, 283, 31);

  // Table Body
  const tableData = options.data.map((st, idx) => [
    idx + 1,
    st.nis,
    st.full_name,
    st.gender,
    st.hadir_count,
    st.sakit_count,
    st.izin_count,
    st.alpa_count,
    `${st.attendance_percentage}%`,
    st.needs_attention ? 'Perlu Perhatian' : 'Aman',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['No', 'NIS', 'Nama Siswa', 'L/P', 'H', 'S', 'I', 'A', '% Hadir', 'Keterangan']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'left', cellWidth: 70 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'center', cellWidth: 25 },
      9: { halign: 'center', cellWidth: 35 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const row = options.data[data.row.index];
        if (row && row.attendance_percentage < options.threshold) {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
  });

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

