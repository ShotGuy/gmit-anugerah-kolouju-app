import bcrypt from "bcryptjs";
import multer from "multer";
import XLSX from "xlsx";

import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Allow Excel files
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipe file harus Excel (.xlsx atau .xls)"), false);
    }
  },
});

// Format WhatsApp number
const formatWhatsAppNumber = (number) => {
  if (!number) return null;

  // Convert to string and remove all non-numeric characters
  let cleaned = String(number).replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+62${cleaned.substring(1)}`;
  } else {
    return `+62${cleaned}`;
  }
};

async function handlePost(req, res) {
  // Run multer
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);

      return res
        .status(400)
        .json(apiResponse(false, null, "Upload error", err.message));
    }

    try {
      // Verify token and majelis role
      const authResult = await requireAuth(req, res);

      if (authResult.error) {
        return res
          .status(authResult.status)
          .json(apiResponse(false, null, authResult.error));
      }

      const user = authResult.user;

      if (user.role !== "MAJELIS") {
        return res
          .status(403)
          .json(
            apiResponse(false, null, "Hanya majelis yang dapat import data")
          );
      }

      // Get majelis data to get rayon id
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
            apiResponse(false, null, "Data majelis atau rayon tidak ditemukan")
          );
      }

      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json(apiResponse(false, null, "File Excel harus disediakan"));
      }

      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        return res
          .status(400)
          .json(apiResponse(false, null, "File Excel kosong atau tidak valid"));
      }

      const results = {
        success: [],
        failed: [],
        total: data.length,
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // Excel row number (accounting for header)

        try {
          // Validate required fields
          if (!row.username || !row.email || !row.password) {
            results.failed.push({
              row: rowNumber,
              data: row,
              error: "Field username, email, dan password wajib diisi",
            });
            continue;
          }

          // Prepare data
          const userData = {
            username: String(row.username).trim(),
            email: String(row.email).trim().toLowerCase(),
            password: String(row.password),
            role: "JEMAAT", // Force role to JEMAAT for majelis import
            noWhatsapp: row.noWhatsapp
              ? formatWhatsAppNumber(row.noWhatsapp)
              : null,
            idRayon: majelis.idRayon, // Auto-assign rayon from majelis
          };

          // Check if email already exists
          const existingEmail = await prisma.user.findUnique({
            where: { email: userData.email },
          });

          if (existingEmail) {
            results.failed.push({
              row: rowNumber,
              data: row,
              error: `Email ${userData.email} sudah terdaftar`,
            });
            continue;
          }

          // Check if username already exists
          const existingUsername = await prisma.user.findUnique({
            where: { username: userData.username },
          });

          if (existingUsername) {
            results.failed.push({
              row: rowNumber,
              data: row,
              error: `Username ${userData.username} sudah terdaftar`,
            });
            continue;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 12);

          // Create user
          const newUser = await prisma.user.create({
            data: {
              username: userData.username,
              email: userData.email,
              password: hashedPassword,
              noWhatsapp: userData.noWhatsapp,
              role: userData.role,
              idRayon: userData.idRayon, // Auto-assign rayon from majelis
            },
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              noWhatsapp: true,
              idRayon: true,
              rayon: {
                select: {
                  id: true,
                  namaRayon: true,
                },
              },
            },
          });

          results.success.push({
            row: rowNumber,
            user: newUser,
          });
        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
          results.failed.push({
            row: rowNumber,
            data: row,
            error: error.message || "Gagal membuat akun jemaat",
          });
        }
      }

      const message =
        results.failed.length === 0
          ? `Berhasil import ${results.success.length} akun jemaat untuk Rayon ${majelis.rayon.namaRayon}`
          : `Import selesai: ${results.success.length} berhasil, ${results.failed.length} gagal`;

      return res.status(200).json(
        apiResponse(
          true,
          {
            summary: {
              total: results.total,
              success: results.success.length,
              failed: results.failed.length,
              rayon: majelis.rayon.namaRayon,
            },
            successDetails: results.success,
            failedDetails: results.failed,
          },
          message
        )
      );
    } catch (error) {
      console.error("Import error:", error);

      return res
        .status(500)
        .json(
          apiResponse(
            false,
            null,
            "Gagal import data akun jemaat",
            error.message
          )
        );
    }
  });
}

export default handlePost;

export const config = {
  api: {
    bodyParser: false,
  },
};
