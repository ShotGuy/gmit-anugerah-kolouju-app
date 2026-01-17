// import { DocumentUploadService } from '../../../../services/documentUploadService';
// import { verifyToken } from '../../../../lib/auth';

import { verifyToken } from "@/lib/jwt";
import DocumentUploadService from "@/services/documentUploadService";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "DELETE") {
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

    const result = await DocumentUploadService.deleteDokumen(id, user.id);

    res.status(200).json(result);
  } catch (error) {
    console.error("Delete dokumen error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus dokumen",
    });
  }
}
