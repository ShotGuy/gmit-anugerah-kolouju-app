import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;

    // Get documents for the specified jemaat
    const where = {
      jemaatId: id,
    };

    // For JEMAAT users, ensure they can only see their own documents
    if (user.role === "JEMAAT" && user.jemaat) {
      if (user.jemaat.id !== id) {
        return res
          .status(403)
          .json(
            apiResponse(false, null, "Anda hanya dapat melihat dokumen sendiri")
          );
      }
    }

    // For MAJELIS users, ensure the jemaat belongs to their rayon
    if (user.role === "MAJELIS" && user.majelis && user.majelis.idRayon) {
      const jemaat = await prisma.jemaat.findUnique({
        where: { id },
        include: {
          keluarga: {
            select: { idRayon: true },
          },
        },
      });

      if (!jemaat) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Jemaat tidak ditemukan"));
      }

      if (jemaat.keluarga.idRayon !== user.majelis.idRayon) {
        return res
          .status(403)
          .json(
            apiResponse(
              false,
              null,
              "Anda tidak memiliki akses ke dokumen jemaat ini"
            )
          );
      }
    }

    const dokumen = await prisma.dokumenJemaat.findMany({
      where,
      include: {
        jemaat: {
          include: {
            keluarga: {
              include: {
                rayon: true,
              },
            },
          },
        },
        verifier: {
          include: {
            jemaat: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, dokumen, "Data dokumen berhasil diambil"));
  } catch (error) {
    console.error("Error fetching dokumen:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data dokumen", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});
