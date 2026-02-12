import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PrestamoDTO, ResumenPrestamoDTO, Cuota, PagoOutputDTO } from '../types';
import { formatCurrency, formatDate } from './formatters';
import { getPaymentMethodLabel } from '../types/enums';

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

export const exportLoanDetailPDF = (loan: PrestamoDTO, summary: ResumenPrestamoDTO | undefined, installments: Cuota[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(124, 58, 237); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(`Préstamo #${loan.idPrestamo}`, 14, 25);
  
  
  doc.text(`Nro. Comprobante:`, 15, 45);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: 'right' });

  // Client Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Información del Cliente', 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  
  // Left Column
  doc.text('Cliente:', 14, 65);
  doc.setTextColor(0);
  doc.text(loan.nombrePrestatario, 40, 65);
  
  doc.setTextColor(100);
  doc.text('DNI:', 14, 72);
  doc.setTextColor(0);
  doc.text(loan.dniPrestatario.toString(), 40, 72);

  // Right Column (Loan Details)
  doc.setTextColor(100);
  doc.text('Monto Otorgado:', pageWidth / 2, 65);
  doc.setTextColor(0);
  doc.text(formatCurrency(loan.montoOtorgado, loan.moneda), (pageWidth / 2) + 35, 65);

  doc.setTextColor(100);
  doc.text('Tasa Interés:', pageWidth / 2, 72);
  doc.setTextColor(0);
  doc.text(`${loan.tasaInteres}% Mensual`, (pageWidth / 2) + 35, 72);

  doc.setTextColor(100);
  doc.text('Fecha Otorgamiento:', pageWidth / 2, 79);
  doc.setTextColor(0);
  doc.text(formatDate(loan.fechaOtorgamiento), (pageWidth / 2) + 35, 79);

  // Summary Section (if available)
  let startY = 95;
  if (summary) {
    doc.setDrawColor(200);
    doc.line(14, 85, pageWidth - 14, 85);
    
    doc.setFontSize(12);
    doc.text('Resumen', 14, 95);
    
    doc.setFontSize(10);
    doc.text(`Cuotas Totales: ${summary.cantidadCuotasOriginales}`, 14, 105);
    doc.text(`Cuotas Pagadas: ${summary.cantidadCuotasEfectivas}`, 60, 105);
    doc.text(`Meses Activo: ${summary.mesesActivo}`, 110, 105);
    
    startY = 115;
  }

  // Installments Table
  doc.setFontSize(14);
  doc.text('Plan de Cuotas', 14, startY);

  const tableData = installments.map(cuota => [
    `${cuota.nroCuota}/${loan.cantidadCtas}`,
    formatDate(cuota.fecVto),
    formatCurrency(cuota.monto, loan.moneda),
    cuota.saldoPendiente ? formatCurrency(cuota.saldoPendiente, loan.moneda) : '-',
    cuota.idEstado === 2 ? 'Pagada' : cuota.idEstado === 1 ? 'Pendiente' : 'Vencida'
  ]);

  autoTable(doc, {
    head: [['Cuota', 'Vencimiento', 'Monto', 'Saldo', 'Estado']],
    body: tableData,
    startY: startY + 5,
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });

  doc.save(`Prestamo_${loan.idPrestamo}_${loan.dniPrestatario}.pdf`);
};

export const exportPaymentVoucherPDF = (payment: PagoOutputDTO) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // Voucher size usually smaller, A5 is good
  });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Border
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  // Header
  doc.setFillColor(124, 58, 237);
  doc.rect(6, 6, pageWidth - 12, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('COMPROBANTE DE PAGO', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Tu Credito', pageWidth / 2, 25, { align: 'center' });

  // Voucher Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  doc.text(`Nro. Comprobante:`, 15, 45);
  doc.setFont("helvetica", "bold");
  doc.text(`#${payment.idPago.toString().padStart(8, '0')}`, 50, 45);
  doc.setFont("helvetica", "normal");

  doc.text(`Fecha:`, 15, 52);
  doc.text(payment.fecPago ? new Date(payment.fecPago).toLocaleDateString() + ' ' + new Date(payment.fecPago).toLocaleTimeString() : '-', 50, 52);

  // Client Info
  doc.setDrawColor(200);
  doc.line(15, 60, pageWidth - 15, 60);
  
  doc.text(`Cliente:`, 15, 70);
  doc.setFont("helvetica", "bold");
  const clienteNombre = payment.nombreCliente && payment.apellidoCliente 
    ? `${payment.nombreCliente} ${payment.apellidoCliente}`
    : 'Consumidor Final';
  doc.text(clienteNombre, 50, 70);
  doc.setFont("helvetica", "normal");

  if (payment.dniCliente) {
    doc.text(`DNI:`, 15, 77);
    doc.text(payment.dniCliente.toString(), 50, 77);
  }

  // Payment Details
  doc.line(15, 85, pageWidth - 15, 85);
  
  doc.text(`Concepto:`, 15, 95);
  doc.text(`Pago de Cuota #${payment.nroCuota}`, 50, 95);
  
  doc.text(`Medio de Pago:`, 15, 102);
  doc.text(getPaymentMethodLabel(Number(payment.medioPago)), 50, 102);

  // Amount
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 115, pageWidth - 30, 25, 'F');
  
  doc.setFontSize(12);
  doc.text('Total Pagado', pageWidth / 2, 122, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(124, 58, 237);
  doc.text(formatCurrency(payment.monto), pageWidth / 2, 133, { align: 'center' });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text('Este documento sirve como constancia de pago válida.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('Gracias por confiar en nosotros.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`Comprobante_Pago_${payment.idPago}.pdf`);
};
