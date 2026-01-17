import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const pendapatan = await prisma.pendapatan.findUnique({
      where: { id: id },
    });

    if (!pendapatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data pendapatan tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, pendapatan, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching pendapatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data pendapatan",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedPendapatan = await prisma.pendapatan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedPendapatan, "Data pendapatan berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating pendapatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data pendapatan",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedPendapatan = await prisma.pendapatan.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedPendapatan, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting pendapatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data pendapatan",
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