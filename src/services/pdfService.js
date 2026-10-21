/**
 * Seya Books PDF Generation Service
 * Generates:
 * 1. Clean professional Financial Statement PDFs
 * 2. Official-style Anlage EÜR (ELSTER) Tax Statements
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCategoryById } from './elsterService.js';

/**
 * Generates a clean, modern PDF statement
 */
export function generateStatementPDF({
  periodLabel = 'Year 2026',
  transactions = [],
  totals = {},
  taxSummary = {},
  ownerName = 'Sole Proprietor',
  businessTitle = 'Independent Professional',
  taxNumber = ''
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const emeraldColor = [16, 185, 129]; // Emerald 500
  const grayColor = [100, 116, 139]; // Slate 500

  // 1. Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('SEYA BOOKS', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Business Financial Statement & P&L Ledger', 14, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Period: ${periodLabel}`, 196, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleDateString('de-DE')}`, 196, 23, { align: 'right' });

  // 2. Business Owner Info Box
  let y = 40;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(ownerName, 14, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`${businessTitle} ${taxNumber ? `• St.-Nr: ${taxNumber}` : ''}`, 14, y + 5);

  // 3. KPI Highlights Cards (Revenue, Expenses, Net Profit, Tax Reserve)
  y = 52;
  const cardWidth = 43;
  const cardHeight = 22;
  const cards = [
    { label: 'Net Revenue', val: `€${(totals.totalIncomeNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, color: [16, 185, 129] },
    { label: 'Deductible Exp.', val: `€${(totals.totalDeductibleExpense || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, color: [244, 63, 94] },
    { label: 'Net Profit (EÜR)', val: `€${(totals.netBusinessProfit || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, color: [59, 130, 246] },
    { label: 'Est. Tax Reserve', val: `€${(taxSummary.totalTaxReserve || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, color: [245, 158, 11] }
  ];

  cards.forEach((c, i) => {
    const x = 14 + i * (cardWidth + 6);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(c.label, x + 4, y + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...c.color);
    doc.text(c.val, x + 4, y + 16);
  });

  // 4. Itemized Transaction Ledger Table
  y = 82;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Transaction Ledger', 14, y);

  const tableRows = transactions.map(t => {
    const cat = getCategoryById(t.category);
    const isIncome = t.type === 'income';
    const amountStr = `${isIncome ? '+' : '-'}€${Number(t.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
    return [
      t.date || '',
      t.type === 'income' ? 'Income' : 'Expense',
      cat.shortName || t.category || '',
      t.description || (isIncome ? 'Customer Payment' : 'Business Expense'),
      t.clientName || '-',
      t.bankName || 'Default',
      amountStr
    ];
  });

  autoTable(doc, {
    startY: y + 4,
    head: [['Date', 'Type', 'Category', 'Description', 'Client', 'Account', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
      2: { cellWidth: 35 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 25 },
      5: { cellWidth: 22 },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    }
  });

  // Footer page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} • Seya Books • Private & Confidential`, 105, 290, { align: 'center' });
  }

  doc.save(`Seya_Books_Statement_${periodLabel.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates an Anlage EÜR summary PDF formatted for German ELSTER filing
 */
export function generateElsterEuerPDF({
  taxYear = '2026',
  euerSummary = {},
  taxAssessment = {},
  ownerName = 'Sole Proprietor',
  taxNumber = '12/345/67890',
  isKleinunternehmer = true
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header
  doc.setFillColor(20, 30, 45);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('ANLAGE EÜR - ÜBERSICHT', 14, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Vorbereitung für die elektronische Steuererklärung (ELSTER)', 14, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Steuerjahr: ${taxYear}`, 196, 15, { align: 'right' });

  // Details
  let y = 40;
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Steuerpflichtiger: ${ownerName}`, 14, y);
  doc.text(`Steuernummer: ${taxNumber || 'Nicht hinterlegt'}`, 120, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Besteuerungsart: ${isKleinunternehmer ? 'Kleinunternehmer gem. § 19 Abs. 1 UStG (steuerfrei)' : 'Regelbesteuerung (USt-pflichtig)'}`, 14, y + 6);

  // Table of EÜR Lines
  y = 54;
  const rows = [];

  // Income lines
  rows.push([{ content: '1. BETRIEBSEINNAHMEN', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }]);
  
  euerSummary.categories.filter(c => c.category.type === 'income').forEach(item => {
    rows.push([
      item.category.code,
      item.category.name,
      `€${item.netTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      `€${item.grossTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
    ]);
  });

  rows.push([
    'Summe',
    'Summe der Betriebseinnahmen',
    `€${euerSummary.totals.totalIncomeNet.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
    `€${euerSummary.totals.totalIncomeGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
  ]);

  // Expense lines
  rows.push([{ content: '2. BETRIEBSAUSGABEN', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }]);

  euerSummary.categories.filter(c => c.category.type === 'expense').forEach(item => {
    rows.push([
      item.category.code,
      item.category.name,
      `€${item.deductibleTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      `€${item.grossTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
    ]);
  });

  rows.push([
    'Summe',
    'Summe der abzugsfähigen Betriebsausgaben',
    `€${euerSummary.totals.totalDeductibleExpense.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
    `€${euerSummary.totals.totalExpenseGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
  ]);

  // Final Profit
  rows.push([{ content: '3. GEWINNERMITTLUNG (§ 4 Abs. 3 EStG)', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [224, 242, 254], textColor: [3, 105, 161] } }]);
  rows.push([
    'Zeile 71',
    'Steuerlicher Gewinn / Einnahmenüberschuss',
    `€${euerSummary.totals.netBusinessProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
    ''
  ]);

  autoTable(doc, {
    startY: y,
    head: [['ELSTER Zeile', 'Bezeichnung / Kategorie', 'Steuerlich wirksam (Netto)', 'Bruttobetrag']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 38, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 30, halign: 'right' }
    }
  });

  // Footer notes & tax summary
  const finalY = (doc).lastAutoTable.finalY + 8;
  if (finalY < 240) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Steuerliche Zusammenfassung & Rücklagen-Empfehlung:', 14, finalY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`• Voraussichtliche Einkommensteuer: €${(taxAssessment.incomeTax || 0).toLocaleString('de-DE')}`, 14, finalY + 5);
    doc.text(`• Solidaritätszuschlag: €${(taxAssessment.solidaritySurcharge || 0).toLocaleString('de-DE')}`, 14, finalY + 10);
    doc.text(`• Gewerbesteuer (falls zutreffend): €${(taxAssessment.gewerbesteuer || 0).toLocaleString('de-DE')}`, 14, finalY + 15);
    doc.text(`• Empfohlene Gesamtrücklage für das Finanzamt: €${(taxAssessment.totalTaxReserve || 0).toLocaleString('de-DE')}`, 14, finalY + 20);
    doc.text(`• Kleinunternehmer Prüfung (Vorjahr / laufendes Jahr 25.000 € / 100.000 €): ${taxAssessment.kleinunternehmer?.statusMessage || 'OK'}`, 14, finalY + 25);
  }

  doc.save(`Anlage_EUER_ELSTER_${taxYear}.pdf`);
}
