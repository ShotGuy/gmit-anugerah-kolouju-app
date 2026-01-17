import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

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

// GET - Ambil semua data suku
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 1000, // Default to a high limit for master data
      search = "",
      sortBy = "namaSuku",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          namaSuku: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const total = await prisma.suku.count({ where });
    const items = await prisma.suku.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limitNum);

    const result = {
      items,
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
      .json(apiResponse(true, result, "Data suku berhasil diambil"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching suku:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data suku", error.message)
      );
  }
}

// POST - Tambah data suku baru
async function handlePost(req, res) {
  try {
    const { namaSuku, isActive = true } = req.body;

    // Validasi input
    if (!namaSuku || namaSuku.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          namaSuku: "Nama suku wajib diisi",
        })
      );
    }

    // Cek duplikasi
    const existingSuku = await prisma.suku.findFirst({
      where: {
        namaSuku: {
          equals: namaSuku.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingSuku) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          namaSuku: "Suku ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newSuku = await prisma.suku.create({
      data: {
        namaSuku: namaSuku.trim(),
        isActive: isActive,
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newSuku, "Data suku berhasil ditambahkan"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating suku:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menambahkan data suku", error.message)
      );
  }
}

// PUT - Update data suku
async function handlePut(req, res) {
  try {
    const { id, namaSuku, isActive } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID suku wajib diisi",
        })
      );
    }

    if (!namaSuku || namaSuku.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          namaSuku: "Nama suku wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingSuku = await prisma.suku.findUnique({
      where: { id },
    });

    if (!existingSuku) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi suku (kecuali untuk data yang sedang di-update)
    const duplicateCheck = await prisma.suku.findFirst({
      where: {
        AND: [
          {
            namaSuku: {
              equals: namaSuku.trim(),
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
          namaSuku: "Suku ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedSuku = await prisma.suku.update({
      where: { id },
      data: {
        namaSuku: namaSuku.trim(),
        ...(typeof isActive !== "undefined" && { isActive: isActive }),
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedSuku, "Data suku berhasil diperbarui"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating suku:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui data suku", error.message)
      );
  }
}

// DELETE - Hapus data suku
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID suku wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingSuku = await prisma.suku.findUnique({
      where: { id },
    });

    if (!existingSuku) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan
    const usageCount = await prisma.jemaat.count({
      where: {
        idSuku: id,
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
    await prisma.suku.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Data suku berhasil dihapus"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting suku:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus data suku", error.message)
      );
  }
}
