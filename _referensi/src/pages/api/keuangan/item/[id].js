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
        id: "ID item keuangan wajib diisi",
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
    console.error("API Item Keuangan Detail Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res, id) {
  try {
    const item = await prisma.itemKeuangan.findUnique({
      where: { id },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        periode: {
          select: {
            id: true,
            nama: true,
            tahun: true
          }
        },
        parent: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        children: {
          select: {
            id: true,
            nama: true,
            kode: true,
            level: true
          },
          orderBy: {
            urutan: 'asc'
          }
        },
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!item) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Item keuangan tidak ditemukan"));
    }

    // Convert BigInt to string for JSON serialization
    const itemWithStrings = {
      ...item,
      targetFrekuensi: item.targetFrekuensi,
      satuanFrekuensi: item.satuanFrekuensi,
      nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : null,
      totalTarget: item.totalTarget ? item.totalTarget.toString() : null,
    };

    return res
      .status(200)
      .json(apiResponse(true, itemWithStrings, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching item keuangan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil data item keuangan", error.message));
  }
}

async function handlePatch(req, res, id) {
  try {
    const { 
      kode,
      nama, 
      deskripsi,
      targetFrekuensi,
      satuanFrekuensi,
      nominalSatuan,
      totalTarget,
      isActive 
    } = req.body;

    // Check if item exists
    const existingItem = await prisma.itemKeuangan.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Item keuangan tidak ditemukan"));
    }

    // Check if kode is being changed and is unique
    if (kode && kode !== existingItem.kode) {
      const duplicateKode = await prisma.itemKeuangan.findFirst({
        where: {
          kategoriId: existingItem.kategoriId,
          kode,
          id: { not: id } // Exclude current item
        }
      });

      if (duplicateKode) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Kode sudah digunakan dalam kategori ini"));
      }
    }

    const updateData = {};
    if (kode !== undefined) updateData.kode = kode;
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (targetFrekuensi !== undefined) updateData.targetFrekuensi = targetFrekuensi ? parseInt(targetFrekuensi) : null;
    if (satuanFrekuensi !== undefined) updateData.satuanFrekuensi = satuanFrekuensi;
    if (nominalSatuan !== undefined) updateData.nominalSatuan = nominalSatuan ? parseFloat(nominalSatuan) : null;
    if (totalTarget !== undefined) updateData.totalTarget = totalTarget ? parseFloat(totalTarget) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const item = await prisma.itemKeuangan.update({
      where: { id },
      data: updateData,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        parent: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        }
      }
    });

    // Convert BigInt to string for JSON serialization
    const itemWithStrings = {
      ...item,
      targetFrekuensi: item.targetFrekuensi,
      satuanFrekuensi: item.satuanFrekuensi,
      nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : null,
      totalTarget: item.totalTarget ? item.totalTarget.toString() : null,
    };

    return res
      .status(200)
      .json(apiResponse(true, itemWithStrings, "Item keuangan berhasil diperbarui"));
  } catch (error) {
    console.error("Error updating item keuangan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal memperbarui item keuangan", error.message));
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check if item exists
    const existingItem = await prisma.itemKeuangan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!existingItem) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Item keuangan tidak ditemukan"));
    }

    // Check if item has children
    if (existingItem._count.children > 0) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Item tidak dapat dihapus karena masih memiliki sub item"));
    }

    // Check if item has transactions
    const totalTransactions = existingItem._count.transaksiPenerimaan + existingItem._count.transaksiPengeluaran;
    if (totalTransactions > 0) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Item tidak dapat dihapus karena masih memiliki transaksi"));
    }

    await prisma.itemKeuangan.delete({
      where: { id }
    });

    return res
      .status(200)
      .json(apiResponse(true, null, "Item keuangan berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting item keuangan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus item keuangan", error.message));
  }
}