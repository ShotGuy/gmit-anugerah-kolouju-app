import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "namaKategori",
      defaultSortBy: "namaKategori",
    });

    const total = await prisma.kategoriJadwal.count({ where });

    const items = await prisma.kategoriJadwal.findMany({
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
    const { namaKategori, deskripsi } = req.body;

    const existingKategoriJadwal = await prisma.kategoriJadwal.findFirst({
      where: {
        namaKategori: {
          equals: namaKategori,
          mode: "insensitive",
        },
      },
    });

    if (existingKategoriJadwal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama kategori jadwal sudah ada"));
    }

    const newKategoriJadwal = await prisma.kategoriJadwal.create({
      data: {
        namaKategori,
        deskripsi,
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newKategoriJadwal,
          "Data kategori jadwal berhasil ditambahkan"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data kategori jadwal",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
});
