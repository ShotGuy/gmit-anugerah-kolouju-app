import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const rayon = await prisma.rayon.findUnique({
      where: { id },
      include: {
        keluargas: {
          include: {
            alamat: {
              include: {
                kelurahan: {
                  include: {
                    kecamatan: {
                      include: {
                        kotaKab: {
                          include: {
                            provinsi: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            statusKeluarga: true,
            jemaats: {
              include: {
                statusDalamKeluarga: true,
              },
            },
          },
        },
        _count: {
          select: {
            keluargas: true,
          },
        },
      },
    });

    if (!rayon) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data rayon tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, rayon, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching rayon:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data rayon", error.message)
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const { namaRayon } = req.body;

    // Validate required fields
    if (!namaRayon) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama rayon wajib diisi"));
    }

    // Check if rayon exists
    const existingRayon = await prisma.rayon.findUnique({
      where: { id },
    });

    if (!existingRayon) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data rayon tidak ditemukan"));
    }

    // Check if new name already exists (excluding current record)
    const duplicateRayon = await prisma.rayon.findFirst({
      where: {
        namaRayon: {
          equals: namaRayon,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (duplicateRayon) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Nama rayon sudah ada"));
    }

    const updatedRayon = await prisma.rayon.update({
      where: { id },
      data: {
        namaRayon,
      },
      include: {
        _count: {
          select: {
            keluargas: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedRayon, "Data rayon berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating rayon:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui data rayon", error.message)
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if rayon exists
    const existingRayon = await prisma.rayon.findUnique({
      where: { id },
    });

    if (!existingRayon) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data rayon tidak ditemukan"));
    }

    // Check if rayon is being used by any keluarga
    const keluargaCount = await prisma.keluarga.count({
      where: { idRayon: id },
    });

    if (keluargaCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Rayon ini sedang digunakan oleh ${keluargaCount} keluarga`
          )
        );
    }

    const deletedRayon = await prisma.rayon.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedRayon, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting rayon:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus data rayon", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});
