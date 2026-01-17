import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const statusKepemilikanRumah = await prisma.statusKepemilikanRumah.findUnique({
      where: { id: id },
    });

    if (!statusKepemilikanRumah) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data status kepemilikan rumah tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, statusKepemilikanRumah, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching status kepemilikan rumah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data status kepemilikan rumah",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedStatusKepemilikanRumah = await prisma.statusKepemilikanRumah.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedStatusKepemilikanRumah, "Data status kepemilikan rumah berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating status kepemilikan rumah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data status kepemilikan rumah",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedStatusKepemilikanRumah = await prisma.statusKepemilikanRumah.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedStatusKepemilikanRumah, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting status kepemilikan rumah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data status kepemilikan rumah",
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