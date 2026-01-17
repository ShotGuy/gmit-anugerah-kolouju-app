import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const keadaanRumah = await prisma.keadaanRumah.findUnique({
      where: { id: id },
    });

    if (!keadaanRumah) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data keadaan rumah tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, keadaanRumah, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching keadaan rumah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data keadaan rumah",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKeadaanRumah = await prisma.keadaanRumah.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKeadaanRumah, "Data keadaan rumah berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating keadaan rumah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data keadaan rumah",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedKeadaanRumah = await prisma.keadaanRumah.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedKeadaanRumah, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting keadaan rumah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data keadaan rumah",
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