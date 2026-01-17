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
        id: "ID kategori keuangan wajib diisi",
      })
    );
  }

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, id);
      case "PATCH":
        return await handlePatch(req, res, id);
      case "DELETE":
        return await handleDelete(req, res, id);
      default:
        res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Keuangan Kategori Detail Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res, id) {
  try {
    const { includeCount } = req.query;
    
    const include = {};
    if (includeCount === 'true') {
      include._count = {
        select: {
          itemKeuangan: true
        }
      };
    }

    const kategori = await prisma.kategoriKeuangan.findUnique({
      where: { id },
      include
    });

    if (!kategori) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Kategori keuangan tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, kategori, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kategori keuangan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil data kategori keuangan", error.message));
  }
}

async function handlePatch(req, res, id) {
  try {
    const { nama, kode, isActive } = req.body;

    // Check if kategori exists
    const existingKategori = await prisma.kategoriKeuangan.findUnique({
      where: { id }
    });

    if (!existingKategori) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Kategori keuangan tidak ditemukan"));
    }

    // Check if kode already exists (if changed)
    if (kode && kode !== existingKategori.kode) {
      const existingKode = await prisma.kategoriKeuangan.findUnique({
        where: { kode }
      });

      if (existingKode) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Validasi gagal", {
            kode: "Kode kategori sudah digunakan"
          }));
      }
    }

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (kode !== undefined) updateData.kode = kode;
    if (isActive !== undefined) updateData.isActive = isActive;

    const kategori = await prisma.kategoriKeuangan.update({
      where: { id },
      data: updateData
    });

    return res
      .status(200)
      .json(apiResponse(true, kategori, "Kategori keuangan berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating kategori keuangan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal memperbarui kategori keuangan", error.message));
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check if kategori exists
    const existingKategori = await prisma.kategoriKeuangan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            itemKeuangan: true
          }
        }
      }
    });

    if (!existingKategori) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Kategori keuangan tidak ditemukan"));
    }

    // Check if category has related item keuangan
    if (existingKategori._count.itemKeuangan > 0) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Kategori tidak dapat dihapus karena masih memiliki item keuangan"));
    }

    await prisma.kategoriKeuangan.delete({
      where: { id }
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Kategori keuangan berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting kategori keuangan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus kategori keuangan", error.message));
  }
}