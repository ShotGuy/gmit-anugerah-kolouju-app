import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { majelisOrAdmin } from "@/lib/apiMiddleware";
import { requireAuth } from "@/lib/auth";

async function handleGet(req, res) {
  try {
    // Get authenticated user for role-based filtering - this loads full user data
    const authResult = await requireAuth(req, res, ['MAJELIS', 'ADMIN']);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;

    // For ADMIN users, allow access but might need rayon selection
    // For MAJELIS users, must have majelis data
    if (user.role === 'MAJELIS' && !user.majelis) {
      return res.status(403).json(
        apiResponse(false, null, "Akses ditolak. Data majelis tidak ditemukan untuk user ini.")
      );
    }

    // For MAJELIS users, must have assigned rayon
    if (user.role === 'MAJELIS' && user.majelis && !user.majelis.idRayon) {
      return res.status(403).json(
        apiResponse(false, null, "Akses ditolak. Anda belum memiliki rayon yang ditugaskan.")
      );
    }

    const rayonId = user.role === 'MAJELIS' ? user.majelis?.idRayon : null;

    // Get statistics berdasarkan rayon
    const [
      totalJemaat,
      totalKeluarga,
      jadwalBulanIni,
      baptisBulanIni,
      sidiTahunIni
    ] = await Promise.all([
      // Total jemaat di rayon ini (atau semua jika admin)
      prisma.jemaat.count({
        where: rayonId ? {
          keluarga: {
            idRayon: rayonId
          }
        } : {}
      }),

      // Total keluarga di rayon ini (atau semua jika admin)
      prisma.keluarga.count({
        where: rayonId ? {
          idRayon: rayonId
        } : {}
      }),

      // Jadwal ibadah bulan ini untuk rayon ini (atau semua jika admin)
      prisma.jadwalIbadah.count({
        where: {
          ...(rayonId ? {
            OR: [
              { idRayon: rayonId },
              {
                keluarga: {
                  idRayon: rayonId
                }
              }
            ]
          } : {}),
          tanggal: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      }),

      // Baptis bulan ini untuk jemaat di rayon ini (atau semua jika admin)
      prisma.baptis.count({
        where: {
          ...(rayonId ? {
            jemaat: {
              keluarga: {
                idRayon: rayonId
              }
            }
          } : {}),
          tanggal: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      }),

      // Sidi tahun ini untuk jemaat di rayon ini (atau semua jika admin)
      prisma.sidi.count({
        where: {
          ...(rayonId ? {
            jemaat: {
              keluarga: {
                idRayon: rayonId
              }
            }
          } : {}),
          tanggal: {
            gte: new Date(new Date().getFullYear(), 0, 1),
            lt: new Date(new Date().getFullYear() + 1, 0, 1)
          }
        }
      })
    ]);

    // Get recent jadwal ibadah (5 terbaru)
    const recentJadwal = await prisma.jadwalIbadah.findMany({
      where: {
        ...(rayonId ? {
          OR: [
            { idRayon: rayonId },
            {
              keluarga: {
                idRayon: rayonId
              }
            }
          ]
        } : {}),
        tanggal: {
          gte: new Date()
        }
      },
      include: {
        jenisIbadah: true,
        kategori: true,
        pemimpin: true,
        keluarga: {
          include: {
            rayon: true
          }
        },
        rayon: true
      },
      orderBy: {
        tanggal: 'asc'
      },
      take: 5
    });

    // Get upcoming events this month
    const upcomingEvents = await prisma.jadwalIbadah.findMany({
      where: {
        ...(rayonId ? {
          OR: [
            { idRayon: rayonId },
            {
              keluarga: {
                idRayon: rayonId
              }
            }
          ]
        } : {}),
        tanggal: {
          gte: new Date(),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      },
      include: {
        jenisIbadah: true,
        kategori: true
      },
      orderBy: {
        tanggal: 'asc'
      },
      take: 3
    });

    const result = {
      statistics: {
        totalJemaat,
        totalKeluarga,
        jadwalBulanIni,
        baptisBulanIni,
        sidiTahunIni
      },
      rayon: user.role === 'MAJELIS' ? user.majelis?.rayon : null,
      recentJadwal,
      upcomingEvents
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data dashboard berhasil diambil"));

  } catch (error) {
    console.error("Error fetching majelis dashboard:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data dashboard",
          error.message
        )
      );
  }
}

// Export using createApiHandler
export default createApiHandler({
  GET: handleGet,
});