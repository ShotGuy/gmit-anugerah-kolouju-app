import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";

// POST: Assign rayon to a user (JEMAAT)
async function handlePost(req, res) {
  try {
    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const user = authResult.user;

    // Only ADMIN can access this endpoint
    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json(apiResponse(false, null, "Akses ditolak. Hanya untuk Admin"));
    }

    const { userId, rayonId, idRayon } = req.body;

    // Support both rayonId and idRayon
    const finalRayonId = rayonId || idRayon;

    // Validate required fields
    if (!userId || !finalRayonId) {
      return res
        .status(400)
        .json(apiResponse(false, null, "User ID dan Rayon ID wajib diisi"));
    }

    // Get user data
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rayon: true,
      },
    });

    if (!targetUser) {
      return res
        .status(404)
        .json(apiResponse(false, null, "User tidak ditemukan"));
    }

    // Check if rayon exists
    const rayon = await prisma.rayon.findUnique({
      where: { id: finalRayonId },
    });

    if (!rayon) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Rayon tidak ditemukan"));
    }

    // Update user's rayon directly in user table
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        idRayon: finalRayonId,
      },
      include: {
        rayon: true,
        jemaat: {
          include: {
            keluarga: {
              include: {
                rayon: true,
              },
            },
          },
        },
        majelis: {
          include: {
            rayon: true,
          },
        },
      },
    });

    // Additional logic for MAJELIS - also update majelis table if exists
    if (targetUser.role === "MAJELIS") {
      if (targetUser.idMajelis) {
        // Update existing majelis
        await prisma.majelis.update({
          where: { id: targetUser.idMajelis },
          data: {
            idRayon: finalRayonId,
          },
        });
      } else {
        // Create new majelis record
        const newMajelis = await prisma.majelis.create({
          data: {
            idRayon: finalRayonId,
            idUser: userId,
          },
        });

        // Update user with majelis id
        await prisma.user.update({
          where: { id: userId },
          data: {
            idMajelis: newMajelis.id,
          },
        });
      }
    }

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedUser,
          `Berhasil assign rayon ${rayon.namaRayon} ke user ${targetUser.username}`
        )
      );
  } catch (error) {
    console.error("Error assigning rayon:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal assign rayon", error.message));
  }
}

export default createApiHandler({
  POST: handlePost,
});
