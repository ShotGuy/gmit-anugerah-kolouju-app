import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "jemaat.nama",
      defaultSortBy: "tanggal",
      defaultSortOrder: "desc",
    });

    const total = await prisma.sidi.count({
      where: {
        ...where,
        jemaat: where["jemaat.nama"] ? {
          nama: {
            contains: where["jemaat.nama"],
            mode: "insensitive"
          }
        } : undefined
      },
    });

    const items = await prisma.sidi.findMany({
      where: {
        ...where,
        jemaat: where["jemaat.nama"] ? {
          nama: {
            contains: where["jemaat.nama"],
            mode: "insensitive"
          }
        } : undefined
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            keluarga: {
              select: {
                noBagungan: true,
                rayon: {
                  select: {
                    namaRayon: true,
                  },
                },
              },
            },
          },
        },
        klasis: {
          select: {
            id: true,
            nama: true,
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
      .json(apiResponse(true, result, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching sidi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data sidi", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const { idJemaat, idKlasis, tanggal } = req.body;

    if (!idJemaat || !idKlasis || !tanggal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Semua field wajib diisi"));
    }

    // Validate jemaat exists
    const jemaat = await prisma.jemaat.findUnique({
      where: { id: idJemaat },
    });

    if (!jemaat) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
    }

    // Validate klasis exists
    const klasis = await prisma.klasis.findUnique({
      where: { id: idKlasis },
    });

    if (!klasis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data klasis tidak ditemukan"));
    }

    // Check if jemaat already has sidi record
    const existingSidi = await prisma.sidi.findFirst({
      where: { idJemaat },
    });

    if (existingSidi) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jemaat ini sudah memiliki data sidi"));
    }

    const newSidi = await prisma.sidi.create({
      data: {
        idJemaat,
        idKlasis,
        tanggal: new Date(tanggal),
      },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            keluarga: {
              select: {
                noBagungan: true,
                rayon: {
                  select: {
                    namaRayon: true,
                  },
                },
              },
            },
          },
        },
        klasis: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newSidi, "Data sidi berhasil ditambahkan"));
  } catch (error) {
    console.error("Error creating sidi:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menambahkan data sidi", error.message));
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});