import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData, InvoiceItem } from '../types';

export function formatCurrency(amount: number, symbol: string = 'Rp'): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
  return `${symbol} ${formatted}`;
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxPercentage: number = 0,
  discountAmount: number = 0
): { subtotal: number; taxAmount: number; totalAmount: number } {
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = (subtotal * Math.max(0, taxPercentage)) / 100;
  const totalAmount = Math.max(
    0,
    subtotal + taxAmount - Math.max(0, discountAmount)
  );

  return { subtotal, taxAmount, totalAmount };
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = '#1E293B'; // Slate 800
  const accentColor = '#2563EB'; // Blue 600
  const textColor = '#334155'; // Slate 700
  const lightBg = '#F8FAFC'; // Slate 50

  // Margins
  const marginLeft = 15;
  const marginRight = 195;
  let currentY = 15;

  // 1. Header & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(accentColor);
  doc.text('INVOICE', marginLeft, currentY + 5);

  // Invoice Meta (Right-aligned)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text(`NO. INVOICE: ${data.invoiceNumber}`, marginRight, currentY, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);
  doc.text(
    `Tanggal: ${data.issueDate}${data.dueDate ? ` | Jatuh Tempo: ${data.dueDate}` : ''}`,
    marginRight,
    currentY + 5,
    { align: 'right' }
  );

  currentY += 18;

  // Decorative Divider Line
  doc.setDrawColor('#E2E8F0');
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, marginRight, currentY);

  currentY += 8;

  // 2. Sender & Client Information Blocks
  const blockWidth = 85;

  // --- Sender Block (Left) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor);
  doc.text('DARI:', marginLeft, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textColor);
  let senderY = currentY + 5;

  doc.setFont('helvetica', 'bold');
  doc.text(data.senderName || 'Nama Perusahaan/Penyedia', marginLeft, senderY);
  doc.setFont('helvetica', 'normal');
  senderY += 4.5;

  if (data.senderEmail) {
    doc.text(data.senderEmail, marginLeft, senderY);
    senderY += 4.5;
  }
  if (data.senderPhone) {
    doc.text(data.senderPhone, marginLeft, senderY);
    senderY += 4.5;
  }
  if (data.senderAddress) {
    const splitAddress = doc.splitTextToSize(data.senderAddress, blockWidth);
    doc.text(splitAddress, marginLeft, senderY);
    senderY += splitAddress.length * 4.5;
  }

  // --- Client Block (Right) ---
  const clientX = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor);
  doc.text('TAGIHAN KEPADA:', clientX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textColor);
  let clientY = currentY + 5;

  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName || 'Nama Klien/Perusahaan', clientX, clientY);
  doc.setFont('helvetica', 'normal');
  clientY += 4.5;

  if (data.clientEmail) {
    doc.text(data.clientEmail, clientX, clientY);
    clientY += 4.5;
  }
  if (data.clientAddress) {
    const splitClientAddr = doc.splitTextToSize(data.clientAddress, blockWidth);
    doc.text(splitClientAddr, clientX, clientY);
    clientY += splitClientAddr.length * 4.5;
  }

  currentY = Math.max(senderY, clientY) + 8;

  // 3. Items Table (jsPDF-AutoTable)
  const tableRows = data.items.map((item, index) => [
    (index + 1).toString(),
    item.description || '-',
    item.quantity.toString(),
    formatCurrency(item.unitPrice, data.currencySymbol),
    formatCurrency(item.quantity * item.unitPrice, data.currencySymbol),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No.', 'Deskripsi Item', 'Jml', 'Harga Satuan', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 38, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: lightBg,
    },
    margin: { left: marginLeft, right: 15 },
  });

  // Get final Y position after table
  // @ts-expect-error autoTable adds lastAutoTable property to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // 4. Totals Summary Box (Right Aligned)
  const summaryXLabel = 120;
  const summaryXValue = marginRight;

  doc.setFontSize(9);

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);
  doc.text('Subtotal:', summaryXLabel, currentY);
  doc.text(
    formatCurrency(data.subtotal, data.currencySymbol),
    summaryXValue,
    currentY,
    { align: 'right' }
  );
  currentY += 5;

  // Discount (if any)
  if (data.discountAmount > 0) {
    doc.text('Diskon:', summaryXLabel, currentY);
    doc.text(
      `- ${formatCurrency(data.discountAmount, data.currencySymbol)}`,
      summaryXValue,
      currentY,
      { align: 'right' }
    );
    currentY += 5;
  }

  // Tax (if any)
  if (data.taxPercentage > 0) {
    doc.text(`Pajak (${data.taxPercentage}%):`, summaryXLabel, currentY);
    doc.text(
      formatCurrency(data.taxAmount, data.currencySymbol),
      summaryXValue,
      currentY,
      { align: 'right' }
    );
    currentY += 5;
  }

  // Grand Total Box
  currentY += 2;
  doc.setFillColor(primaryColor);
  doc.roundedRect(summaryXLabel - 5, currentY - 4, 80, 10, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#FFFFFF');
  doc.text('TOTAL TAGIHAN:', summaryXLabel, currentY + 2);
  doc.text(
    formatCurrency(data.totalAmount, data.currencySymbol),
    summaryXValue,
    currentY + 2,
    { align: 'right' }
  );

  currentY += 15;

  // 5. Notes & Payment Terms (Footer Block)
  if (data.notes || data.paymentTerms) {
    doc.setDrawColor('#E2E8F0');
    doc.setLineWidth(0.3);
    doc.line(marginLeft, currentY, marginRight, currentY);
    currentY += 6;

    if (data.paymentTerms) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor);
      doc.text('Ketentuan Pembayaran:', marginLeft, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      const splitTerms = doc.splitTextToSize(
        data.paymentTerms,
        marginRight - marginLeft
      );
      doc.text(splitTerms, marginLeft, currentY);
      currentY += splitTerms.length * 4 + 3;
    }

    if (data.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor);
      doc.text('Catatan Tambahan:', marginLeft, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      const splitNotes = doc.splitTextToSize(
        data.notes,
        marginRight - marginLeft
      );
      doc.text(splitNotes, marginLeft, currentY);
    }
  }

  // Export as Blob
  return doc.output('blob');
}