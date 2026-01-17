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
  const { id } = req.query;

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
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

// GET - Ambil data kategori pengumuman berdasarkan ID
async function handleGet(req, res, id) {
  try {
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID kategori pengumuman wajib diisi",
        })
      );
    }

    const kategoriPengumuman = await prisma.kategoriPengumuman.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jenisPengumuman: true,
            pengumuman: true,
          },
        },
        jenisPengumuman: {
          where: {
            isActive: true,
          },
          orderBy: {
            nama: 'asc',
          },
        },
      },
    });

    if (!kategoriPengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    return res
      .status(200)
      .json(
        apiResponse(true, kategoriPengumuman, "Data kategori pengumuman berhasil diambil")
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

// PATCH - Update data kategori pengumuman berdasarkan ID
async function handlePatch(req, res, id) {
  try {
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID kategori pengumuman wajib diisi",
        })
      );
    }

    const { nama, deskripsi, pasalDeskripsi, isActive } = req.body;

    // Cek apakah data exists
    const existingKategori = await prisma.kategoriPengumuman.findUnique({
      where: { id },
    });

    if (!existingKategori) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Prepare update data
    const updateData = {};

    if (nama !== undefined) {
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

      updateData.nama = nama.trim();
    }

    if (deskripsi !== undefined) {
      updateData.deskripsi = deskripsi ? deskripsi.trim() : null;
    }

    if (pasalDeskripsi !== undefined) {
      updateData.pasalDeskripsi = pasalDeskripsi || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Update data jika ada perubahan
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(
        apiResponse(false, null, "Tidak ada data yang diubah")
      );
    }

    const updatedKategori = await prisma.kategoriPengumuman.update({
      where: { id },
      data: updateData,
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

// DELETE - Hapus data kategori pengumuman berdasarkan ID
async function handleDelete(req, res, id) {
  try {
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