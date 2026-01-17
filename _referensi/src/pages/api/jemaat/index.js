import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { staffOnly } from "@/lib/apiMiddleware";
import { requireAuth } from "@/lib/auth";
import { processDateFields } from "@/lib/dateUtils";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
  try {
    // Get authenticated user for role-based filtering
    const authResult = await requireAuth(req, res);
    console.log("Jemaat API hit: auth result", authResult ? "ok" : "null");

    if (authResult.error) {
      console.log("Auth error in Jemaat API", authResult.error);
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;

    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "nama",
      defaultSortBy: "nama",
    });

    // Apply rayon-based filtering for MAJELIS users
    if (user.role === "MAJELIS" && user.majelis && user.majelis.idRayon) {
      where.keluarga = {
        ...where.keluarga,
        idRayon: user.majelis.idRayon,
      };
    }

    const total = await prisma.jemaat.count({ where });

    // Check for "simple" mode (for dropdown search)
    const isSimpleMode = req.query.mode === "simple";

    const include = isSimpleMode
      ? {
        keluarga: {
          select: {
            rayon: {
              select: {
                namaRayon: true,
              },
            },
          },
        },
      }
      : {
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
                            provinsi: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            statusKeluarga: true,
            rayon: true,
          },
        },
        statusDalamKeluarga: true,
        suku: true,
        pendidikan: true,
        pekerjaan: true,
        pendapatan: true,
        jaminanKesehatan: true,
        User: true,
      };

    console.log("Jemaat API: finding items with mode", isSimpleMode ? "simple" : "full", "where:", JSON.stringify(where), "include:", JSON.stringify(include));
    const items = await prisma.jemaat.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include,
    });
    console.log("Jemaat API: found items", items.length);

    const totalPages = Math.ceil(total / pagination.limit);

    const result = {
      items,
      pagination: {
        ...pagination,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jemaat:", error);
    // Write error to file for debugging
    const fs = require('fs');
    fs.writeFileSync('debug_api_jemaat_error.txt', JSON.stringify({ message: error.message, stack: error.stack }, null, 2));

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

async function handlePost(req, res) {
  try {
    // Get authenticated user for role-based validation
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    let data = processDateFields(req.body, ['tanggalLahir']);

    // Convert jenisKelamin to boolean if it exists
    if (data.jenisKelamin !== undefined) {
      data.jenisKelamin = data.jenisKelamin === true || data.jenisKelamin === 'true' || data.jenisKelamin === 1;
    }

    // For MAJELIS users, validate that the keluarga belongs to their rayon
    if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      const keluarga = await prisma.keluarga.findUnique({
        where: { id: data.idKeluarga },
        select: { idRayon: true }
      });

      if (!keluarga) {
        return res.status(404).json(
          apiResponse(false, null, "Keluarga tidak ditemukan")
        );
      }

      if (keluarga.idRayon !== user.majelis.idRayon) {
        return res.status(403).json(
          apiResponse(false, null, "Anda hanya dapat menambahkan jemaat ke keluarga dalam rayon yang Anda kelola")
        );
      }
    }

    const newJemaat = await prisma.jemaat.create({
      data,
      include: {
        keluarga: {
          include: {
            alamat: {
              include: {
                kelurahan: true
              }
            },
            statusKeluarga: true,
            rayon: true
          }
        },
        statusDalamKeluarga: true,
        suku: true,
        pendidikan: true,
        pekerjaan: true,
        pendapatan: true,
        jaminanKesehatan: true
      }
    });

    return res
      .status(201)
      .json(apiResponse(true, newJemaat, "Data berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating jemaat:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data jemaat",
          error.message
        )
      );
  }
}

// Apply staff-only middleware - data jemaat sensitif
export default staffOnly(createApiHandler({
  GET: handleGet,
  POST: handlePost,
}));