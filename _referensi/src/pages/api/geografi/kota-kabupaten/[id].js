import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const kotaKab = await prisma.kotaKab.findUnique({
      where: { id: id },
    });

    if (!kotaKab) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data kota/kabupaten tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, kotaKab, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kota/kabupaten:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data kota/kabupaten",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKotaKab = await prisma.kotaKab.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKotaKab, "Data kota/kabupaten berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating kota/kabupaten:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data kota/kabupaten",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedKotaKab = await prisma.kotaKab.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedKotaKab, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting kota/kabupaten:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data kota/kabupaten",
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