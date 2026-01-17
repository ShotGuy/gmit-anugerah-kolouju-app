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
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json(
      apiResponse(false, null, "Validasi gagal", {
        id: "ID periode anggaran wajib diisi",
      })
    );
  }

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, id);
      case "PATCH":
        return await handlePatch(req, res, id);
      case "DELETE":
        return await handleDelete(req, res, id);
      default:
        res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Periode Anggaran Detail Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res, id) {
  try {
    const periode = await prisma.periodeAnggaran.findUnique({
      where: { id },
      include: {
        anggaranItems: {
          include: {
            itemKeuangan: {
              include: {
                kategori: true
              }
            }
          },
          orderBy: {
            itemKeuangan: {
              kode: 'asc'
            }
          }
        },
        _count: {
          select: {
            anggaranItems: true,
            transaksiPenerimaan: true,
            transaksiPengeluaran: true
          }
        }
      }
    });

    if (!periode) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Periode anggaran tidak ditemukan"));
    }

    // Convert BigInt to string for JSON serialization
    const periodeWithStrings = {
      ...periode,
      anggaranItems: periode.anggaranItems.map(item => ({
        ...item,
        nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : null,
        totalAnggaran: item.totalAnggaran ? item.totalAnggaran.toString() : null,
      }))
    };

    return res
      .status(200)
      .json(apiResponse(true, periodeWithStrings, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching periode anggaran:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil data periode anggaran", error.message));
  }
}

async function handlePatch(req, res, id) {
  try {
    const { 
      nama, 
      tahun, 
      tanggalMulai, 
      tanggalAkhir, 
      keterangan,
      status,
      isActive 
    } = req.body;

    // Check if periode exists
    const existingPeriode = await prisma.periodeAnggaran.findUnique({
      where: { id }
    });

    if (!existingPeriode) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Periode anggaran tidak ditemukan"));
    }

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (tahun !== undefined) updateData.tahun = parseInt(tahun);
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle date updates
    let startDate = existingPeriode.tanggalMulai;
    let endDate = existingPeriode.tanggalAkhir;

    if (tanggalMulai !== undefined) {
      startDate = new Date(tanggalMulai);
      updateData.tanggalMulai = startDate;
    }

    if (tanggalAkhir !== undefined) {
      endDate = new Date(tanggalAkhir);
      updateData.tanggalAkhir = endDate;
    }

    // Validate dates if either is being updated
    if (tanggalMulai !== undefined || tanggalAkhir !== undefined) {
      if (startDate >= endDate) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Validasi gagal", {
            tanggalAkhir: "Tanggal akhir harus setelah tanggal mulai"
          }));
      }

      // Check for overlapping periods (exclude current)
      const overlapping = await prisma.periodeAnggaran.findFirst({
        where: {
          id: { not: id },
          OR: [
            {
              AND: [
                { tanggalMulai: { lte: startDate } },
                { tanggalAkhir: { gte: startDate } }
              ]
            },
            {
              AND: [
                { tanggalMulai: { lte: endDate } },
                { tanggalAkhir: { gte: endDate } }
              ]
            },
            {
              AND: [
                { tanggalMulai: { gte: startDate } },
                { tanggalAkhir: { lte: endDate } }
              ]
            }
          ]
        }
      });

      if (overlapping) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Periode anggaran tidak boleh tumpang tindih dengan periode lain"));
      }
    }

    const periode = await prisma.periodeAnggaran.update({
      where: { id },
      data: updateData
    });

    return res
      .status(200)
      .json(apiResponse(true, periode, "Periode anggaran berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating periode anggaran:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal memperbarui periode anggaran", error.message));
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check if periode exists
    const existingPeriode = await prisma.periodeAnggaran.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            anggaranItems: true,
            transaksiPenerimaan: true,
            transaksiPengeluaran: true
          }
        }
      }
    });

    if (!existingPeriode) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Periode anggaran tidak ditemukan"));
    }

    // Check if periode has related data
    const totalRelated = existingPeriode._count.anggaranItems + 
                        existingPeriode._count.transaksiPenerimaan + 
                        existingPeriode._count.transaksiPengeluaran;

    if (totalRelated > 0) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Periode tidak dapat dihapus karena memiliki data anggaran atau transaksi"));
    }

    await prisma.periodeAnggaran.delete({
      where: { id }
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Periode anggaran berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting periode anggaran:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus periode anggaran", error.message));
  }
}