import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";
import { staffOnly } from "@/lib/apiMiddleware";

async function handlePost(req, res) {
  try {
    const { filters = {}, exportConfig = {} } = req.body;

    // Parse filters using existing query params parser
    const { where } = parseQueryParams(filters, {
      searchField: "nama",
      defaultSortBy: "nama",
    });

    // Get total count first
    const total = await prisma.jemaat.count({ where });

    // Determine limit based on export config
    const limit = exportConfig.maxRecords || 10000; // Safety limit

    // Fetch data with all relations
    const items = await prisma.jemaat.findMany({
      where,
      take: limit,
      orderBy: {
        [exportConfig.sortBy || 'nama']: exportConfig.sortOrder || 'asc',
      },
      include: {
        keluarga: {
          include: {
            alamat: {
              include: {
                kelurahan: {
                  include: {
                    kecamatan: {
                      include: {
                        kotaKab: {
                          include: {
                            provinsi: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            statusKeluarga: true,
            statusKepemilikanRumah: true,
            keadaanRumah: true,
            rayon: true
          }
        },
        statusDalamKeluarga: true,
        suku: true,
        pendidikan: true,
        pekerjaan: true,
        pendapatan: true,
        jaminanKesehatan: true,
        User: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    // Calculate export statistics
    const stats = {
      total,
      exported: items.length,
      male: items.filter(j => j.jenisKelamin === true).length,
      female: items.filter(j => j.jenisKelamin === false).length,
      withAccount: items.filter(j => j.User !== null).length,
      byRayon: {},
      bySuku: {},
      byStatusKeluarga: {}
    };

    // Group statistics
    items.forEach(jemaat => {
      // By Rayon
      const rayon = jemaat.keluarga?.rayon?.namaRayon || 'Tanpa Rayon';
      stats.byRayon[rayon] = (stats.byRayon[rayon] || 0) + 1;

      // By Suku
      const suku = jemaat.suku?.namaSuku || 'Tanpa Suku';
      stats.bySuku[suku] = (stats.bySuku[suku] || 0) + 1;

      // By Status Keluarga
      const status = jemaat.statusDalamKeluarga?.status || 'Tanpa Status';
      stats.byStatusKeluarga[status] = (stats.byStatusKeluarga[status] || 0) + 1;
    });

    // Group data if needed
    let groupedData = null;
    if (exportConfig.groupBy && exportConfig.groupBy !== 'none') {
      groupedData = {};

      items.forEach(jemaat => {
        let groupKey = 'Unknown';

        switch (exportConfig.groupBy) {
          case 'rayon':
            groupKey = jemaat.keluarga?.rayon?.namaRayon || 'Tanpa Rayon';
            break;
          case 'keluarga':
            groupKey = `${jemaat.keluarga?.rayon?.namaRayon || 'Unknown'} - ${jemaat.keluarga?.noBagungan || 'Unknown'}`;
            break;
          case 'suku':
            groupKey = jemaat.suku?.namaSuku || 'Tanpa Suku';
            break;
          case 'statusDalamKeluarga':
            groupKey = jemaat.statusDalamKeluarga?.status || 'Tanpa Status';
            break;
          case 'jenisKelamin':
            groupKey = jemaat.jenisKelamin ? 'Laki-laki' : 'Perempuan';
            break;
          case 'pendidikan':
            groupKey = jemaat.pendidikan?.jenjang || 'Tanpa Pendidikan';
            break;
          case 'pekerjaan':
            groupKey = jemaat.pekerjaan?.namaPekerjaan || 'Tanpa Pekerjaan';
            break;
        }

        if (!groupedData[groupKey]) groupedData[groupKey] = [];
        groupedData[groupKey].push(jemaat);
      });

      // Sort groups by name
      const sortedGrouped = {};
      Object.keys(groupedData).sort().forEach(key => {
        sortedGrouped[key] = groupedData[key];
      });
      groupedData = sortedGrouped;
    }

    const result = {
      items,
      stats,
      groupedData,
      exportConfig,
      appliedFilters: filters,
      exportTimestamp: new Date().toISOString(),
      exportedBy: req.user?.email || 'system' // If we have user context
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data export berhasil diambil"));

  } catch (error) {
    console.error("Error in jemaat export:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data export",
          error.message
        )
      );
  }
}

// Apply staff-only middleware
export default staffOnly(createApiHandler({
  POST: handlePost,
}));