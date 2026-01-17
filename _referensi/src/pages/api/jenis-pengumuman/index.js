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

// GET - Ambil semua data jenis pengumuman
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "nama",
      sortOrder = "asc",
      kategoriId,
      includeCount = false,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter untuk search dan kategori
    const where = {
      AND: [
        kategoriId ? { kategoriId } : {},
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
                {
                  kategori: {
                    nama: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    // Get total count untuk pagination
    const total = await prisma.jenisPengumuman.count({ where });

    // Include options
    const include = {
      kategori: {
        select: {
          id: true,
          nama: true,
        },
      },
      ...(includeCount === "true" && {
        _count: {
          select: {
            pengumuman: true,
          },
        },
      }),
    };

    // Get data dengan pagination
    const jenisPengumuman = await prisma.jenisPengumuman.findMany({
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
      items: jenisPengumuman,
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
        apiResponse(true, result, "Data jenis pengumuman berhasil diambil")
      );
  } catch (error) {
    console.error("Error fetching jenis pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jenis pengumuman",
          error.message
        )
      );
  }
}

// POST - Tambah data jenis pengumuman baru
async function handlePost(req, res) {
  try {
    const { kategoriId, nama, deskripsi, isActive = true } = req.body;

    // Validasi input
    if (!kategoriId || kategoriId.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori pengumuman wajib dipilih",
        })
      );
    }

    if (!nama || nama.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama jenis pengumuman wajib diisi",
        })
      );
    }

    if (nama.trim().length > 150) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama maksimal 150 karakter",
        })
      );
    }

    // Cek apakah kategori exists
    const kategoriExists = await prisma.kategoriPengumuman.findUnique({
      where: { id: kategoriId },
    });

    if (!kategoriExists) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori pengumuman tidak ditemukan",
        })
      );
    }

    // Cek duplikasi nama dalam kategori yang sama
    const existingNama = await prisma.jenisPengumuman.findFirst({
      where: {
        kategoriId,
        nama: {
          equals: nama.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingNama) {
      return res.status(409).json(
        apiResponse(false, null, "Data sudah ada", {
          nama: "Nama jenis pengumuman ini sudah terdaftar dalam kategori yang sama",
        })
      );
    }

    // Buat data baru
    const newJenis = await prisma.jenisPengumuman.create({
      data: {
        kategoriId,
        nama: nama.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null,
        isActive: Boolean(isActive),
      },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newJenis,
          "Data jenis pengumuman berhasil ditambahkan"
        )
      );
  } catch (error) {
    console.error("Error creating jenis pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menambahkan data jenis pengumuman",
          error.message
        )
      );
  }
}

// PUT - Update data jenis pengumuman
async function handlePut(req, res) {
  try {
    const { id, kategoriId, nama, deskripsi, isActive } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID jenis pengumuman wajib diisi",
        })
      );
    }

    if (!kategoriId || kategoriId.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori pengumuman wajib dipilih",
        })
      );
    }

    if (!nama || nama.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama jenis pengumuman wajib diisi",
        })
      );
    }

    if (nama.trim().length > 150) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: "Nama maksimal 150 karakter",
        })
      );
    }

    // Cek apakah data exists
    const existingJenis = await prisma.jenisPengumuman.findUnique({
      where: { id },
    });

    if (!existingJenis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah kategori exists
    const kategoriExists = await prisma.kategoriPengumuman.findUnique({
      where: { id: kategoriId },
    });

    if (!kategoriExists) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori pengumuman tidak ditemukan",
        })
      );
    }

    // Cek duplikasi nama dalam kategori yang sama (kecuali untuk data yang sedang di-update)
    const duplicateNama = await prisma.jenisPengumuman.findFirst({
      where: {
        AND: [
          { kategoriId },
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
          nama: "Nama jenis pengumuman ini sudah terdaftar dalam kategori yang sama",
        })
      );
    }

    // Update data
    const updatedJenis = await prisma.jenisPengumuman.update({
      where: { id },
      data: {
        kategoriId,
        nama: nama.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null,
        isActive: typeof isActive !== 'undefined' ? Boolean(isActive) : existingJenis.isActive,
      },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedJenis,
          "Data jenis pengumuman berhasil diperbarui"
        )
      );
  } catch (error) {
    console.error("Error updating jenis pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data jenis pengumuman",
          error.message
        )
      );
  }
}

// DELETE - Hapus data jenis pengumuman
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validasi input
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID jenis pengumuman wajib diisi",
        })
      );
    }

    // Cek apakah data exists
    const existingJenis = await prisma.jenisPengumuman.findUnique({
      where: { id },
    });

    if (!existingJenis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Cek apakah data sedang digunakan
    const pengumumanCount = await prisma.pengumuman.count({
      where: {
        jenisId: id,
      },
    });

    if (pengumumanCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Data ini sedang digunakan oleh ${pengumumanCount} pengumuman`
          )
        );
    }

    // Hapus data
    await prisma.jenisPengumuman.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, null, "Data jenis pengumuman berhasil dihapus")
      );
  } catch (error) {
    console.error("Error deleting jenis pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data jenis pengumuman",
          error.message
        )
      );
  }
}