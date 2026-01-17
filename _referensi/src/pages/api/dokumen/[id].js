import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";
import { staffOnly } from "@/lib/apiMiddleware";
import { requireAuth } from "@/lib/auth";

async function handleGet(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;

    const dokumen = await prisma.dokumenJemaat.findUnique({
      where: { id },
      include: {
        jemaat: {
          include: {
            keluarga: {
              include: {
                rayon: true
              }
            }
          }
        }
      }
    });

    if (!dokumen) {
      return res.status(404).json(
        apiResponse(false, null, "Dokumen tidak ditemukan")
      );
    }

    // Check access permission for MAJELIS users
    if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      if (dokumen.jemaat.keluarga.idRayon !== user.majelis.idRayon) {
        return res.status(403).json(
          apiResponse(false, null, "Anda tidak memiliki akses ke dokumen ini")
        );
      }
    }

    return res
      .status(200)
      .json(apiResponse(true, dokumen, "Data dokumen berhasil diambil"));
  } catch (error) {
    console.error("Error fetching dokumen:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data dokumen",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;
    const data = req.body;

    const existingDokumen = await prisma.dokumenJemaat.findUnique({
      where: { id },
      include: {
        jemaat: {
          include: {
            keluarga: {
              select: { idRayon: true }
            }
          }
        }
      }
    });

    if (!existingDokumen) {
      return res.status(404).json(
        apiResponse(false, null, "Dokumen tidak ditemukan")
      );
    }

    // Check access permission for MAJELIS users
    if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      if (existingDokumen.jemaat.keluarga.idRayon !== user.majelis.idRayon) {
        return res.status(403).json(
          apiResponse(false, null, "Anda tidak memiliki akses untuk mengubah dokumen ini")
        );
      }
    }

    const updatedDokumen = await prisma.dokumenJemaat.update({
      where: { id },
      data,
      include: {
        jemaat: {
          include: {
            keluarga: {
              include: {
                rayon: true
              }
            }
          }
        }
      }
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedDokumen, "Dokumen berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating dokumen:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui dokumen",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const authResult = await requireAuth(req, res);

    if (authResult.error) {
      return res
        .status(authResult.status)
        .json(apiResponse(false, null, authResult.error));
    }

    const { user } = authResult;
    const { id } = req.query;

    const existingDokumen = await prisma.dokumenJemaat.findUnique({
      where: { id },
      include: {
        jemaat: {
          include: {
            keluarga: {
              select: { idRayon: true }
            }
          }
        }
      }
    });

    if (!existingDokumen) {
      return res.status(404).json(
        apiResponse(false, null, "Dokumen tidak ditemukan")
      );
    }

    // Check access permission for MAJELIS users
    if (user.role === 'MAJELIS' && user.majelis && user.majelis.idRayon) {
      if (existingDokumen.jemaat.keluarga.idRayon !== user.majelis.idRayon) {
        return res.status(403).json(
          apiResponse(false, null, "Anda tidak memiliki akses untuk menghapus dokumen ini")
        );
      }
    }

    await prisma.dokumenJemaat.delete({
      where: { id }
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Dokumen berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting dokumen:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus dokumen",
          error.message
        )
      );
  }
}

export default staffOnly(createApiHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
}));