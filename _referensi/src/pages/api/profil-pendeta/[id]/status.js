import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

// PATCH - Toggle active status
async function handlePatch(req, res) {
  // Check authentication
  const authResult = await requireAuth(req, res);
  if (authResult.error) {
    return res.status(authResult.status).json(
      apiResponse(false, null, authResult.error)
    );
  }

  const { user } = authResult;

  // Check if user is admin
  if (user.role !== 'ADMIN') {
    return res.status(403).json(
      apiResponse(false, null, "Hanya admin yang dapat mengubah status profil pendeta")
    );
  }

  try {
    const { id } = req.query;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json(
        apiResponse(false, null, "Status harus berupa boolean")
      );
    }

    // Check if profile exists
    const existingProfile = await prisma.profilPendeta.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      return res.status(404).json(
        apiResponse(false, null, "Profil pendeta tidak ditemukan")
      );
    }

    // Update the profile status (allow multiple active profiles)
    const updatedProfile = await prisma.profilPendeta.update({
      where: { id },
      data: {
        isActive,
        updatedBy: user.id,
      },
    });

    return res.status(200).json(
      apiResponse(
        true,
        updatedProfile,
        `Profil pendeta berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`
      )
    );
  } catch (error) {
    console.error("Error updating pastor profile status:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal mengubah status profil pendeta", error.message)
    );
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'PATCH':
      return handlePatch(req, res);
    default:
      return res.status(405).json(
        apiResponse(false, null, "Method tidak diizinkan")
      );
  }
}