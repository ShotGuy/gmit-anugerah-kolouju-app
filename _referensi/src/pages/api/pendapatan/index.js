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

// GET - Ambil semua data pendapatan
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "label",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter untuk search
    const where = search
      ? {
          label: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    // Get total count untuk pagination
    const total = await prisma.pendapatan.count({ where });

    // Get data dengan pagination
    const pendapatan = await prisma.pendapatan.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limitNum);

    const result = {
      items: pendapatan,
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
      .json(apiResponse(true, result, "Data pendapatan berhasil diambil"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching pendapatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data pendapatan",
          error.message
        )
      );
  }
}

// POST - Tambah data pendapatan baru
async function handlePost(req, res) {
  try {
    const { label, min, max } = req.body;

    // Validasi input
    if (!label || label.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          label: "Label pendapatan wajib diisi",
        })
      );
    }

    if (min === undefined || min === null || min < 0) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          min: "Pendapatan minimum wajib diisi dan tidak boleh negatif",
        })
      );
    }

    if (max === undefined || max === null || max < 0) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          max: "Pendapatan maksimum wajib diisi dan tidak boleh negatif",
        })
      );
    }

    if (parseInt(min) >= parseInt(max)) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          max: "Pendapatan maksimum harus lebih besar dari minimum",
        })
      );
    }

    // Cek duplikasi
    const existingPendapatan = await prisma.pendapatan.findFirst({
      where: {
        label: {
          equals: label.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingPendapatan) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          label: "Label pendapatan ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newPendapatan = await prisma.pendapatan.create({
      data: {
        label: label.trim(),
        min: parseInt(min),
        max: parseInt(max),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(true, newPendapatan, "Data pendapatan berhasil ditambahkan")
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating pendapatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data pendapatan",
          error.message
        )
      );
  }
}

// PUT - Update data pendapatan
async function handlePut(req, res) {
  try {
    const { id, label, min, max } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID pendapatan wajib diisi",
        })
      );
    }

    if (!label || label.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          label: "Label pendapatan wajib diisi",
        })
      );
    }

    if (min === undefined || min === null || min < 0) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          min: "Pendapatan minimum wajib diisi dan tidak boleh negatif",
        })
      );
    }

    if (max === undefined || max === null || max < 0) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          max: "Pendapatan maksimum wajib diisi dan tidak boleh negatif",
        })
      );
    }

    if (parseInt(min) >= parseInt(max)) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          max: "Pendapatan maksimum harus lebih besar dari minimum",
        })
      );
    }

    // Cek apakah data exists
    const existingPendapatan = await prisma.pendapatan.findUnique({
      where: { id },
    });

    if (!existingPendapatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi label (kecuali untuk data yang sedang di-update)
    const duplicateCheck = await prisma.pendapatan.findFirst({
      where: {
        AND: [
          {
            label: {
              equals: label.trim(),
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
          label: "Label pendapatan ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedPendapatan = await prisma.pendapatan.update({
      where: { id },
      data: {
        label: label.trim(),
        min: parseInt(min),
        max: parseInt(max),
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedPendapatan,
          "Data pendapatan berhasil diperbarui"
        )
      );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating pendapatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data pendapatan",
          error.message
        )
      );
  }
}

// DELETE - Hapus data pendapatan
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID pendapatan wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingPendapatan = await prisma.pendapatan.findUnique({
      where: { id },
    });

    if (!existingPendapatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan
    const usageCount = await prisma.jemaat.count({
      where: {
        idPendapatan: id,
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
    await prisma.pendapatan.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Data pendapatan berhasil dihapus"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting pendapatan:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data pendapatan",
          error.message
        )
      );
  }
}
