import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const jenisJabatan = await prisma.jenisJabatan.findUnique({
      where: { id: id },
    });

    if (!jenisJabatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jenis jabatan tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, jenisJabatan, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jenis jabatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jenis jabatan",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const { namaJabatan } = req.body;

    if (!namaJabatan) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama jenis jabatan wajib diisi"));
    }

    // Check if name already exists (exclude current record)
    const existingJenisJabatan = await prisma.jenisJabatan.findFirst({
      where: {
        namaJabatan: {
          equals: namaJabatan,
          mode: "insensitive",
        },
        NOT: { id: id },
      },
    });

    if (existingJenisJabatan) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jenis jabatan sudah ada"));
    }

    const updatedJenisJabatan = await prisma.jenisJabatan.update({
      where: { id: id },
      data: {
        namaJabatan,
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedJenisJabatan,
          "Jenis jabatan berhasil diperbarui"
        )
      );
  } catch (error) {
    console.error("Error updating jenis jabatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui jenis jabatan",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if jenis jabatan exists
    const jenisJabatan = await prisma.jenisJabatan.findUnique({
      where: { id: id },
    });

    if (!jenisJabatan) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jenis jabatan tidak ditemukan"));
    }

    const deletedJenisJabatan = await prisma.jenisJabatan.delete({
      where: { id: id },
      select: {
        id: true,
        namaJabatan: true,
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, deletedJenisJabatan, "Jenis jabatan berhasil dihapus")
      );
  } catch (error) {
    console.error("Error deleting jenis jabatan:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus jenis jabatan", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});