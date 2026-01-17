// import { DocumentUploadService } from '../../../../services/documentUploadService';
// import { verifyToken } from '../../../../lib/auth';

import { verifyToken } from "@/lib/jwt";
import DocumentUploadService from "@/services/documentUploadService";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
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

    const progress = await DocumentUploadService.getJemaatProgressDokumen(id);

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Data progress berhasil diambil'
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil data progress'
    });
  }
}