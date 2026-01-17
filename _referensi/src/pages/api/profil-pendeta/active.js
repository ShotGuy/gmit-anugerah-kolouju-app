import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

// GET - Get active pastor profile
async function handleGet(req, res) {
  try {
    const activeProfile = await prisma.profilPendeta.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(
      apiResponse(true, activeProfile, "Data profil pendeta aktif berhasil diambil")
    );
  } catch (error) {
    console.error("Error fetching active pastor profile:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal mengambil data profil pendeta aktif", error.message)
    );
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    default:
      return res.status(405).json(
        apiResponse(false, null, "Method tidak diizinkan")
      );
  }
}