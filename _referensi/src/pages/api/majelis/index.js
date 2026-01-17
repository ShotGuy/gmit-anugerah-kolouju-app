import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
  try {
    let { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaLengkap", // Placeholder
      defaultSortBy: "mulai",
    });

    // Custom search logic for relation
    if (req.query.search) {
      where = {
        ...where,
        jemaat: {
          nama: {
            contains: req.query.search,
            mode: 'insensitive'
          }
        }
      };
      // Remove the potentially wrong 'namaLengkap' filter
      delete where.namaLengkap;
    }

    const total = await prisma.majelis.count({ where });

    const items = await prisma.majelis.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: sort.sortBy === 'jemaat.nama' ? {
        jemaat: { nama: sort.sortOrder }
      } : {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        jenisJabatan: {
          select: {
            namaJabatan: true,
          },
        },
        rayon: {
          select: {
            namaRayon: true,
          },
        },
        jemaat: {
          select: {
            nama: true,
          },
        },
        User: {
          select: {
            username: true,
            email: true,
            role: true,
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
    console.error("Error fetching majelis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data majelis",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
});