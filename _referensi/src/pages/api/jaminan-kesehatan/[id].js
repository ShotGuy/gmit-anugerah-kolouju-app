import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const jaminanKesehatan = await prisma.jaminanKesehatan.findUnique({
      where: { id: id },
    });

    if (!jaminanKesehatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data jaminan kesehatan tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, jaminanKesehatan, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jaminan kesehatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jaminan kesehatan",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedJaminanKesehatan = await prisma.jaminanKesehatan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedJaminanKesehatan, "Data jaminan kesehatan berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating jaminan kesehatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data jaminan kesehatan",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedJaminanKesehatan = await prisma.jaminanKesehatan.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedJaminanKesehatan, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting jaminan kesehatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data jaminan kesehatan",
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