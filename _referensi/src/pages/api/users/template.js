import XLSX from "xlsx";
import { createApiHandler } from "@/lib/apiHandler";
import { adminOnly } from "@/lib/apiMiddleware";

async function handleGet(req, res) {
  try {
    // Create sample data for the template
    const templateData = [
      {
        username: "john_doe",
        email: "john@example.com",
        password: "Password123",
        noWhatsapp: "081234567890",
        role: "JEMAAT",
      },
      {
        username: "jane_admin",
        email: "jane@example.com",
        password: "Password123",
        noWhatsapp: "081234567891",
        role: "ADMIN",
      },
    ];

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 15 }, // username
      { wch: 30 }, // email
      { wch: 15 }, // password
      { wch: 15 }, // noWhatsapp
      { wch: 15 }, // role
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Users");

    // Create instructions worksheet
    const instructions = [
      {
        Field: "username",
        Description: "Username unik untuk login (wajib diisi)",
        Example: "john_doe",
      },
      {
        Field: "email",
        Description: "Email unik untuk user (wajib diisi)",
        Example: "john@example.com",
      },
      {
        Field: "password",
        Description: "Password untuk user (wajib diisi)",
        Example: "Password123",
      },
      {
        Field: "noWhatsapp",
        Description: "Nomor WhatsApp (opsional, format: 08xx atau 62xx)",
        Example: "081234567890",
      },
      {
        Field: "role",
        Description: "Role user (ADMIN, JEMAAT, MAJELIS, EMPLOYEE, PENDETA)",
        Example: "JEMAAT",
      },
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    instructionsSheet["!cols"] = [
      { wch: 15 }, // Field
      { wch: 50 }, // Description
      { wch: 20 }, // Example
    ];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instruksi");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="template_import_users.xlsx"'
    );

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating template:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat template",
      errors: error.message,
    });
  }
}

// Apply admin-only middleware
export default adminOnly(
  createApiHandler({
    GET: handleGet,
  })
);
