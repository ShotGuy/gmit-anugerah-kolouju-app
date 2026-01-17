import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { parseQueryParams } from "@/lib/queryParams";

// GET - Ambil semua data jaminan kesehatan
async function handleGet(req, res) {
  try {
    const { pagination, sort, where } = parseQueryParams(req.query, {
      searchField: "jenisJaminan", // <- this is your Prisma model field
      defaultSortBy: "jenisJaminan",
    });

    const total = await prisma.jaminanKesehatan.count({ where });

    const items = await prisma.jaminanKesehatan.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
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
    console.error("Error fetching data:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil data", error.message));
  }
}

// POST - Tambah data jaminan kesehatan baru
async function handlePost(req, res) {
  try {
    const { jenisJaminan } = req.body;

    // Validasi input
    if (!jenisJaminan || jenisJaminan.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          jenisJaminan: "Nama jenis jaminan wajib diisi",
        })
      );
    }

    // Cek duplikasi
    const existingJaminanKesehatan = await prisma.jaminanKesehatan.findFirst({
      where: {
        jenisJaminan: {
          equals: jenisJaminan.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingJaminanKesehatan) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          jenisJaminan: "Jenis jaminan ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newJaminanKesehatan = await prisma.jaminanKesehatan.create({
      data: {
        jenisJaminan: jenisJaminan.trim(),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newJaminanKesehatan,
          "Data jaminan kesehatan berhasil ditambahkan"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating jaminan kesehatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data jaminan kesehatan",
          error.message
        )
      );
  }
}

// PUT - Update data jaminan kesehatan
async function handlePut(req, res) {
  try {
    const { id, jenisJaminan } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID jaminan kesehatan wajib diisi",
        })
      );
    }

    if (!jenisJaminan || jenisJaminan.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          jenisJaminan: "Nama jenis jaminan wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingJaminanKesehatan = await prisma.jaminanKesehatan.findUnique({
      where: { id },
    });

    if (!existingJaminanKesehatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi (kecuali untuk data yang sedang di-update)
    const duplicateCheck = await prisma.jaminanKesehatan.findFirst({
      where: {
        AND: [
          {
            jenisJaminan: {
              equals: jenisJaminan.trim(),
              mode: "insensitive",
            },
          },
          {
            NOT: {
              id: id,
            },
          },
        ],
      },
    });

    if (duplicateCheck) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          jenisJaminan: "Jenis jaminan ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedJaminanKesehatan = await prisma.jaminanKesehatan.update({
      where: { id },
      data: {
        jenisJaminan: jenisJaminan.trim(),
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedJaminanKesehatan,
          "Data jaminan kesehatan berhasil diperbarui"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating jaminan kesehatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data jaminan kesehatan",
          error.message
        )
      );
  }
}

// DELETE - Hapus data jaminan kesehatan
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID jaminan kesehatan wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingJaminanKesehatan = await prisma.jaminanKesehatan.findUnique({
      where: { id },
    });

    if (!existingJaminanKesehatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan
    const usageCount = await prisma.jemaat.count({
      where: {
        idJaminanKesehatan: id,
      },
    });

    if (usageCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Data ini sedang digunakan oleh ${usageCount} jemaat`
          )
        );
    }

    // Hapus data
    await prisma.jaminanKesehatan.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Data jaminan kesehatan berhasil dihapus"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting jaminan kesehatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data jaminan kesehatan",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  POST: handlePost,
  DELETE: handleDelete,
  PUT: handlePut,
});
