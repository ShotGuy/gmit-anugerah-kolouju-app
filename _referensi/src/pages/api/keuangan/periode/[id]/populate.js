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
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  try {
    const { id } = req.query;
    const { overwrite = false } = req.body;

    // Verify periode exists
    const periode = await prisma.periodeAnggaran.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            anggaranItems: true
          }
        }
      }
    });

    if (!periode) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Periode anggaran tidak ditemukan"));
    }

    // Check if periode already has anggaran items
    if (periode._count.anggaranItems > 0 && !overwrite) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Periode anggaran sudah memiliki item. Gunakan parameter overwrite=true untuk menimpa."));
    }

    // If overwrite, delete existing anggaran items
    if (overwrite && periode._count.anggaranItems > 0) {
      await prisma.anggaranItem.deleteMany({
        where: { periodeId: id }
      });
    }

    // Get all active item keuangan
    const itemKeuanganList = await prisma.itemKeuangan.findMany({
      where: { 
        isActive: true 
      },
      orderBy: [
        { kategoriId: 'asc' },
        { level: 'asc' },
        { urutan: 'asc' },
        { kode: 'asc' }
      ]
    });

    if (itemKeuanganList.length === 0) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Tidak ada item keuangan aktif untuk di-populate"));
    }

    // Prepare anggaran items data
    const anggaranItemsData = itemKeuanganList.map(item => ({
      periodeId: id,
      itemKeuanganId: item.id,
      targetFrekuensi: item.targetFrekuensi || null,
      satuanFrekuensi: item.satuanFrekuensi || null,
      nominalSatuan: item.nominalSatuan || null,
      totalAnggaran: item.totalTarget || 0, // Default ke 0 jika tidak ada target
      keterangan: `Template dari item: ${item.nama}`
    }));

    // Create anggaran items in batch
    const createdItems = await prisma.anggaranItem.createMany({
      data: anggaranItemsData
    });

    // Get created items with relations for response
    const populatedPeriode = await prisma.periodeAnggaran.findUnique({
      where: { id },
      include: {
        anggaranItems: {
          include: {
            itemKeuangan: {
              select: {
                id: true,
                kode: true,
                nama: true,
                level: true,
                kategori: {
                  select: {
                    nama: true,
                    kode: true
                  }
                }
              }
            }
          },
          orderBy: [
            { itemKeuangan: { kategoriId: 'asc' } },
            { itemKeuangan: { level: 'asc' } },
            { itemKeuangan: { urutan: 'asc' } }
          ]
        },
        _count: {
          select: {
            anggaranItems: true
          }
        }
      }
    });

    // Convert BigInt to string for JSON serialization
    const response = {
      ...populatedPeriode,
      anggaranItems: populatedPeriode.anggaranItems.map(item => ({
        ...item,
        nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : null,
        totalAnggaran: item.totalAnggaran ? item.totalAnggaran.toString() : null,
        itemKeuangan: {
          ...item.itemKeuangan
        }
      }))
    };

    return res
      .status(201)
      .json(apiResponse(
        true, 
        response, 
        `Berhasil populate ${createdItems.count} item anggaran ke periode ${periode.nama}`
      ));

  } catch (error) {
    console.error("Error populating periode anggaran:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal populate anggaran dari template", error.message));
  }
}