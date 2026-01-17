import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    // Public endpoint - no auth required for onboarding
    // Show all keluarga options for jemaat to choose from

    const keluargas = await prisma.keluarga.findMany({
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
      const kepalaKeluarga = keluarga.jemaats?.[0]?.nama || "Belum ada";
      return {
        value: keluarga.id,
        label: `Bangunan ${keluarga.noBagungan} - ${keluarga.rayon.namaRayon} (${kepalaKeluarga})`,
        noBagungan: keluarga.noBagungan,
        rayon: keluarga.rayon,
        kepalaKeluarga: kepalaKeluarga
      };
    });

    return res
      .status(200)
      .json(apiResponse(true, options, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching keluarga options:", error);
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