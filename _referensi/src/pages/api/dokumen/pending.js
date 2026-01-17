// import { verifyToken } from "../../../lib/auth";
// import { DocumentUploadService } from "../../../services/documentUploadService";

import { verifyToken } from "@/lib/jwt";
import DocumentUploadService from "@/services/documentUploadService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan",
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

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Akses ditolak. Hanya admin yang dapat melihat dokumen pending",
      });
    }

    const dokumen = await DocumentUploadService.getDokumenPendingVerification();

    res.status(200).json({
      success: true,
      data: dokumen,
      message: "Data dokumen pending berhasil diambil",
    });
  } catch (error) {
    console.error("Get pending dokumen error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data dokumen pending",
    });
  }
}
