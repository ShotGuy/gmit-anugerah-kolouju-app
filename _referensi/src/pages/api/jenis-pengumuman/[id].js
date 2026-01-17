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

// GET - Ambil data jenis pengumuman berdasarkan ID
async function handleGet(req, res, id) {
  try {
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID jenis pengumuman wajib diisi",
        })
      );
    }

    const jenisPengumuman = await prisma.jenisPengumuman.findUnique({
      where: { id },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
          },
        },
        _count: {
          select: {
            pengumuman: true,
          },
        },
      },
    });

    if (!jenisPengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    return res
      .status(200)
      .json(
        apiResponse(true, jenisPengumuman, "Data jenis pengumuman berhasil diambil")
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

// PATCH - Update data jenis pengumuman berdasarkan ID
async function handlePatch(req, res, id) {
  try {
    if (!id) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          id: "ID jenis pengumuman wajib diisi",
        })
      );
    }

    const { kategoriId, nama, deskripsi, isActive } = req.body;

    // Cek apakah data exists
    const existingJenis = await prisma.jenisPengumuman.findUnique({
      where: { id },
    });

    if (!existingJenis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data tidak ditemukan"));
    }

    // Prepare update data
    const updateData = {};

    if (kategoriId !== undefined) {
      if (!kategoriId || kategoriId.trim() === "") {
        return res.status(400).json(
          apiResponse(false, null, "Validasi gagal", {
            kategoriId: "Kategori pengumuman wajib dipilih",
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

      updateData.kategoriId = kategoriId;
    }

    const targetKategoriId = kategoriId || existingJenis.kategoriId;

    if (nama !== undefined) {
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

      // Cek duplikasi nama dalam kategori yang sama
      const duplicateNama = await prisma.jenisPengumuman.findFirst({
        where: {
          AND: [
            { kategoriId: targetKategoriId },
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

      updateData.nama = nama.trim();
    }

    if (deskripsi !== undefined) {
      updateData.deskripsi = deskripsi ? deskripsi.trim() : null;
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

    const updatedJenis = await prisma.jenisPengumuman.update({
      where: { id },
      data: updateData,
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

// DELETE - Hapus data jenis pengumuman berdasarkan ID
async function handleDelete(req, res, id) {
  try {
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