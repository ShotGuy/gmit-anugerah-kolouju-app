import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";

async function handleGet(req, res) {
  try {
    // Check authentication for admin endpoints
    const authResult = await requireAuth(req, res);
    
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    
    // Build where clause based on user role
    let where = {};
    
    // If user is MAJELIS, filter by their rayon
    if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      where.idRayon = user.majelis.idRayon;
    }

    const keluargas = await prisma.keluarga.findMany({
      where,
      select: {
        id: true,
        noBagungan: true,
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          }
        },
        jemaats: {
          where: {
            statusDalamKeluarga: {
              status: "Kepala Keluarga"
            }
          },
          select: {
            nama: true
          },
          take: 1
        }
      },
      orderBy: {
        noBagungan: 'asc'
      }
    });

    // Format for options dropdown
    const options = keluargas.map(keluarga => {
      const kepalaKeluarga = keluarga.jemaats?.find(j =>
        j.statusDalamKeluarga?.status === "Kepala Keluarga"
      );
      const displayName = kepalaKeluarga?.nama || `Bangunan ${keluarga.noBagungan}`;

      return {
        value: keluarga.id,
        label: `${displayName} - ${keluarga.rayon.namaRayon}`,
        noBagungan: keluarga.noBagungan,
        rayon: keluarga.rayon,
        kepalaKeluarga: kepalaKeluarga?.nama || null
      };
    });

    return res
      .status(200)
      .json(apiResponse(true, options, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching keluarga admin options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data keluarga",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});