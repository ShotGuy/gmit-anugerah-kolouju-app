
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { LaporanKasResult } from '@/actions/keuangan/laporan';

export const generateExcelReport = async (
    data: LaporanKasResult,
    akunNama: string,
    signatories: { ketua: string; bendahara: string; kota: string; tanggal: string }
) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Kas');

    // --- STYLING ---
    const borderStyle: Partial<ExcelJS.Borders> = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    const headerFont = { bold: true, size: 10 };
    const titleFont = { bold: true, size: 12, underline: true };

    // --- HEADERS ---
    // Row 1-4
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'GEREJA MASEHI INJILI DI TIMOR';
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'JEMAAT ANUGERAH KOLUJU';
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:F3'); // Empty row

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value = `LAPORAN ${akunNama.toUpperCase()}`;
    worksheet.getCell('A4').font = titleFont;
    worksheet.getCell('A4').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A5:F5');
    worksheet.getCell('A5').value = `PERIODE ${data.periodeLabel.toUpperCase()}`;
    worksheet.getCell('A5').alignment = { horizontal: 'center' };
    worksheet.getCell('A5').font = { bold: true };

    // --- TABLE HEADER ---
    const headerRowIdx = 7;
    const headerRow = worksheet.getRow(headerRowIdx);
    headerRow.values = ['TGL/BLN', 'URAIAN', 'NO KWT', 'PENERIMAAN (RP)', 'PENGELUARAN (RP)', 'SALDO (Rp)'];

    // Widths
    worksheet.getColumn(1).width = 12; // Tgl
    worksheet.getColumn(2).width = 45; // Uraian
    worksheet.getColumn(3).width = 15; // No BKU
    worksheet.getColumn(4).width = 18; // Penerimaan
    worksheet.getColumn(5).width = 18; // Pengeluaran
    worksheet.getColumn(6).width = 18; // Saldo

    headerRow.eachCell((cell) => {
        cell.font = headerFont;
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEFEFEF' }
        };
    });

    // --- DATA ---
    let rowIdx = 8;

    // Saldo Awal Row
    const startRow = worksheet.getRow(rowIdx);
    startRow.values = ['-', 'Saldo Periode Lalu', '', null, null, data.saldoAwal];
    startRow.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        if (colNumber >= 4) cell.numFmt = '#,##0'; // Number format
    });
    rowIdx++;

    // Items
    data.items.forEach(item => {
        const row = worksheet.getRow(rowIdx);
        // Date format explanation: excel dates
        row.getCell(1).value = new Date(item.tanggal);
        row.getCell(1).numFmt = 'dd-mmm';

        row.getCell(2).value = item.uraian;
        row.getCell(3).value = item.noBukti || '';

        row.getCell(4).value = item.debet > 0 ? Number(item.debet) : null;
        row.getCell(5).value = item.kredit > 0 ? Number(item.kredit) : null;
        row.getCell(6).value = Number(item.saldoBerjalan);

        // Styling
        row.eachCell((cell, colNumber) => {
            cell.border = borderStyle;
            if (colNumber >= 4) cell.numFmt = '#,##0';
        });

        rowIdx++;
    });

    // Total Row
    const totalRow = worksheet.getRow(rowIdx);
    totalRow.getCell(2).value = "JUMLAH";
    totalRow.getCell(2).font = { bold: true };
    totalRow.getCell(2).alignment = { horizontal: 'center' };

    totalRow.getCell(4).value = data.totalDebet;
    totalRow.getCell(5).value = data.totalKredit;
    totalRow.getCell(6).value = data.saldoAkhir;

    totalRow.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        if (colNumber >= 4) {
            cell.numFmt = '#,##0';
            cell.font = { bold: true };
        }
    });

    // --- FOOTER SUMMARY ---
    rowIdx += 2;
    worksheet.getCell(`A${rowIdx}`).value = `Pada hari ini ${signatories.tanggal} Buku kas ${akunNama} ini ditutup dengan rincian sbb:`;
    rowIdx++;

    const addSummaryRow = (label: string, val: number, isTotal = false) => {
        const r = worksheet.getRow(rowIdx);
        r.getCell(2).value = label;
        r.getCell(4).value = val;
        r.getCell(4).numFmt = '"Rp. "#,##0';
        if (isTotal) {
            const cell = r.getCell(4);
            cell.font = { bold: true };
            cell.border = { top: { style: 'thin' } };
            r.getCell(2).font = { bold: true };
        }
        rowIdx++;
    };

    addSummaryRow('a. Saldo Periode Lalu', data.saldoAwal);
    addSummaryRow('b. Penerimaan Periode Ini', data.totalDebet);
    addSummaryRow('c. Pengeluaran Periode Ini', data.totalKredit);
    addSummaryRow('d. Saldo Kas Periode Ini', data.saldoAkhir, true);

    // --- SIGNATURES ---
    rowIdx += 3;
    worksheet.mergeCells(`D${rowIdx}:F${rowIdx}`);
    worksheet.getCell(`D${rowIdx}`).value = `${signatories.kota}, ${signatories.tanggal}`;
    worksheet.getCell(`D${rowIdx}`).alignment = { horizontal: 'center' };
    rowIdx += 1;

    worksheet.mergeCells(`B${rowIdx}:E${rowIdx}`);
    worksheet.getCell(`B${rowIdx}`).value = 'MAJELIS JEMAAT ANUGERAH KOLUJU';
    worksheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };
    rowIdx += 2;

    // Titles
    const sigRow = worksheet.getRow(rowIdx);
    sigRow.getCell(2).value = 'Ketua,';
    sigRow.getCell(5).value = 'Bendahara I,';
    sigRow.getCell(2).alignment = { horizontal: 'center' };
    sigRow.getCell(5).alignment = { horizontal: 'center' };

    // Space
    rowIdx += 4;

    // Names
    const nameRow = worksheet.getRow(rowIdx);
    nameRow.getCell(2).value = signatories.ketua;
    nameRow.getCell(5).value = signatories.bendahara;
    nameRow.getCell(2).font = { bold: true, underline: true };
    nameRow.getCell(5).font = { bold: true, underline: true };
    nameRow.getCell(2).alignment = { horizontal: 'center' };
    nameRow.getCell(5).alignment = { horizontal: 'center' };

    // SAVE
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan_${akunNama.replace(/\s/g, '_')}_${data.periodeLabel}.xlsx`);
};
