import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { requireAuth } from "@/lib/auth";

async function handleGet(req, res) {
  try {
    // Check authentication
    const authResult = await requireAuth(req, res);
    
    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    
    // Build where clause based on user role
    let where = {};
    
    // If user is MAJELIS, filter by their rayon (through keluarga)
    if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      where.keluarga = {
        idRayon: user.majelis.idRayon
      };
    }

    const jemaats = await prisma.jemaat.findMany({
      where,
      select: {
        id: true,
        nama: true,
        jenisKelamin: true,
        keluarga: {
          select: {
            noBagungan: true,
            rayon: {
              select: {
                namaRayon: true,
              }
            }
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    // Format for options dropdown
    const options = jemaats.map(jemaat => ({
      value: jemaat.id,
      label: `${jemaat.nama} (${jemaat.jenisKelamin ? 'L' : 'P'}) - Bangunan ${jemaat.keluarga.noBagungan}`,
      nama: jemaat.nama,
      jenisKelamin: jemaat.jenisKelamin,
      keluarga: jemaat.keluarga
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jemaat options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jemaat",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});