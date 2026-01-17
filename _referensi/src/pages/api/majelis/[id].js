import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const majelis = await prisma.majelis.findUnique({
      where: { id: id },
      include: {
        jenisJabatan: {
          select: {
            id: true,
            namaJabatan: true,
          },
        },
        rayon: {
          select: {
            id: true,
            namaRayon: true,
          },
        },
        User: {
          select: {
            id: true,
            username: true,
            email: true,
            noWhatsapp: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!majelis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Majelis tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, majelis, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching majelis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data majelis",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const {
      mulai,
      selesai,
      idRayon,
      jenisJabatanId,
      isUtama,
      canView,
      canEdit,
      canCreate,
      canDelete,
      canManageRayon,
    } = req.body;

    if (!mulai || !jenisJabatanId) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Tanggal mulai dan jenis jabatan wajib diisi"
          )
        );
    }

    // Jika isUtama = true, pastikan hanya 1 majelis utama per rayon
    if (isUtama === true && idRayon) {
      const existingUtama = await prisma.majelis.findFirst({
        where: {
          idRayon: idRayon,
          isUtama: true,
          id: { not: id }, // Exclude current majelis
        },
      });

      if (existingUtama) {
        return res
          .status(400)
          .json(
            apiResponse(
              false,
              null,
              "Sudah ada Majelis Utama di rayon ini. Hanya boleh ada 1 Majelis Utama per rayon."
            )
          );
      }
    }

    const updateData = {
      mulai: new Date(mulai),
      selesai: selesai ? new Date(selesai) : null,
      idRayon: idRayon || null,
      jenisJabatanId: jenisJabatanId || null,
    };

    // Tambahkan permission fields jika ada
    if (typeof isUtama === "boolean") updateData.isUtama = isUtama;
    if (typeof canView === "boolean") updateData.canView = canView;
    if (typeof canEdit === "boolean") updateData.canEdit = canEdit;
    if (typeof canCreate === "boolean") updateData.canCreate = canCreate;
    if (typeof canDelete === "boolean") updateData.canDelete = canDelete;
    if (typeof canManageRayon === "boolean")
      updateData.canManageRayon = canManageRayon;

    const updatedMajelis = await prisma.majelis.update({
      where: { id: id },
      data: updateData,
      include: {
        jenisJabatan: {
          select: {
            namaJabatan: true,
          },
        },
        rayon: {
          select: {
            namaRayon: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, updatedMajelis, "Majelis berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating majelis:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui majelis", error.message)
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Start transaction to delete both majelis and associated user
    const result = await prisma.$transaction(async (tx) => {
      // First, delete the associated user account
      const userToDelete = await tx.user.findUnique({
        where: { idMajelis: id },
      });

      if (userToDelete) {
        await tx.user.delete({
          where: { id: userToDelete.id },
        });
      }

      // Then delete the majelis
      const deletedMajelis = await tx.majelis.delete({
        where: { id: id },
        select: {
          id: true,
          // namaLengkap: true, // Removed
        },
      });

      return {
        majelis: deletedMajelis,
        userDeleted: !!userToDelete,
      };
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          result,
          result.userDeleted
            ? "Majelis dan akun pengguna berhasil dihapus"
            : "Majelis berhasil dihapus"
        )
      );
  } catch (error) {
    console.error("Error deleting majelis:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus majelis", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});