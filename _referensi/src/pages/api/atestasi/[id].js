import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const atestasi = await prisma.atestasi.findUnique({
      where: { id },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            status: true,
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

    if (!atestasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data atestasi tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, atestasi, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching atestasi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data atestasi", error.message)
      );
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const {
      tipe,
      tanggal,
      idJemaat,
      idKlasis,
      gerejaAsal,
      gerejaTujuan,
      alasan,
      keterangan,
      namaCalonJemaat,
    } = req.body;

    // Check if atestasi exists
    const existingAtestasi = await prisma.atestasi.findUnique({
      where: { id },
    });

    if (!existingAtestasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data atestasi tidak ditemukan"));
    }

    // Validasi required fields
    if (!tipe || !tanggal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Tipe dan tanggal wajib diisi"));
    }

    // Validasi jemaat jika ada idJemaat
    if (idJemaat) {
      const jemaat = await prisma.jemaat.findUnique({
        where: { id: idJemaat },
      });

      if (!jemaat) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
      }
    }

    const updatedAtestasi = await prisma.atestasi.update({
      where: { id },
      data: {
        tipe,
        tanggal: new Date(tanggal),
        idJemaat: idJemaat || null,
        idKlasis: idKlasis || null,
        gerejaAsal,
        gerejaTujuan,
        alasan,
        keterangan,
        namaCalonJemaat,
      },
      include: {
        jemaat: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            status: true,
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
      .json(apiResponse(true, updatedAtestasi, "Data atestasi berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating atestasi:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal memperbarui data atestasi", error.message));
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if atestasi exists
    const existingAtestasi = await prisma.atestasi.findUnique({
      where: { id },
      include: {
        jemaat: true,
      },
    });

    if (!existingAtestasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data atestasi tidak ditemukan"));
    }

    // If it's a KELUAR type and has jemaat, revert jemaat status back to AKTIF
    if (existingAtestasi.tipe === "KELUAR" && existingAtestasi.jemaat) {
      await prisma.jemaat.update({
        where: { id: existingAtestasi.idJemaat },
        data: { status: "AKTIF" },
      });
    }

    await prisma.atestasi.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Data atestasi berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting atestasi:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus data atestasi", error.message));
  }
}

export default createApiHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});