import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const statusDalamKeluarga = await prisma.statusDalamKeluarga.findUnique({
      where: { id: id },
    });

    if (!statusDalamKeluarga) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data status dalam keluarga tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, statusDalamKeluarga, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching status dalam keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data status dalam keluarga",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedStatusDalamKeluarga = await prisma.statusDalamKeluarga.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedStatusDalamKeluarga, "Data status dalam keluarga berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating status dalam keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data status dalam keluarga",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedStatusDalamKeluarga = await prisma.statusDalamKeluarga.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedStatusDalamKeluarga, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting status dalam keluarga:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data status dalam keluarga",
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