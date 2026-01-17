// import { DocumentUploadService } from '../../../services/documentUploadService';
// import { verifyToken } from '../../../lib/auth';
import multer from "multer";

import { verifyToken } from "@/lib/jwt";
import DocumentUploadService from "@/services/documentUploadService";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file harus PDF, PNG, atau JPG'), false);
    }
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan",
    });
  }

  // Run multer
  upload.single("dokumen")(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'Upload error',
        errors: err.message
      });
    }

    try {
      const user = verifyToken(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token tidak valid",
        });
      }

      const { jemaatId, tipeDokumen, judulDokumen } = req.body;
      const file = req.file;

      if (!jemaatId || !tipeDokumen || !file) {
        return res.status(400).json({
          success: false,
          message: "jemaatId, tipeDokumen, dan file harus disediakan",
        });
      }

      if (!["BAPTIS", "SIDI", "NIKAH", "LAINNYA"].includes(tipeDokumen)) {
        return res.status(400).json({
          success: false,
          message: "tipeDokumen harus BAPTIS, SIDI, NIKAH, atau LAINNYA",
        });
      }

      // Validate judulDokumen for LAINNYA type
      if (tipeDokumen === "LAINNYA" && (!judulDokumen || !judulDokumen.trim())) {
        return res.status(400).json({
          success: false,
          message: "judulDokumen harus disediakan untuk tipe dokumen LAINNYA",
        });
      }

      const result = await DocumentUploadService.uploadDocument(
        jemaatId,
        tipeDokumen,
        file,
        file.size,
        user.id,
        judulDokumen?.trim() || null
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Gagal upload dokumen",
      });
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
