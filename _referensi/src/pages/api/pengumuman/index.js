import prisma from "@/lib/prisma";

const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

const validateFileSize = (base64String, maxSize, fileName) => {
  const sizeInBytes = (base64String.length * 3) / 4;
  if (sizeInBytes > maxSize) {
    throw new Error(`${fileName} melebihi ukuran maksimal ${maxSize / (1024 * 1024)}MB`);
  }
};

const validateAttachments = (attachments) => {
  if (!attachments || !Array.isArray(attachments)) return;

  for (const attachment of attachments) {
    const { fileName, fileType, base64Data } = attachment;
    
    if (!fileName || !fileType || !base64Data) {
      throw new Error("File attachment tidak valid");
    }

    // Validasi ukuran file
    if (fileType.startsWith('image/')) {
      validateFileSize(base64Data, 1024 * 1024, fileName); // 1MB untuk gambar
    } else if (fileType === 'application/pdf') {
      validateFileSize(base64Data, 3 * 1024 * 1024, fileName); // 3MB untuk PDF
    } else {
      throw new Error(`Tipe file ${fileType} tidak didukung`);
    }

    // Validasi format Base64
    if (!base64Data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      throw new Error(`File ${fileName} format Base64 tidak valid`);
    }
  }
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

async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      kategoriId = "",
      jenisId = "",
      status = "",
      prioritas = "",
      sortBy = "tanggalPengumuman",
      sortOrder = "desc",
      includeRelations = false,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  judul: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        kategoriId ? { kategoriId } : {},
        jenisId ? { jenisId } : {},
        status ? { status } : {},
        prioritas ? { prioritas } : {},
      ],
    };

    const total = await prisma.pengumuman.count({ where });

    // Query dengan select untuk exclude attachments dan optimasi performa
    const pengumuman = await prisma.pengumuman.findMany({
      where,
      skip: limitNum === -1 ? undefined : skip,
      take: limitNum === -1 ? undefined : limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        judul: true,
        kategoriId: true,
        jenisId: true,
        konten: true,
        tanggalPengumuman: true,
        status: true,
        prioritas: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        createdBy: true,
        updatedBy: true,
        // Exclude attachments untuk performa - akan di-load terpisah saat dibutuhkan
        kategori: includeRelations === "true" ? {
          select: { id: true, nama: true }
        } : false,
        jenis: includeRelations === "true" ? {
          select: { id: true, nama: true }
        } : false,
      },
    });

    const totalPages = limitNum === -1 ? 1 : Math.ceil(total / limitNum);

    const result = {
      items: pengumuman,
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
      .json(apiResponse(true, result, "Data pengumuman berhasil diambil"));
  } catch (error) {
    console.error("Error fetching pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data pengumuman",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const {
      judul,
      kategoriId,
      jenisId = null,
      konten,
      tanggalPengumuman,
      status = "DRAFT",
      prioritas = "MEDIUM",
      isPinned = false,
      attachments = null,
      createdBy = null,
    } = req.body;

    // Validasi input
    if (!judul || judul.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          judul: "Judul pengumuman wajib diisi",
        })
      );
    }

    if (!kategoriId) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori pengumuman wajib dipilih",
        })
      );
    }

    if (!konten) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          konten: "Konten pengumuman wajib diisi",
        })
      );
    }

    if (!tanggalPengumuman) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          tanggalPengumuman: "Tanggal pengumuman wajib diisi",
        })
      );
    }

    // Validasi kategori exists
    const kategoriExists = await prisma.kategoriPengumuman.findUnique({
      where: { id: kategoriId },
    });

    if (!kategoriExists) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori pengumuman tidak valid",
        })
      );
    }

    // Validasi jenis jika ada - PENTING: set null jika tidak valid
    let validJenisId = null;
    if (jenisId && jenisId.trim() !== "") {
      const jenisExists = await prisma.jenisPengumuman.findFirst({
        where: {
          id: jenisId,
          kategoriId: kategoriId,
          isActive: true  // Tambahan: pastikan jenis masih aktif
        },
      });

      if (jenisExists) {
        validJenisId = jenisId;
      } else {
        // Log warning tapi jangan error - set ke null saja
        console.warn(`Jenis pengumuman ${jenisId} tidak valid atau tidak sesuai kategori, menggunakan null`);
      }
    }

    // Validasi attachments
    try {
      validateAttachments(attachments);
    } catch (error) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          attachments: error.message,
        })
      );
    }

    // Buat pengumuman baru
    const newPengumuman = await prisma.pengumuman.create({
      data: {
        judul: judul.trim(),
        kategoriId,
        jenisId: validJenisId,  // Gunakan validJenisId yang sudah divalidasi
        konten: typeof konten === 'object' ? konten : JSON.parse(konten),
        tanggalPengumuman: new Date(tanggalPengumuman),
        status,
        prioritas,
        isPinned: Boolean(isPinned),
        attachments: attachments ? attachments : null,
        createdBy,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        kategori: {
          select: { id: true, nama: true }
        },
        jenis: {
          select: { id: true, nama: true }
        },
      },
    });

    return res
      .status(201)
      .json(
        apiResponse(
          true,
          newPengumuman,
          "Pengumuman berhasil dibuat"
        )
      );
  } catch (error) {
    console.error("Error creating pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal membuat pengumuman",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const {
      id,
      judul,
      kategoriId,
      jenisId,
      konten,
      tanggalPengumuman,
      status,
      prioritas,
      isPinned,
      attachments,
      updatedBy,
    } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID pengumuman wajib diisi",
        })
      );
    }

    // Cek apakah pengumuman exists
    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id },
    });

    if (!existingPengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Pengumuman tidak ditemukan"));
    }

    // Validasi input yang wajib
    if (judul && judul.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          judul: "Judul pengumuman wajib diisi",
        })
      );
    }

    // Validasi kategori jika diubah
    if (kategoriId) {
      const kategoriExists = await prisma.kategoriPengumuman.findUnique({
        where: { id: kategoriId },
      });

      if (!kategoriExists) {
        return res.status(400).json(
          apiResponse(false, null, "Validasi gagal", {
            kategoriId: "Kategori pengumuman tidak valid",
          })
        );
      }
    }

    // Validasi attachments jika ada
    if (attachments) {
      try {
        validateAttachments(attachments);
      } catch (error) {
        return res.status(400).json(
          apiResponse(false, null, "Validasi gagal", {
            attachments: error.message,
          })
        );
      }
    }

    // Prepare data untuk update
    const updateData = {
      updatedBy,
    };

    if (judul !== undefined) updateData.judul = judul.trim();
    if (kategoriId !== undefined) updateData.kategoriId = kategoriId;
    if (jenisId !== undefined) {
      // Validasi jenisId sebelum set
      if (jenisId && jenisId.trim() !== "") {
        const jenisExists = await prisma.jenisPengumuman.findFirst({
          where: {
            id: jenisId,
            kategoriId: kategoriId || existingPengumuman.kategoriId,
            isActive: true
          },
        });
        updateData.jenisId = jenisExists ? jenisId : null;
      } else {
        updateData.jenisId = null;
      }
    }
    if (konten !== undefined) updateData.konten = typeof konten === 'object' ? konten : JSON.parse(konten);
    if (tanggalPengumuman !== undefined) updateData.tanggalPengumuman = new Date(tanggalPengumuman);
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt jika status berubah ke PUBLISHED dan belum pernah dipublish
      if (status === "PUBLISHED" && !existingPengumuman.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (prioritas !== undefined) updateData.prioritas = prioritas;
    if (isPinned !== undefined) updateData.isPinned = Boolean(isPinned);
    if (attachments !== undefined) updateData.attachments = attachments;

    // Update pengumuman
    const updatedPengumuman = await prisma.pengumuman.update({
      where: { id },
      data: updateData,
      include: {
        kategori: {
          select: { id: true, nama: true }
        },
        jenis: {
          select: { id: true, nama: true }
        },
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedPengumuman,
          "Pengumuman berhasil diperbarui"
        )
      );
  } catch (error) {
    console.error("Error updating pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui pengumuman",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID pengumuman wajib diisi",
        })
      );
    }

    // Cek apakah pengumuman exists
    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id },
    });

    if (!existingPengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Pengumuman tidak ditemukan"));
    }

    // Hapus pengumuman
    await prisma.pengumuman.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Pengumuman berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus pengumuman",
          error.message
        )
      );
  }
}