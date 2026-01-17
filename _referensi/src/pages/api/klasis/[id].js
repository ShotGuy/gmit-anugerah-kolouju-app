import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const klasis = await prisma.klasis.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            pernikahans: true,
            baptiss: true,
            sidis: true,
          },
        },
      },
    });

    if (!klasis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Klasis tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, klasis, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching klasis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data klasis",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const { nama } = req.body;

    if (!nama) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama klasis wajib diisi"));
    }

    // Check if name already exists (exclude current record)
    const existingKlasis = await prisma.klasis.findFirst({
      where: { 
        nama: {
          equals: nama,
          mode: 'insensitive'
        },
        NOT: { id: id }
      },
    });

    if (existingKlasis) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Klasis sudah ada"));
    }

    const updatedKlasis = await prisma.klasis.update({
      where: { id: id },
      data: {
        nama,
      },
      include: {
        _count: {
          select: {
            pernikahans: true,
            baptiss: true,
            sidis: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedKlasis, "Klasis berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating klasis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui klasis",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if klasis is being used
    const count = await prisma.klasis.findUnique({
      where: { id: id },
      select: {
        _count: {
          select: {
            pernikahans: true,
            baptiss: true,
            sidis: true,
          },
        },
      },
    });

    const totalUsage = count?._count.pernikahans + count?._count.baptiss + count?._count.sidis;

    if (totalUsage > 0) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Tidak dapat menghapus klasis yang masih digunakan"
          )
        );
    }

    const deletedKlasis = await prisma.klasis.delete({
      where: { id: id },
      select: {
        id: true,
        nama: true,
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedKlasis, "Klasis berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting klasis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus klasis",
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