import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const statusKeluarga = await prisma.statusKeluarga.findUnique({
      where: { id: id },
    });

    if (!statusKeluarga) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data status keluarga tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, statusKeluarga, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching status keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data status keluarga",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedStatusKeluarga = await prisma.statusKeluarga.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedStatusKeluarga, "Data status keluarga berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating status keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data status keluarga",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedStatusKeluarga = await prisma.statusKeluarga.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedStatusKeluarga, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting status keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data status keluarga",
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