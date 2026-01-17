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

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json(
      apiResponse(false, null, "Validasi gagal", {
        id: "ID pengumuman wajib diisi",
      })
    );
  }

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, id);
      case "PUT":
      case "PATCH":
        return await handleUpdate(req, res, id);
      case "DELETE":
        return await handleDelete(req, res, id);
      default:
        res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
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

async function handleGet(req, res, id) {
  try {
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id },
      include: {
        kategori: {
          select: { id: true, nama: true, deskripsi: true }
        },
        jenis: {
          select: { id: true, nama: true, deskripsi: true }
        },
      },
    });

    if (!pengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Pengumuman tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, pengumuman, "Data pengumuman berhasil diambil"));
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

async function handleUpdate(req, res, id) {
  try {
    const {
      judul,
      kategoriId,
      jenisId,
      konten,
      kontenDinamis,
      tanggalPengumuman,
      status,
      prioritas,
      isPinned,
    } = req.body;

    // Check if pengumuman exists
    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id },
    });

    if (!existingPengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Pengumuman tidak ditemukan"));
    }

    // Validate required fields
    if (!judul) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          judul: "Judul wajib diisi",
        })
      );
    }

    if (!kategoriId) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          kategoriId: "Kategori wajib dipilih",
        })
      );
    }

    // Build update data
    const updateData = {
      judul,
      kategoriId,
      konten: konten || null,
      kontenDinamis: kontenDinamis || null,
      tanggalPengumuman: tanggalPengumuman ? new Date(tanggalPengumuman) : null,
      status: status || "DRAFT",
      prioritas: prioritas || "MEDIUM",
      isPinned: isPinned || false,
      updatedAt: new Date(),
    };

    // Add jenisId if provided
    if (jenisId) {
      updateData.jenisId = jenisId;
    }

    // Set publishedAt if status is changing to PUBLISHED
    if (status === "PUBLISHED" && existingPengumuman.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    // Update the pengumuman
    const updatedPengumuman = await prisma.pengumuman.update({
      where: { id },
      data: updateData,
      include: {
        kategori: {
          select: { id: true, nama: true, deskripsi: true },
        },
        jenis: {
          select: { id: true, nama: true, deskripsi: true },
        },
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedPengumuman, "Pengumuman berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating pengumuman:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui pengumuman", error.message)
      );
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check if pengumuman exists
    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id },
    });

    if (!existingPengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Pengumuman tidak ditemukan"));
    }

    // Delete the pengumuman
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
        apiResponse(false, null, "Gagal menghapus pengumuman", error.message)
      );
  }
}