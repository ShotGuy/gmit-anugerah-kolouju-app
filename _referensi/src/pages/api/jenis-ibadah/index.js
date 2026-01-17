import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaIbadah",
      defaultSortBy: "namaIbadah",
    });

    const total = await prisma.jenisIbadah.count({ where });

    const items = await prisma.jenisIbadah.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: {
        _count: {
          select: {
            jadwalIbadahs: true,
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
    console.error("Error fetching jenis ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jenis ibadah",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const { namaIbadah } = req.body;

    if (!namaIbadah) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama ibadah wajib diisi"));
    }

    // Check if already exists
    const existingJenisIbadah = await prisma.jenisIbadah.findFirst({
      where: {
        namaIbadah: {
          equals: namaIbadah,
          mode: "insensitive",
        },
      },
    });

    if (existingJenisIbadah) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jenis ibadah sudah ada"));
    }

    const newJenisIbadah = await prisma.jenisIbadah.create({
      data: {
        namaIbadah,
      },
      include: {
        _count: {
          select: {
            jadwalIbadahs: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newJenisIbadah, "Jenis ibadah berhasil ditambahkan")
      );
  } catch (error) {
    console.error("Error creating jenis ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan jenis ibadah",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
