import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const alamat = await prisma.alamat.findUnique({
      where: { id: id },
      include: {
        kelurahan: {
          include: {
            kecamatan: {
              include: {
                kotaKab: {
                  include: {
                    provinsi: true
                  }
                }
              }
            }
          }
        },
        keluargas: true
      }
    });

    if (!alamat) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data alamat tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, alamat, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching alamat:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data alamat",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedAlamat = await prisma.alamat.update({
      where: { id: id },
      data,
      include: {
        kelurahan: {
          include: {
            kecamatan: {
              include: {
                kotaKab: {
                  include: {
                    provinsi: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedAlamat, "Data alamat berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating alamat:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data alamat",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if alamat is being used by any keluarga
    const usageCount = await prisma.keluarga.count({
      where: { idAlamat: id }
    });

    if (usageCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Alamat ini sedang digunakan oleh ${usageCount} keluarga`
          )
        );
    }

    const deletedAlamat = await prisma.alamat.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedAlamat, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting alamat:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data alamat",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});