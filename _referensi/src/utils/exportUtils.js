import { format } from "date-fns";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Utility to get nested value from object using dot notation
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  // Handle dot notation paths like "keluarga.noBagungan"
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array indices like "items[0].name"
    if (key.includes('[') && key.includes(']')) {
      const [arrayKey, indexPart] = key.split('[');
      const index = parseInt(indexPart.replace(']', ''));
      const array = current[arrayKey];
      return Array.isArray(array) ? array[index] : undefined;
    }

    return current[key];
  }, obj);
};

// Format value based on column type
const formatValue = (value, column, item) => {
  // Always try render function first if it exists
  if (column.render && typeof column.render === "function") {
    try {
      const rendered = column.render(value, item);

      // Handle React elements/JSX by extracting text content
      if (rendered && typeof rendered === "object") {
        // If it's a React element with props.children
        if (rendered.props && rendered.props.children) {
          const extractText = (children) => {
            if (typeof children === "string") return children;
            if (typeof children === "number") return String(children);
            if (Array.isArray(children)) {
              return children.map(extractText).join("");
            }
            if (children && typeof children === "object" && children.props) {
              return extractText(children.props.children);
            }
            return "";
          };
          return extractText(rendered.props.children);
        }

        // For JSX that just wraps text
        if (rendered.props && typeof rendered.props.children === "string") {
          return rendered.props.children;
        }

        // If render returns an object but not JSX, try toString
        if (rendered.toString && rendered.toString !== Object.prototype.toString) {
          return rendered.toString();
        }

        return "[Complex Element]";
      }

      return String(rendered || "");
    } catch (error) {
      console.warn(`Error in render function for column ${column.key}:`, error);
      // Fall through to default handling
    }
  }

  // Handle null/undefined
  if (value === null || value === undefined) return "";

  // Handle objects that aren't dates
  if (typeof value === "object" && value !== null && !(value instanceof Date)) {
    // If it's an array, join with comma
    if (Array.isArray(value)) {
      return value.map(v =>
        typeof v === "object" && v !== null
          ? (v.nama || v.name || v.label || JSON.stringify(v))
          : String(v)
      ).join(", ");
    }

    // For objects, try common name fields first
    if (value.nama) return String(value.nama);
    if (value.name) return String(value.name);
    if (value.label) return String(value.label);
    if (value.status) return String(value.status);
    if (value.noBagungan) return String(value.noBagungan);
    if (value.email) return String(value.email);
    if (value.username) return String(value.username);

    // If object has a display property or toString method
    if (value.toString && value.toString !== Object.prototype.toString) {
      return String(value.toString());
    }

    // Last resort: JSON stringify but clean it up
    try {
      const json = JSON.stringify(value);
      if (json.length < 50) return json;
      return "[Complex Object]";
    } catch {
      return "[Object]";
    }
  }

  // Handle primitives based on column type
  switch (column.type) {
    case "boolean":
      return value ? "Ya" : "Tidak";
    case "date":
      try {
        return value ? format(new Date(value), "dd/MM/yyyy") : "";
      } catch {
        return String(value);
      }
    case "datetime":
      try {
        return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "";
      } catch {
        return String(value);
      }
    case "currency":
      try {
        const num = parseFloat(value);
        if (isNaN(num)) return String(value);
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(num);
      } catch {
        return String(value);
      }
    case "number":
      try {
        const num = parseFloat(value);
        if (isNaN(num)) return String(value);
        return new Intl.NumberFormat("id-ID").format(num);
      } catch {
        return String(value);
      }
    case "badge":
    case "custom":
      // These should have been handled by render function above
      return String(value);
    default:
      return String(value);
  }
};

// Prepare data for export
const prepareDataForExport = (data, columns, selectedColumns = null) => {
  if (!Array.isArray(data) || !Array.isArray(columns)) {
    console.warn('Invalid data or columns provided to prepareDataForExport');
    return [];
  }

  const columnsToExport = selectedColumns
    ? columns.filter((col) => selectedColumns.includes(col.key))
    : columns;

  return data.map((item, index) => {
    const row = {};

    columnsToExport.forEach((column) => {
      try {
        // Get the raw value first
        let value = getNestedValue(item, column.key);

        // If value is still undefined/null and column has a getValue function
        if ((value === undefined || value === null) && column.getValue) {
          value = column.getValue(item);
        }

        // Format the value for export
        const formattedValue = formatValue(value, column, item);

        // Clean the label (remove special characters for CSV compatibility)
        const cleanLabel = column.label.replace(/[^\w\s-]/g, '').trim();

        row[cleanLabel] = formattedValue;
      } catch (error) {
        console.warn(`Error processing column ${column.key} for item ${index}:`, error);
        row[column.label] = '';
      }
    });

    return row;
  });
};

// Generate filename with timestamp
const generateFilename = (baseName, extension) => {
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");

  return `${baseName}_${timestamp}.${extension}`;
};

// Export to CSV
export const exportToCSV = (
  data,
  columns,
  filename = "export",
  selectedColumns = null
) => {
  const exportData = prepareDataForExport(data, columns, selectedColumns);

  if (exportData.length === 0) {
    throw new Error("Tidak ada data untuk diekspor");
  }

  const headers = Object.keys(exportData[0]);
  const csvContent = [
    headers.join(","),
    ...exportData.map((row) =>
      headers
        .map((header) => {
          const value = row[header];

          // Escape quotes and wrap in quotes if contains comma or quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, generateFilename(filename, "csv"));
};

// Export to XLSX
export const exportToXLSX = (
  data,
  columns,
  filename = "export",
  selectedColumns = null
) => {
  const exportData = prepareDataForExport(data, columns, selectedColumns);

  if (exportData.length === 0) {
    throw new Error("Tidak ada data untuk diekspor");
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const colWidths = Object.keys(exportData[0]).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...exportData.map((row) => String(row[key] || "").length)
    );

    return { width: Math.min(Math.max(maxLength, 10), 50) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, generateFilename(filename, "xlsx"));
};

// Export to PDF
export const exportToPDF = (
  data,
  columns,
  filename = "export",
  selectedColumns = null,
  options = {}
) => {
  const exportData = prepareDataForExport(data, columns, selectedColumns);

  if (exportData.length === 0) {
    throw new Error("Tidak ada data untuk diekspor");
  }

  const doc = new jsPDF({
    orientation: options.orientation || "landscape",
    unit: "mm",
    format: options.format || "a4",
  });

  // Add title
  if (options.title) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(options.title, 14, 20);
  }

  // Add metadata
  const metadataY = options.title ? 30 : 20;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Diekspor pada: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`,
    14,
    metadataY
  );
  doc.text(`Total data: ${exportData.length} baris`, 14, metadataY + 5);

  // Prepare table data
  const headers = Object.keys(exportData[0]);
  const tableData = exportData.map((row) =>
    headers.map((header) => row[header])
  );

  // Create table using autoTable
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: metadataY + 15,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 30, right: 14, bottom: 20, left: 14 },
    tableWidth: "auto",
    columnStyles: headers.reduce((acc, header, index) => {
      acc[index] = { cellWidth: "auto" };
      return acc;
    }, {}),
  });

  doc.save(generateFilename(filename, "pdf"));
};

// Export to DOCX
export const exportToDocX = async (
  data,
  columns,
  filename = "export",
  selectedColumns = null,
  options = {}
) => {
  const exportData = prepareDataForExport(data, columns, selectedColumns);

  if (exportData.length === 0) {
    throw new Error("Tidak ada data untuk diekspor");
  }

  const headers = Object.keys(exportData[0]);

  // Create table rows
  const tableRows = [
    // Header row
    new TableRow({
      children: headers.map(
        (header) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: header, bold: true })],
              }),
            ],
            width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
          })
      ),
    }),
    // Data rows
    ...exportData.map(
      (row) =>
        new TableRow({
          children: headers.map(
            (header) =>
              new TableCell({
                children: [new Paragraph({ text: String(row[header] || "") })],
                width: {
                  size: 100 / headers.length,
                  type: WidthType.PERCENTAGE,
                },
              })
          ),
        })
    ),
  ];

  // Create document
  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          ...(options.title
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: options.title, bold: true, size: 32 }),
                  ],
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // Metadata
          new Paragraph({
            children: [
              new TextRun({
                text: `Diekspor pada: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total data: ${exportData.length} baris`,
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Table
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  // Generate and save
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  saveAs(blob, generateFilename(filename, "docx"));
};

// Main export function
export const exportData = async (
  format,
  data,
  columns,
  filename = "export",
  options = {}
) => {
  const { selectedColumns, ...exportOptions } = options;

  try {
    switch (format.toLowerCase()) {
      case "csv":
        exportToCSV(data, columns, filename, selectedColumns);
        break;
      case "xlsx":
        exportToXLSX(data, columns, filename, selectedColumns);
        break;
      case "pdf":
        exportToPDF(data, columns, filename, selectedColumns, exportOptions);
        break;
      case "docx":
        await exportToDocX(
          data,
          columns,
          filename,
          selectedColumns,
          exportOptions
        );
        break;
      default:
        throw new Error(`Format ${format} tidak didukung`);
    }

    return {
      success: true,
      message: `Data berhasil diekspor ke format ${format.toUpperCase()}`,
    };
  } catch (error) {
    console.error("Export error:", error);

    return {
      success: false,
      message: error.message || "Terjadi kesalahan saat mengekspor data",
    };
  }
};

// Get available export formats
export const getAvailableFormats = () => [
  { value: "xlsx", label: "Excel (.xlsx)", icon: "📊" },
  { value: "csv", label: "CSV (.csv)", icon: "📄" },
  { value: "pdf", label: "PDF (.pdf)", icon: "📕" },
  { value: "docx", label: "Word (.docx)", icon: "📘" },
];
