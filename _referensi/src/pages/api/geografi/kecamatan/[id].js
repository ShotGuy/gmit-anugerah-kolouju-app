import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const kecamatan = await prisma.kecamatan.findUnique({
      where: { id: id },
    });

    if (!kecamatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data kecamatan tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, kecamatan, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kecamatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data kecamatan",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKecamatan = await prisma.kecamatan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKecamatan, "Data kecamatan berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating kecamatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data kecamatan",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedKecamatan = await prisma.kecamatan.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedKecamatan, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting kecamatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data kecamatan",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});