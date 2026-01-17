import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

// GET - Ambil semua data keadaan rumah
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "keadaan",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter untuk search
    const where = search
      ? {
          keadaan: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    // Get total count untuk pagination
    const total = await prisma.keadaanRumah.count({ where });

    // Get data dengan pagination
    const keadaanRumah = await prisma.keadaanRumah.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limitNum);

    const result = {
      items: keadaanRumah,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Data keadaan rumah berhasil diambil"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching keadaan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data keadaan rumah",
          error.message
        )
      );
  }
}

// POST - Tambah data keadaan rumah baru
async function handlePost(req, res) {
  try {
    const { keadaan } = req.body;

    // Validasi input
    if (!keadaan || keadaan.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          keadaan: "Keadaan rumah wajib diisi",
        })
      );
    }

    // Cek duplikasi
    const existingKeadaan = await prisma.keadaanRumah.findFirst({
      where: {
        keadaan: {
          equals: keadaan.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingKeadaan) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          keadaan: "Keadaan rumah ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newKeadaan = await prisma.keadaanRumah.create({
      data: {
        keadaan: keadaan.trim(),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newKeadaan, "Data keadaan rumah berhasil ditambahkan")
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating keadaan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data keadaan rumah",
          error.message
        )
      );
  }
}

// PUT - Update data keadaan rumah
async function handlePut(req, res) {
  try {
    const { id, keadaan } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID keadaan rumah wajib diisi",
        })
      );
    }

    if (!keadaan || keadaan.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          keadaan: "Keadaan rumah wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingKeadaan = await prisma.keadaanRumah.findUnique({
      where: { id },
    });

    if (!existingKeadaan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi (kecuali untuk data yang sedang di-update)
    const duplicateCheck = await prisma.keadaanRumah.findFirst({
      where: {
        AND: [
          {
            keadaan: {
              equals: keadaan.trim(),
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
          keadaan: "Keadaan rumah ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedKeadaan = await prisma.keadaanRumah.update({
      where: { id },
      data: {
        keadaan: keadaan.trim(),
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedKeadaan,
          "Data keadaan rumah berhasil diperbarui"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating keadaan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data keadaan rumah",
          error.message
        )
      );
  }
}

// DELETE - Hapus data keadaan rumah
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID keadaan rumah wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingKeadaan = await prisma.keadaanRumah.findUnique({
      where: { id },
    });

    if (!existingKeadaan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan by keluarga
    const usageCount = await prisma.keluarga.count({
      where: {
        idKeadaanRumah: id,
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
            `Data ini sedang digunakan oleh ${usageCount} keluarga`
          )
        );
    }

    // Hapus data
    await prisma.keadaanRumah.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Data keadaan rumah berhasil dihapus"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting keadaan rumah:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data keadaan rumah",
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
