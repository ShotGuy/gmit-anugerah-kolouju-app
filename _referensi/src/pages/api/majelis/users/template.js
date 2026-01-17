import XLSX from "xlsx";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

async function handleGet(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Only MAJELIS can access this endpoint
    if (user.role !== "MAJELIS") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Majelis"));
    }

    // Get majelis data to get rayon info
    const majelis = await prisma.majelis.findUnique({
      where: { id: user.idMajelis },
      include: {
        rayon: true,
      },
    });

    if (!majelis || !majelis.idRayon) {
      return res
        .status(404)
        .json(
          apiResponse(
            false,
            null,
            "Data majelis atau rayon tidak ditemukan"
          )
        );
    }

    // Create sample data for the template
    const templateData = [
      {
        username: "jemaat_john",
        email: "john.jemaat@example.com",
        password: "Password123",
        noWhatsapp: "081234567890",
      },
      {
        username: "jemaat_jane",
        email: "jane.jemaat@example.com",
        password: "Password123",
        noWhatsapp: "081234567891",
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
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Akun Jemaat");

    // Create instructions worksheet
    const instructions = [
      {
        Field: "username",
        Description: "Username unik untuk login (wajib diisi)",
        Example: "jemaat_john",
      },
      {
        Field: "email",
        Description: "Email unik untuk user (wajib diisi)",
        Example: "john.jemaat@example.com",
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
        Field: "",
        Description: "",
        Example: "",
      },
      {
        Field: "CATATAN PENTING",
        Description: `Template ini hanya untuk import akun JEMAAT di Rayon ${majelis.rayon.namaRayon}`,
        Example: "Role otomatis menjadi JEMAAT",
      },
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    instructionsSheet["!cols"] = [
      { wch: 15 }, // Field
      { wch: 60 }, // Description
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
      `attachment; filename="template_import_akun_jemaat_rayon_${majelis.rayon.namaRayon.replace(/\s+/g, "_")}.xlsx"`
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

export default createApiHandler({
  GET: handleGet,
});
