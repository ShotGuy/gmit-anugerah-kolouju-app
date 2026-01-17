import prisma from "@/lib/prisma";
import { deleteFileFromS3 } from "@/lib/s3";

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

async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isPublished = "",
      sortBy = "tanggalKegiatan",
      sortOrder = "desc",
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
                  namaKegiatan: {
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
                  tempat: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        { isActive: true },
        isPublished ? { isPublished: isPublished === "true" } : {},
      ],
    };

    const total = await prisma.galeri.count({ where });

    const galeri = await prisma.galeri.findMany({
      where,
      skip: limitNum === -1 ? undefined : skip,
      take: limitNum === -1 ? undefined : limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = limitNum === -1 ? 1 : Math.ceil(total / limitNum);

    const result = {
      items: galeri,
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
      .json(apiResponse(true, result, "Data galeri berhasil diambil"));
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data galeri", error.message)
      );
  }
}

async function handlePost(req, res) {
  try {
    const {
      namaKegiatan,
      deskripsi = null,
      tempat,
      tanggalKegiatan,
      fotos = null,
      isPublished = false,
    } = req.body;

    // Validasi input
    if (!namaKegiatan || namaKegiatan.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          namaKegiatan: "Nama kegiatan wajib diisi",
        })
      );
    }

    if (!tempat || tempat.trim() === "") {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          tempat: "Tempat kegiatan wajib diisi",
        })
      );
    }

    if (!tanggalKegiatan) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          tanggalKegiatan: "Tanggal kegiatan wajib diisi",
        })
      );
    }

    // Validasi fotos jika ada
    if (fotos && !Array.isArray(fotos)) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          fotos: "Format foto tidak valid",
        })
      );
    }

    // Buat galeri baru
    const newGaleri = await prisma.galeri.create({
      data: {
        namaKegiatan: namaKegiatan.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null,
        tempat: tempat.trim(),
        tanggalKegiatan: new Date(tanggalKegiatan),
        fotos: fotos ? JSON.stringify(fotos) : null,
        isPublished: Boolean(isPublished),
        publishedAt: Boolean(isPublished) ? new Date() : null,
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newGaleri, "Galeri berhasil dibuat"));
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal membuat galeri", error.message));
  }
}

async function handlePut(req, res) {
  try {
    const {
      id,
      namaKegiatan,
      deskripsi,
      tempat,
      tanggalKegiatan,
      fotos,
      isPublished,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID galeri wajib diisi",
        })
      );
    }

    // Cek apakah galeri exists
    const existingGaleri = await prisma.galeri.findUnique({
      where: { id },
    });

    if (!existingGaleri) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Galeri tidak ditemukan"));
    }

    // Prepare data untuk update
    const updateData = {};

    if (namaKegiatan !== undefined)
      updateData.namaKegiatan = namaKegiatan.trim();
    if (deskripsi !== undefined)
      updateData.deskripsi = deskripsi ? deskripsi.trim() : null;
    if (tempat !== undefined) updateData.tempat = tempat.trim();
    if (tanggalKegiatan !== undefined)
      updateData.tanggalKegiatan = new Date(tanggalKegiatan);
    if (fotos !== undefined)
      updateData.fotos = fotos ? JSON.stringify(fotos) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
      // Set publishedAt jika status berubah ke published dan belum pernah dipublish
      if (Boolean(isPublished) && !existingGaleri.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Update galeri
    const updatedGaleri = await prisma.galeri.update({
      where: { id },
      data: updateData,
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedGaleri, "Galeri berhasil diperbarui"));
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui galeri", error.message)
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID galeri wajib diisi",
        })
      );
    }

    // Cek apakah galeri exists
    const existingGaleri = await prisma.galeri.findUnique({
      where: { id },
    });

    if (!existingGaleri) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Galeri tidak ditemukan"));
    }

    // Hapus foto-foto dari S3 jika ada
    if (existingGaleri.fotos) {
      try {
        const fotos = JSON.parse(existingGaleri.fotos);

        if (Array.isArray(fotos) && fotos.length > 0) {
          // Hapus semua foto dari S3
          const deletePromises = fotos.map(async (foto) => {
            if (foto.fileName) {
              const deleteResult = await deleteFileFromS3(foto.fileName);

              if (!deleteResult.success) {
              } else {
              }

              return deleteResult;
            }
          });

          await Promise.all(deletePromises);
        }
      } catch (parseError) {
        // Lanjutkan proses delete meskipun parsing gagal
      }
    }

    // Hapus galeri dari database (soft delete)
    await prisma.galeri.update({
      where: { id },
      data: { isActive: false },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Galeri dan foto berhasil dihapus"));
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus galeri", error.message));
  }
}
