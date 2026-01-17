import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const kelurahan = await prisma.kelurahan.findUnique({
      where: { id: id },
    });

    if (!kelurahan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data kelurahan/desa tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, kelurahan, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching kelurahan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data kelurahan/desa",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKelurahan = await prisma.kelurahan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKelurahan, "Data kelurahan/desa berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating kelurahan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data kelurahan/desa",
          error.message
        )
      );
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const data = req.body;

    const updatedKelurahan = await prisma.kelurahan.update({
      where: { id: id },
      data,
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKelurahan, "Data kelurahan/desa berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating kelurahan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data kelurahan/desa",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedKelurahan = await prisma.kelurahan.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedKelurahan, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting kelurahan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data kelurahan/desa",
          error.message
        )
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  PUT: handlePut,
  DELETE: handleDelete,
});