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

    // Fetch all options in parallel
    const [jenisIbadah, kategoriJadwal, pemimpin, rayon, keluarga] = await Promise.all([
      // Jenis Ibadah
      prisma.jenisIbadah.findMany({
        where: { isActive: true },
        select: {
          id: true,
          namaIbadah: true,
        },
        orderBy: { namaIbadah: 'asc' }
      }),

      // Kategori Jadwal
      prisma.kategoriJadwal.findMany({
        where: { isActive: true },
        select: {
          id: true,
          namaKategori: true,
          deskripsi: true,
        },
        orderBy: { namaKategori: 'asc' }
      }),

      // Pemimpin (Jemaat yang bisa jadi pemimpin)
      prisma.jemaat.findMany({
        where: {
          status: 'AKTIF'
        },
        select: {
          id: true,
          nama: true,
        },
        orderBy: { nama: 'asc' }
      }),

      // Rayon (filtered based on user role)
      (async () => {
        let where = {};
        
        if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
          // Majelis can only see their rayon
          where.id = user.majelis.idRayon;
        } else if (user.role === 'JEMAAT' && user.jemaat && user.jemaat.keluarga && user.jemaat.keluarga.idRayon) {
          // Jemaat can only see their rayon
          where.id = user.jemaat.keluarga.idRayon;
        }
        // Admin can see all rayons (no filter)

        return await prisma.rayon.findMany({
          where,
          select: {
            id: true,
            namaRayon: true,
          },
          orderBy: { namaRayon: 'asc' }
        });
      })(),

      // Keluarga (filtered based on user role)
      (async () => {
        let where = {};
        
        if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
          // Majelis can only see keluarga in their rayon
          where.idRayon = user.majelis.idRayon;
        } else if (user.role === 'JEMAAT' && user.jemaat && user.jemaat.keluarga && user.jemaat.keluarga.idRayon) {
          // Jemaat can only see keluarga in their rayon
          where.idRayon = user.jemaat.keluarga.idRayon;
        }
        // Admin can see all keluarga (no filter)

        return await prisma.keluarga.findMany({
          where,
          select: {
            id: true,
            noBagungan: true,
            rayon: {
              select: {
                namaRayon: true
              }
            }
          },
          orderBy: { noBagungan: 'asc' }
        });
      })()
    ]);

    // Format the options for frontend consumption
    const formattedOptions = {
      jenisIbadah: jenisIbadah.map(item => ({
        value: item.id,
        label: item.namaIbadah,
        id: item.id,
        namaIbadah: item.namaIbadah
      })),

      kategoriJadwal: kategoriJadwal.map(item => ({
        value: item.id,
        label: item.namaKategori,
        id: item.id,
        namaKategori: item.namaKategori,
        deskripsi: item.deskripsi
      })),

      pemimpin: pemimpin.map(item => ({
        value: item.id,
        label: item.nama,
        id: item.id,
        nama: item.nama
      })),

      rayon: rayon.map(item => ({
        value: item.id,
        label: item.namaRayon,
        id: item.id,
        namaRayon: item.namaRayon
      })),

      keluarga: keluarga.map(item => ({
        value: item.id,
        label: `Bangunan ${item.noBagungan} - ${item.rayon.namaRayon}`,
        id: item.id,
        noBagungan: item.noBagungan,
        rayon: item.rayon
      }))
    };

    return res
      .status(200)
      .json(apiResponse(true, formattedOptions, "Options berhasil diambil"));

  } catch (error) {
    console.error("Error fetching jadwal ibadah options:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil options jadwal ibadah",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});