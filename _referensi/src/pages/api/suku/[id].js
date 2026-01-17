import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const suku = await prisma.suku.findUnique({
      where: { id: id },
    });

    if (!suku) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data suku tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, suku, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching suku:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data suku",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedSuku = await prisma.suku.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedSuku, "Data suku berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating suku:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data suku",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedSuku = await prisma.suku.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedSuku, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting suku:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data suku",
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