import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const baptis = await prisma.baptis.findUnique({
      where: { id: id },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            keluarga: {
              select: {
                noBagungan: true,
                rayon: {
                  select: {
                    namaRayon: true,
                  },
                },
              },
            },
          },
        },
        klasis: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    if (!baptis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data baptis tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, baptis, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching baptis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data baptis",
          error.message
        )
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const { idJemaat, idKlasis, tanggal } = req.body;

    if (!idJemaat || !idKlasis || !tanggal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Semua field wajib diisi"));
    }

    // Validate jemaat exists
    const jemaat = await prisma.jemaat.findUnique({
      where: { id: idJemaat },
    });

    if (!jemaat) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
    }

    // Validate klasis exists
    const klasis = await prisma.klasis.findUnique({
      where: { id: idKlasis },
    });

    if (!klasis) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data klasis tidak ditemukan"));
    }

    // Check if another jemaat already has baptis record with same jemaat id (exclude current record)
    const existingBaptis = await prisma.baptis.findFirst({
      where: { 
        idJemaat,
        NOT: { id: id }
      },
    });

    if (existingBaptis) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jemaat ini sudah memiliki data baptis"));
    }

    const updatedBaptis = await prisma.baptis.update({
      where: { id: id },
      data: {
        idJemaat,
        idKlasis,
        tanggal: new Date(tanggal),
      },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            keluarga: {
              select: {
                noBagungan: true,
                rayon: {
                  select: {
                    namaRayon: true,
                  },
                },
              },
            },
          },
        },
        klasis: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(
        apiResponse(true, updatedBaptis, "Data baptis berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating baptis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data baptis",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedBaptis = await prisma.baptis.delete({
      where: { id: id },
      select: {
        id: true,
        tanggal: true,
        jemaat: {
          select: {
            nama: true,
          },
        },
        klasis: {
          select: {
            nama: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedBaptis, "Data baptis berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting baptis:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data baptis",
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