import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const pekerjaan = await prisma.pekerjaan.findUnique({
      where: { id: id },
    });

    if (!pekerjaan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data pekerjaan tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, pekerjaan, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching pekerjaan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data pekerjaan",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedPekerjaan = await prisma.pekerjaan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedPekerjaan, "Data pekerjaan berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating pekerjaan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data pekerjaan",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedPekerjaan = await prisma.pekerjaan.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedPekerjaan, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting pekerjaan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data pekerjaan",
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