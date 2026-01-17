import prisma from "@/lib/prisma";

// Helper function untuk response API
const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

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

// GET - Ambil semua data kategori pengumuman
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "nama",
      sortOrder = "asc",
      includeCount = false,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter untuk search
    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  nama: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  deskripsi: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
      ],
    };

    // Get total count untuk pagination
    const total = await prisma.kategoriPengumuman.count({ where });

    // Include options
    const include = includeCount === "true" ? {
      _count: {
        select: {
          jenisPengumuman: true,
          pengumuman: true,
        },
      },
    } : {};

    // Get data dengan pagination
    const kategoriPengumuman = await prisma.kategoriPengumuman.findMany({
      where,
      include,
      skip: limitNum === -1 ? undefined : skip,
      take: limitNum === -1 ? undefined : limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = limitNum === -1 ? 1 : Math.ceil(total / limitNum);

    const result = {
      items: kategoriPengumuman,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: limitNum === -1 ? false : pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };

    return res
      .status(200)
      .json(
        apiResponse(true, result, "Data kategori pengumuman berhasil diambil")
      );
  } catch (error) {
    console.error("Error fetching kategori pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data kategori pengumuman",
          error.message
        )
      );
  }
}

// POST - Tambah data kategori pengumuman baru
async function handlePost(req, res) {
  try {
    const { nama, deskripsi, pasalDeskripsi, isActive = true } = req.body;

    // Validasi input
    if (!nama || nama.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama kategori pengumuman wajib diisi",
        })
      );
    }

    if (nama.trim().length > 100) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama maksimal 100 karakter",
        })
      );
    }

    // Cek duplikasi nama
    const existingNama = await prisma.kategoriPengumuman.findFirst({
      where: {
        nama: {
          equals: nama.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingNama) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          nama: "Nama kategori pengumuman ini sudah terdaftar",
        })
      );
    }

    // Buat data baru
    const newKategori = await prisma.kategoriPengumuman.create({
      data: {
        nama: nama.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null,
        pasalDeskripsi: pasalDeskripsi || null,
        isActive: Boolean(isActive),
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newKategori,
          "Data kategori pengumuman berhasil ditambahkan"
        )
      );
  } catch (error) {
    console.error("Error creating kategori pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data kategori pengumuman",
          error.message
        )
      );
  }
}

// PUT - Update data kategori pengumuman
async function handlePut(req, res) {
  try {
    const { id, nama, deskripsi, pasalDeskripsi, isActive } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID kategori pengumuman wajib diisi",
        })
      );
    }

    if (!nama || nama.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama kategori pengumuman wajib diisi",
        })
      );
    }

    if (nama.trim().length > 100) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama maksimal 100 karakter",
        })
      );
    }

    // Cek apakah data exists
    const existingKategori = await prisma.kategoriPengumuman.findUnique({
      where: { id },
    });

    if (!existingKategori) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek duplikasi nama (kecuali untuk data yang sedang di-update)
    const duplicateNama = await prisma.kategoriPengumuman.findFirst({
      where: {
        AND: [
          {
            nama: {
              equals: nama.trim(),
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

    if (duplicateNama) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          nama: "Nama kategori pengumuman ini sudah terdaftar",
        })
      );
    }

    // Update data
    const updatedKategori = await prisma.kategoriPengumuman.update({
      where: { id },
      data: {
        nama: nama.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null,
        pasalDeskripsi: pasalDeskripsi || null,
        isActive: typeof isActive !== 'undefined' ? Boolean(isActive) : existingKategori.isActive,
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedKategori,
          "Data kategori pengumuman berhasil diperbarui"
        )
      );
  } catch (error) {
    console.error("Error updating kategori pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data kategori pengumuman",
          error.message
        )
      );
  }
}

// DELETE - Hapus data kategori pengumuman
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID kategori pengumuman wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingKategori = await prisma.kategoriPengumuman.findUnique({
      where: { id },
    });

    if (!existingKategori) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan
    const jenisCount = await prisma.jenisPengumuman.count({
      where: {
        kategoriId: id,
      },
    });

    const pengumumanCount = await prisma.pengumuman.count({
      where: {
        kategoriId: id,
      },
    });

    if (jenisCount > 0 || pengumumanCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Data ini sedang digunakan oleh ${jenisCount} jenis pengumuman dan ${pengumumanCount} pengumuman`
          )
        );
    }

    // Hapus data
    await prisma.kategoriPengumuman.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, null, "Data kategori pengumuman berhasil dihapus")
      );
  } catch (error) {
    console.error("Error deleting kategori pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data kategori pengumuman",
          error.message
        )
      );
  }
}