import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);

        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

// GET - Ambil semua data status dalam keluarga
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "status",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter untuk search
    const where = search
      ? {
          status: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    // Get total count untuk pagination
    const total = await prisma.statusDalamKeluarga.count({ where });

    // Get data dengan pagination
    const statusDalamKeluarga = await prisma.statusDalamKeluarga.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limitNum);

    const result = {
      items: statusDalamKeluarga,
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
      .json(
        apiResponse(true, result, "Data status dalam keluarga berhasil diambil")
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching status dalam keluarga:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data status dalam keluarga",
          error.message
        )
      );
  }
}

// POST - Tambah data status dalam keluarga baru
async function handlePost(req, res) {
  try {
    const { status } = req.body;

    // Validasi input
    if (!status || status.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          status: "Status dalam keluarga wajib diisi",
        })
      );
    }

    // Cek duplikasi
    const existingStatus = await prisma.statusDalamKeluarga.findFirst({
      where: {
        status: {
          equals: status.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingStatus) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          status: "Status dalam keluarga ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newStatus = await prisma.statusDalamKeluarga.create({
      data: {
        status: status.trim(),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newStatus,
          "Data status dalam keluarga berhasil ditambahkan"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating status dalam keluarga:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data status dalam keluarga",
          error.message
        )
      );
  }
}

// PUT - Update data status dalam keluarga
async function handlePut(req, res) {
  try {
    const { id, status } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID status dalam keluarga wajib diisi",
        })
      );
    }

    if (!status || status.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          status: "Status dalam keluarga wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingStatus = await prisma.statusDalamKeluarga.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi (kecuali untuk data yang sedang di-update)
    const duplicateCheck = await prisma.statusDalamKeluarga.findFirst({
      where: {
        AND: [
          {
            status: {
              equals: status.trim(),
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
          status: "Status dalam keluarga ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedStatus = await prisma.statusDalamKeluarga.update({
      where: { id },
      data: {
        status: status.trim(),
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedStatus,
          "Data status dalam keluarga berhasil diperbarui"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating status dalam keluarga:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data status dalam keluarga",
          error.message
        )
      );
  }
}

// DELETE - Hapus data status dalam keluarga
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID status dalam keluarga wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingStatus = await prisma.statusDalamKeluarga.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan
    const usageCount = await prisma.jemaat.count({
      where: {
        idStatusDalamKeluarga: id,
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
    await prisma.statusDalamKeluarga.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, null, "Data status dalam keluarga berhasil dihapus")
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting status dalam keluarga:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data status dalam keluarga",
          error.message
        )
      );
  }
}
