import multer from "multer";
import XLSX from "xlsx";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { apiResponse } from "@/lib/apiHelper";

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

// Validate role
const validRoles = ["ADMIN", "JEMAAT", "MAJELIS", "EMPLOYEE", "PENDETA"];

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
      return res.status(400).json(
        apiResponse(false, null, "Upload error", err.message)
      );
    }

    try {
      // Verify token and admin role
      const user = verifyToken(req);

      if (!user) {
        return res
          .status(401)
          .json(apiResponse(false, null, "Token tidak valid"));
      }

      if (user.role !== "ADMIN") {
        return res
          .status(403)
          .json(apiResponse(false, null, "Hanya admin yang dapat import data"));
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
          if (!row.username || !row.email || !row.password || !row.role) {
            results.failed.push({
              row: rowNumber,
              data: row,
              error: "Field username, email, password, dan role wajib diisi",
            });
            continue;
          }

          // Validate role
          if (!validRoles.includes(row.role)) {
            results.failed.push({
              row: rowNumber,
              data: row,
              error: `Role tidak valid. Harus salah satu dari: ${validRoles.join(", ")}`,
            });
            continue;
          }

          // Prepare data
          const userData = {
            username: String(row.username).trim(),
            email: String(row.email).trim().toLowerCase(),
            password: String(row.password),
            role: row.role,
            noWhatsapp: row.noWhatsapp
              ? formatWhatsAppNumber(row.noWhatsapp)
              : null,
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
            },
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              noWhatsapp: true,
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
            error: error.message || "Gagal membuat user",
          });
        }
      }

      const message =
        results.failed.length === 0
          ? `Berhasil import ${results.success.length} user`
          : `Import selesai: ${results.success.length} berhasil, ${results.failed.length} gagal`;

      return res.status(200).json(
        apiResponse(
          true,
          {
            summary: {
              total: results.total,
              success: results.success.length,
              failed: results.failed.length,
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
          apiResponse(false, null, "Gagal import data user", error.message)
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
