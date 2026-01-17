import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const keluarga = await prisma.keluarga.findUnique({
      where: { id: id },
      include: {
        alamat: {
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
        },
        statusKeluarga: true,
        statusKepemilikanRumah: true,
        keadaanRumah: true,
        rayon: true,
        jemaats: {
          include: {
            statusDalamKeluarga: true,
            suku: true,
            pendidikan: true,
            pekerjaan: true,
            pendapatan: true,
            jaminanKesehatan: true,
            pernikahan: {
              include: {
                klasis: true
              }
            },
            baptiss: {
              include: {
                klasis: true
              }
            },
            sidis: {
              include: {
                klasis: true
              }
            },
            User: {
              select: {
                id: true,
                username: true,
                email: true,
                noWhatsapp: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!keluarga) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data keluarga tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, keluarga, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data keluarga",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKeluarga = await prisma.keluarga.update({
      where: { id: id },
      data,
      include: {
        alamat: {
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
        },
        statusKeluarga: true,
        statusKepemilikanRumah: true,
        keadaanRumah: true,
        rayon: true
      }
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKeluarga, "Data keluarga berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data keluarga",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if keluarga has any jemaats
    const jemaatCount = await prisma.jemaat.count({
      where: { idKeluarga: id }
    });

    if (jemaatCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            `Keluarga ini memiliki ${jemaatCount} anggota jemaat`
          )
        );
    }

    const deletedKeluarga = await prisma.keluarga.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedKeluarga, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data keluarga",
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