import { verifyToken } from "@/lib/jwt";
import DocumentUploadService from "@/services/documentUploadService";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method tidak diizinkan'
    });
  }

  try {
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }

    // Allow both ADMIN and MAJELIS to verify documents
    if (!['ADMIN', 'MAJELIS'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan majelis yang dapat verifikasi dokumen'
      });
    }

    const { dokumenId, status, catatan } = req.body;

    if (!dokumenId || !status) {
      return res.status(400).json({
        success: false,
        message: 'dokumenId dan status harus disediakan'
      });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status harus APPROVED atau REJECTED'
      });
    }

    const dokumen = await DocumentUploadService.updateStatusDokumen(
      dokumenId,
      status,
      user.id,
      catatan
    );

    res.status(200).json({
      success: true,
      data: dokumen,
      message: `Dokumen berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`
    });
  } catch (error) {
    console.error('Verify dokumen error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal verifikasi dokumen'
    });
  }
}