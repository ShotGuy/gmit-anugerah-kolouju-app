import { format } from "date-fns";
import { id } from "date-fns/locale";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

class ExportService {
  constructor() {
    this.defaultConfig = {
      companyName: "GMIT Betlehem Oesapa Barat",
      companyAddress: "Alamat Gereja",
      companyPhone: "Telepon Gereja",
      logo: null, // Can be added later
    };
  }

  // Main export function
  async exportJemaat(data, config) {
    const { format: exportFormat } = config;

    switch (exportFormat) {
      case "pdf":
        return this.exportToPDF(data, config);
      case "excel":
        return this.exportToExcel(data, config);
      case "csv":
        return this.exportToCSV(data, config);
      default:
        throw new Error("Unsupported export format");
    }
  }

  // PDF Export
  async exportToPDF(data, config) {
    const doc = new jsPDF({
      orientation: config.orientation || "portrait",
      unit: "mm",
      format: config.pageSize || "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header
    if (config.includeHeader) {
      this.addPDFHeader(doc, config, pageWidth, margin);
    }

    // Title and subtitle
    let yPosition = config.includeHeader ? 60 : 20;

    if (config.title) {
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(config.title, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;
    }

    if (config.subtitle) {
      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(config.subtitle, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;
    }

    // Statistics
    if (config.includeStats) {
      yPosition = this.addPDFStats(
        doc,
        data,
        config,
        yPosition,
        pageWidth,
        margin
      );
    }

    // Data based on layout
    switch (config.layout) {
      case "table":
        this.addPDFTable(doc, data, config, yPosition, pageWidth, margin);
        break;
      case "cards":
        this.addPDFCards(doc, data, config, yPosition, pageWidth, margin);
        break;
      case "detailed":
        this.addPDFDetailed(doc, data, config, yPosition, pageWidth, margin);
        break;
    }

    // Footer
    if (config.includeFooter) {
      this.addPDFFooter(doc, config, pageWidth, pageHeight, margin);
    }

    // Generate filename
    const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
    const filename = `jemaat-export-${timestamp}.pdf`;

    // Download
    doc.save(filename);

    return { success: true, filename };
  }

  // Excel Export
  async exportToExcel(data, config) {
    const wb = XLSX.utils.book_new();

    // Group data if needed
    const groupedData = this.groupData(data, config.groupBy);

    if (config.groupBy === "none") {
      // Single sheet
      const ws = this.createExcelSheet(data, config, "Data Jemaat");

      XLSX.utils.book_append_sheet(wb, ws, "Data Jemaat");
    } else {
      // Multiple sheets by group
      Object.entries(groupedData).forEach(([groupName, groupData]) => {
        const sheetName = `${groupName}`.substring(0, 31); // Excel sheet name limit
        const ws = this.createExcelSheet(groupData, config, sheetName);

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // Summary sheet
      if (config.includeSummary) {
        const summaryData = this.createSummaryData(groupedData);
        const summaryWS = XLSX.utils.json_to_sheet(summaryData);

        XLSX.utils.book_append_sheet(wb, summaryWS, "Ringkasan");
      }
    }

    // Generate filename and download
    const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
    const filename = `jemaat-export-${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);

    return { success: true, filename };
  }

  // CSV Export
  async exportToCSV(data, config) {
    const processedData = this.processDataForExport(data, config);
    const ws = XLSX.utils.json_to_sheet(processedData);
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Download
    const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
    const filename = `jemaat-export-${timestamp}.csv`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename };
  }

  // Helper Methods
  addPDFHeader(doc, config, pageWidth, margin) {
    // Company logo (if available)
    // doc.addImage(logo, 'PNG', margin, 10, 30, 30);

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(this.defaultConfig.companyName, pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(this.defaultConfig.companyAddress, pageWidth / 2, 28, {
      align: "center",
    });
    doc.text(this.defaultConfig.companyPhone, pageWidth / 2, 35, {
      align: "center",
    });

    // Line separator
    doc.line(margin, 45, pageWidth - margin, 45);
  }

  addPDFStats(doc, data, config, yPosition, pageWidth, margin) {
    const stats = this.calculateStats(data);

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Statistik Data:", margin, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const statLines = [
      `Total Jemaat: ${stats.total}`,
      `Laki-laki: ${stats.male} (${((stats.male / stats.total) * 100).toFixed(1)}%)`,
      `Perempuan: ${stats.female} (${((stats.female / stats.total) * 100).toFixed(1)}%)`,
      `Tanggal Export: ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}`,
    ];

    statLines.forEach((line, index) => {
      doc.text(line, margin, yPosition + index * 5);
    });

    return yPosition + statLines.length * 5 + 10;
  }

  addPDFTable(doc, data, config, yPosition, pageWidth, margin) {
    const processedData = this.processDataForExport(data, config);
    const columns = this.getSelectedColumns(config);

    // Check if autoTable is available
    if (typeof doc.autoTable !== "function") {
      console.error("autoTable plugin not available");
      // Fallback: add text-based table
      this.addSimpleTable(doc, processedData, columns, yPosition, margin);

      return;
    }

    try {
      doc.autoTable({
        head: [columns.map((col) => col.label)],
        body: processedData.map((row) =>
          columns.map((col) => row[col.key] || "-")
        ),
        startY: yPosition,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: (data) => {
          // Page numbers
          doc.setFontSize(8);
          doc.text(
            `Halaman ${doc.internal.getCurrentPageInfo().pageNumber}`,
            pageWidth - margin,
            data.cursor.y + 10,
            { align: "right" }
          );
        },
      });
    } catch (error) {
      console.error("Error creating autoTable:", error);
      // Fallback to simple table
      this.addSimpleTable(doc, processedData, columns, yPosition, margin);
    }
  }

  // Fallback method for simple table without autoTable
  addSimpleTable(doc, data, columns, yPosition, margin) {
    let currentY = yPosition;
    const lineHeight = 6;
    const columnWidth =
      (doc.internal.pageSize.getWidth() - margin * 2) / columns.length;

    // Header
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    columns.forEach((col, index) => {
      doc.text(col.label, margin + index * columnWidth, currentY);
    });
    currentY += lineHeight;

    // Data rows
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    data.forEach((row, rowIndex) => {
      if (currentY > 250) {
        // New page
        doc.addPage();
        currentY = 20;

        // Re-add header on new page
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        columns.forEach((col, index) => {
          doc.text(col.label, margin + index * columnWidth, currentY);
        });
        currentY += lineHeight;
        doc.setFont(undefined, "normal");
        doc.setFontSize(8);
      }

      columns.forEach((col, index) => {
        const value = row[col.key] || "-";
        const text = String(value).substring(0, 15); // Limit text length

        doc.text(text, margin + index * columnWidth, currentY);
      });
      currentY += lineHeight;
    });
  }

  addPDFCards(doc, data, config, yPosition, pageWidth, margin) {
    const processedData = this.processDataForExport(data, config);
    let currentY = yPosition;

    processedData.forEach((jemaat, index) => {
      if (currentY > 250) {
        // New page
        doc.addPage();
        currentY = 20;
      }

      // Card border
      doc.rect(margin, currentY, pageWidth - margin * 2, 40);

      // Name
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(jemaat.nama || "-", margin + 5, currentY + 10);

      // Details
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(
        `Jenis Kelamin: ${jemaat.jenisKelamin || "-"}`,
        margin + 5,
        currentY + 18
      );
      doc.text(
        `Status: ${jemaat.statusDalamKeluarga || "-"}`,
        margin + 5,
        currentY + 26
      );
      doc.text(`Rayon: ${jemaat.rayonName || "-"}`, margin + 5, currentY + 34);

      currentY += 50;
    });
  }

  addPDFDetailed(doc, data, config, yPosition, pageWidth, margin) {
    const processedData = this.processDataForExport(data, config);
    let currentY = yPosition;

    processedData.forEach((jemaat, index) => {
      if (currentY > 200) {
        // New page
        doc.addPage();
        currentY = 20;
      }

      // Name header
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(`${index + 1}. ${jemaat.nama || "-"}`, margin, currentY);
      currentY += 8;

      // Details in two columns
      const columns = this.getSelectedColumns(config);
      let leftColumn = true;

      columns.slice(1).forEach((col) => {
        // Skip name as it's already shown
        const value = jemaat[col.key] || "-";
        const x = leftColumn ? margin + 5 : pageWidth / 2 + 5;

        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.text(`${col.label}: ${value}`, x, currentY);

        if (!leftColumn) currentY += 5;
        leftColumn = !leftColumn;
      });

      currentY += 15; // Space between records
    });
  }

  addPDFFooter(doc, config, pageWidth, pageHeight, margin) {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

      // Footer text
      doc.setFontSize(8);
      doc.text(
        `Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")} - GMIT Betlehem Oesapa Barat`,
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );
    }
  }

  createExcelSheet(data, config, sheetName) {
    const processedData = this.processDataForExport(data, config);
    const ws = XLSX.utils.json_to_sheet(processedData);

    // Set column widths
    const columns = this.getSelectedColumns(config);

    ws["!cols"] = columns.map((col) => ({
      width: col.key === "nama" ? 25 : 15,
    }));

    // Add title if provided
    if (config.title) {
      XLSX.utils.sheet_add_aoa(ws, [[config.title]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A2" }); // Empty row
    }

    return ws;
  }

  processDataForExport(data, config) {
    return data.map((jemaat) => {
      const processed = {};
      const fields = config.includeFields;

      // Basic fields
      if (fields.id) processed["ID Jemaat"] = jemaat.id;
      if (fields.nama) processed["Nama"] = jemaat.nama;
      if (fields.jenisKelamin)
        processed["Jenis Kelamin"] = jemaat.jenisKelamin
          ? "Laki-laki"
          : "Perempuan";
      if (fields.tanggalLahir)
        processed["Tanggal Lahir"] = jemaat.tanggalLahir
          ? format(new Date(jemaat.tanggalLahir), "dd/MM/yyyy")
          : "-";
      if (fields.golonganDarah)
        processed["Golongan Darah"] = jemaat.golonganDarah || "-";
      if (fields.statusJemaat)
        processed["Status Jemaat"] = jemaat.status || "-";
      if (fields.statusDalamKeluarga)
        processed["Status Keluarga"] =
          jemaat.statusDalamKeluarga?.status || "-";

      // Keluarga fields
      if (fields.keluarga?.noBagungan)
        processed["No. Bagungan"] = jemaat.keluarga?.noBagungan || "-";
      if (fields.keluarga?.rayon)
        processed["Rayon"] = jemaat.keluarga?.rayon?.namaRayon || "-";
      if (fields.keluarga?.statusKeluarga)
        processed["Status Keluarga"] =
          jemaat.keluarga?.statusKeluarga?.status || "-";
      if (fields.keluarga?.kepemilikanRumah)
        processed["Kepemilikan Rumah"] =
          jemaat.keluarga?.statusKepemilikanRumah?.status || "-";
      if (fields.keluarga?.keadaanRumah)
        processed["Keadaan Rumah"] =
          jemaat.keluarga?.keadaanRumah?.keadaan || "-";

      // Alamat fields
      if (fields.alamat?.kelurahan)
        processed["Kelurahan"] =
          jemaat.keluarga?.alamat?.kelurahan?.nama || "-";
      if (fields.alamat?.kecamatan)
        processed["Kecamatan"] =
          jemaat.keluarga?.alamat?.kelurahan?.kecamatan?.nama || "-";
      if (fields.alamat?.kotaKab)
        processed["Kota/Kabupaten"] =
          jemaat.keluarga?.alamat?.kelurahan?.kecamatan?.kotaKab?.nama || "-";
      if (fields.alamat?.provinsi)
        processed["Provinsi"] =
          jemaat.keluarga?.alamat?.kelurahan?.kecamatan?.kotaKab?.provinsi
            ?.nama || "-";
      if (fields.alamat?.rt)
        processed["RT"] = jemaat.keluarga?.alamat?.rt || "-";
      if (fields.alamat?.rw)
        processed["RW"] = jemaat.keluarga?.alamat?.rw || "-";
      if (fields.alamat?.jalan)
        processed["Jalan"] = jemaat.keluarga?.alamat?.jalan || "-";

      // Social & Economic fields
      if (fields.suku) processed["Suku"] = jemaat.suku?.namaSuku || "-";
      if (fields.pendidikan)
        processed["Pendidikan"] = jemaat.pendidikan?.jenjang || "-";
      if (fields.pekerjaan)
        processed["Pekerjaan"] = jemaat.pekerjaan?.namaPekerjaan || "-";
      if (fields.pendapatan)
        processed["Pendapatan"] = jemaat.pendapatan?.label || "-";
      if (fields.jaminanKesehatan)
        processed["Jaminan Kesehatan"] =
          jemaat.jaminanKesehatan?.jenisJaminan || "-";

      // User account fields
      if (fields.userAccount)
        processed["Status Akun"] = jemaat.User ? "Ada Akun" : "Tidak Ada Akun";
      if (fields.userRole) processed["Role User"] = jemaat.User?.role || "-";

      return processed;
    });
  }

  getSelectedColumns(config) {
    const columns = [];
    const fields = config.includeFields;

    if (fields.id) columns.push({ key: "ID Jemaat", label: "ID Jemaat" });
    if (fields.nama) columns.push({ key: "Nama", label: "Nama" });
    if (fields.jenisKelamin)
      columns.push({ key: "Jenis Kelamin", label: "JK" });
    if (fields.tanggalLahir)
      columns.push({ key: "Tanggal Lahir", label: "Tgl Lahir" });
    if (fields.statusDalamKeluarga)
      columns.push({ key: "Status Keluarga", label: "Status" });
    if (fields.keluarga?.noBagungan)
      columns.push({ key: "No. Bagungan", label: "No. Bag" });
    if (fields.keluarga?.rayon) columns.push({ key: "Rayon", label: "Rayon" });
    if (fields.suku) columns.push({ key: "Suku", label: "Suku" });
    if (fields.pendidikan)
      columns.push({ key: "Pendidikan", label: "Pendidikan" });
    if (fields.pekerjaan)
      columns.push({ key: "Pekerjaan", label: "Pekerjaan" });

    return columns;
  }

  groupData(data, groupBy) {
    if (groupBy === "none") return { "All Data": data };

    const grouped = {};

    data.forEach((jemaat) => {
      let groupKey = "Unknown";

      switch (groupBy) {
        case "rayon":
          groupKey = jemaat.keluarga?.rayon?.namaRayon || "Tanpa Rayon";
          break;
        case "keluarga":
          groupKey = `${jemaat.keluarga?.rayon?.namaRayon || "Unknown"} - ${jemaat.keluarga?.noBagungan || "Unknown"}`;
          break;
        case "suku":
          groupKey = jemaat.suku?.namaSuku || "Tanpa Suku";
          break;
        case "statusDalamKeluarga":
          groupKey = jemaat.statusDalamKeluarga?.status || "Tanpa Status";
          break;
        case "jenisKelamin":
          groupKey = jemaat.jenisKelamin ? "Laki-laki" : "Perempuan";
          break;
        case "pendidikan":
          groupKey = jemaat.pendidikan?.jenjang || "Tanpa Pendidikan";
          break;
      }

      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(jemaat);
    });

    return grouped;
  }

  calculateStats(data) {
    const total = data.length;
    const male = data.filter((j) => j.jenisKelamin === true).length;
    const female = data.filter((j) => j.jenisKelamin === false).length;

    return { total, male, female };
  }

  createSummaryData(groupedData) {
    return Object.entries(groupedData).map(([groupName, data]) => {
      const stats = this.calculateStats(data);

      return {
        Kelompok: groupName,
        Total: stats.total,
        "Laki-laki": stats.male,
        Perempuan: stats.female,
        Persentase: `${((stats.total / Object.values(groupedData).flat().length) * 100).toFixed(1)}%`,
      };
    });
  }
}

export default new ExportService();
