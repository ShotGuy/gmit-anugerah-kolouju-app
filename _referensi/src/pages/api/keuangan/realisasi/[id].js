// api/keuangan/realisasi/[id].js
import prisma from "@/lib/prisma";

const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, id);
      case "PUT":
        return await handlePut(req, res, id);
      case "DELETE":
        return await handleDelete(req, res, id);
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Realisasi [id] Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res, id) {
  try {
    const realisasi = await prisma.realisasiItemKeuangan.findUnique({
      where: { id },
      include: {
        itemKeuangan: {
          select: {
            id: true,
            kode: true,
            nama: true,
            level: true,
            targetFrekuensi: true,
            satuanFrekuensi: true,
            nominalSatuan: true,
            totalTarget: true,
            kategori: {
              select: {
                id: true,
                nama: true,
                kode: true,
              },
            },
          },
        },
        periode: {
          select: {
            id: true,
            nama: true,
            tahun: true,
          },
        },
      },
    });

    if (!realisasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Realisasi tidak ditemukan"));
    }

    // Convert BigInt/Decimal fields to string
    const responseData = {
      ...realisasi,
      totalRealisasi: realisasi.totalRealisasi.toString(),
      itemKeuangan: {
        ...realisasi.itemKeuangan,
        nominalSatuan: realisasi.itemKeuangan.nominalSatuan
          ? realisasi.itemKeuangan.nominalSatuan.toString()
          : null,
        totalTarget: realisasi.itemKeuangan.totalTarget
          ? realisasi.itemKeuangan.totalTarget.toString()
          : null,
      },
    };

    return res
      .status(200)
      .json(apiResponse(true, responseData, "Data realisasi berhasil diambil"));
  } catch (error) {
    console.error("Error fetching realisasi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data realisasi", error.message)
      );
  }
}

async function handlePut(req, res, id) {
  try {
    const {
      itemKeuanganId,
      periodeId,
      tanggalRealisasi,
      totalRealisasi,
      keterangan,
    } = req.body;

    // Validation
    if (!itemKeuanganId || !periodeId || !tanggalRealisasi || !totalRealisasi) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          itemKeuanganId: !itemKeuanganId ? "Item keuangan wajib dipilih" : undefined,
          periodeId: !periodeId ? "Periode wajib dipilih" : undefined,
          tanggalRealisasi: !tanggalRealisasi ? "Tanggal realisasi wajib diisi" : undefined,
          totalRealisasi: !totalRealisasi ? "Total realisasi wajib diisi" : undefined,
        })
      );
    }

    // Check if realisasi exists
    const existingRealisasi = await prisma.realisasiItemKeuangan.findUnique({
      where: { id },
    });

    if (!existingRealisasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Realisasi tidak ditemukan"));
    }

    // Verify item keuangan exists
    const itemKeuangan = await prisma.itemKeuangan.findUnique({
      where: { id: itemKeuanganId },
      include: {
        kategori: {
          select: { nama: true, kode: true },
        },
        periode: {
          select: { id: true, nama: true },
        },
      },
    });

    if (!itemKeuangan) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Item keuangan tidak ditemukan"));
    }

    // Verify periode matches
    if (itemKeuangan.periodeId !== periodeId) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Periode tidak sesuai dengan item keuangan"));
    }

    // Update realisasi data
    const updateData = {
      itemKeuanganId,
      periodeId,
      tanggalRealisasi: new Date(tanggalRealisasi),
      totalRealisasi: parseFloat(totalRealisasi),
      keterangan: keterangan || null,
    };

    const realisasi = await prisma.realisasiItemKeuangan.update({
      where: { id },
      data: updateData,
      include: {
        itemKeuangan: {
          select: {
            id: true,
            kode: true,
            nama: true,
            level: true,
            targetFrekuensi: true,
            satuanFrekuensi: true,
            nominalSatuan: true,
            totalTarget: true,
            kategori: {
              select: {
                id: true,
                nama: true,
                kode: true,
              },
            },
          },
        },
        periode: {
          select: {
            id: true,
            nama: true,
            tahun: true,
          },
        },
      },
    });

    // Convert BigInt/Decimal fields to string
    const responseData = {
      ...realisasi,
      totalRealisasi: realisasi.totalRealisasi.toString(),
      itemKeuangan: {
        ...realisasi.itemKeuangan,
        nominalSatuan: realisasi.itemKeuangan.nominalSatuan
          ? realisasi.itemKeuangan.nominalSatuan.toString()
          : null,
        totalTarget: realisasi.itemKeuangan.totalTarget
          ? realisasi.itemKeuangan.totalTarget.toString()
          : null,
      },
    };

    return res
      .status(200)
      .json(apiResponse(true, responseData, "Realisasi berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating realisasi:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Terjadi duplikat data"));
    }

    if (error.code === "P2003") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Item keuangan tidak valid"));
    }

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui realisasi", error.message)
      );
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check if realisasi exists
    const existingRealisasi = await prisma.realisasiItemKeuangan.findUnique({
      where: { id },
      include: {
        itemKeuangan: {
          select: {
            kode: true,
            nama: true,
          },
        },
      },
    });

    if (!existingRealisasi) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Realisasi tidak ditemukan"));
    }

    // Delete the realisasi
    await prisma.realisasiItemKeuangan.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(
        apiResponse(
          true,
          { id, itemKeuangan: existingRealisasi.itemKeuangan },
          "Realisasi berhasil dihapus"
        )
      );
  } catch (error) {
    console.error("Error deleting realisasi:", error);
    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus realisasi", error.message)
      );
  }
}