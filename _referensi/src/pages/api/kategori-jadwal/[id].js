import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { parseQueryParams } from "@/lib/queryParams";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const kategoriJadwal = await prisma.kategoriJadwal.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            jadwalIbadahs: true,
          },
        },
        // Include any related models here
      },
    });

    if (!kategoriJadwal) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Kategori Jadwal tidak ditemukan"));
    }

    if (!kategoriJadwal) {
      return apiResponse(res, 404, "Kategori Jadwal not found");
    }

    return apiResponse(
      res,
      200,
      "Kategori Jadwal retrieved successfully",
      kategoriJadwal
    );
  } catch (error) {
    return apiResponse(res, 500, "Internal Server Error");
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedKategoriJadwal = await prisma.kategoriJadwal.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          deletedKategoriJadwal,
          "Kategori Jadwal berhasil dihapus"
        )
      );
  } catch (error) {
    console.error("Error deleting kategori jadwal:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus kategori jadwal",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const { isActive, namaKategori, deskripsi } = req.body;

    const updatedKategoriJadwal = await prisma.kategoriJadwal.update({
      where: { id: id },
      data: { isActive: isActive, namaKategori, deskripsi },
    });

    if (!namaKategori || namaKategori.trim() === "") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama ibadah wajib diisi"));
    }

    // Check if name already exists (exclude current record)

    const existingKategoriJadwal = await prisma.kategoriJadwal.findUnique({
      where: {
        namaKategori: {
          equals: namaKategori,
          mode: "insensitive",
        },
        NOT: { id: id },
      },
    });

    if (existingKategoriJadwal) {
      return res
        .status(409)
        .json(apiResponse(false, null, "kategori jadwal sudah ada"));
    }
    return apiResponse(
      res,
      200,
      "Kategori Jadwal updated successfully",
      updatedKategoriJadwal
    );
  } catch (error) {}
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,

  // POST: handlePost,
  // PUT: handlePut,
  DELETE: handleDelete,
});
