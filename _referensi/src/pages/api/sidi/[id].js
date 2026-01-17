import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const sidi = await prisma.sidi.findUnique({
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

    if (!sidi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data sidi tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, sidi, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching sidi:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data sidi",
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

    // Check if another jemaat already has sidi record with same jemaat id (exclude current record)
    const existingSidi = await prisma.sidi.findFirst({
      where: { 
        idJemaat,
        NOT: { id: id }
      },
    });

    if (existingSidi) {
      return res
        .status(409)
        .json(apiResponse(false, null, "Jemaat ini sudah memiliki data sidi"));
    }

    const updatedSidi = await prisma.sidi.update({
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
        apiResponse(true, updatedSidi, "Data sidi berhasil diperbarui")
      );
  } catch (error) {
    console.error("Error updating sidi:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal memperbarui data sidi",
          error.message
        )
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const deletedSidi = await prisma.sidi.delete({
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
      .json(apiResponse(true, deletedSidi, "Data sidi berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting sidi:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal menghapus data sidi",
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