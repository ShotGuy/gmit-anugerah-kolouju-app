import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaJabatan",
      defaultSortBy: "namaJabatan",
    });

    const total = await prisma.jenisJabatan.count({ where });

    const items = await prisma.jenisJabatan.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
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
    console.error("Error fetching jenis jabatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jenis jabatan",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const { namaJabatan } = req.body;

    if (!namaJabatan) {
      return res
        .status(400)
        .json(
          apiResponse(false, null, "Nama jenis jabatan wajib diisi")
        );
    }

    // Check if already exists
    const existingJenisJabatan = await prisma.jenisJabatan.findFirst({
      where: {
        namaJabatan: {
          equals: namaJabatan,
          mode: "insensitive",
        },
      },
    });

    if (existingJenisJabatan) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jenis jabatan sudah ada"));
    }

    const newJenisJabatan = await prisma.jenisJabatan.create({
      data: {
        namaJabatan,
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newJenisJabatan, "Jenis jabatan berhasil ditambahkan")
      );
  } catch (error) {
    console.error("Error creating jenis jabatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan jenis jabatan",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
