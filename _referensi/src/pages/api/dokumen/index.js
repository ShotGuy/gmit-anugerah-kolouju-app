import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { staffOnly } from "@/lib/apiMiddleware";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;

    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaFile",
      defaultSortBy: "createdAt",
      defaultSortOrder: "desc",
    });

    // Apply role-based filtering
    if (user.role === "MAJELIS" && user.majelis && user.majelis.idRayon) {
      where.jemaat = {
        ...where.jemaat,
        keluarga: {
          idRayon: user.majelis.idRayon,
        },
      };
    }

    const total = await prisma.dokumenJemaat.count({ where });

    const items = await prisma.dokumenJemaat.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
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
      },
    });

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
      .json(apiResponse(true, result, "Data dokumen berhasil diambil"));
  } catch (error) {
    console.error("Error fetching dokumen:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data dokumen", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const data = req.body;

    // For MAJELIS users, validate that the jemaat belongs to their rayon
    if (user.role === "MAJELIS" && user.majelis && user.majelis.idRayon) {
      const jemaat = await prisma.jemaat.findUnique({
        where: { id: data.idJemaat },
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
              "Anda hanya dapat mengelola dokumen jemaat dalam rayon yang Anda kelola"
            )
          );
      }
    }

    const newDokumen = await prisma.dokumenJemaat.create({
      data,
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
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newDokumen, "Dokumen berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating dokumen:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menambahkan dokumen", error.message)
      );
  }
}

export default staffOnly(
  createApiHandler({
    GET: handleGet,
    POST: handlePost,
  })
);
