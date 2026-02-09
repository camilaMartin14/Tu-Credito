import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (title: string, headers: string[], data: string[][], filename: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
