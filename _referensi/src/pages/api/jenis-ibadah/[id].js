import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const jenisIbadah = await prisma.jenisIbadah.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            jadwalIbadahs: true,
          },
        },
      },
    });

    if (!jenisIbadah) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Jenis ibadah tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, jenisIbadah, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jenis ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data jenis ibadah",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const { namaIbadah } = req.body;

    if (!namaIbadah) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama ibadah wajib diisi"));
    }

    const updatedJenisIbadah = await prisma.jenisIbadah.update({
      where: { id: id },
      data: {
        namaIbadah,
      },
      include: {
        _count: {
          select: {
            jadwalIbadahs: true,
          },
        },
      },
    });

    // Check if name already exists (exclude current record)
    const existingJenisIbadah = await prisma.jenisIbadah.findFirst({
      where: {
        namaIbadah: {
          equals: namaIbadah,
          mode: "insensitive",
        },
        NOT: { id: id },
      },
    });

    if (existingJenisIbadah) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jenis ibadah sudah ada"));
    }

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          updatedJenisIbadah,
          "Jenis ibadah berhasil diperbarui"
        )
      );
  } catch (error) {
    console.error("Error updating jenis ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui jenis ibadah",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if jenis ibadah is being used
    const count = await prisma.jenisIbadah.findUnique({
      where: { id: id },
      select: {
        _count: {
          select: {
            jadwalIbadahs: true,
          },
        },
      },
    });

    if (count && count._count.jadwalIbadahs > 0) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Tidak dapat menghapus jenis ibadah yang masih digunakan"
          )
        );
    }

    const deletedJenisIbadah = await prisma.jenisIbadah.delete({
      where: { id: id },
      select: {
        id: true,
        namaIbadah: true,
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, deletedJenisIbadah, "Jenis ibadah berhasil dihapus")
      );
  } catch (error) {
    console.error("Error deleting jenis ibadah:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus jenis ibadah", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});
