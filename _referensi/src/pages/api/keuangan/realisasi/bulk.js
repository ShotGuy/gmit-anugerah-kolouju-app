// api/keuangan/realisasi/bulk.js
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

  try {
    switch (method) {
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["POST"]);
        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Realisasi Bulk Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handlePost(req, res) {
  try {
    const { realisasiList } = req.body;

    // Validation
    if (!realisasiList || !Array.isArray(realisasiList) || realisasiList.length === 0) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          realisasiList: "List realisasi wajib berisi array dengan minimal 1 item",
        })
      );
    }

    // Validate each item in the list
    const validationErrors = [];
    const validatedItems = [];

    for (let i = 0; i < realisasiList.length; i++) {
      const item = realisasiList[i];
      const errors = {};

      if (!item.itemKeuanganId) errors.itemKeuanganId = "Item keuangan wajib dipilih";
      if (!item.tahun) errors.tahun = "Tahun wajib diisi";
      if (!item.bulan) errors.bulan = "Bulan wajib diisi";
      if (!item.periode) errors.periode = "Periode wajib diisi";
      if (item.frekuensiActual === undefined) errors.frekuensiActual = "Frekuensi actual wajib diisi";
      if (!item.totalRealisasi) errors.totalRealisasi = "Total realisasi wajib diisi";
      if (!item.tanggalMulai) errors.tanggalMulai = "Tanggal mulai wajib diisi";
      if (!item.tanggalSelesai) errors.tanggalSelesai = "Tanggal selesai wajib diisi";

      if (Object.keys(errors).length > 0) {
        validationErrors.push({
          index: i,
          errors,
        });
      } else {
        validatedItems.push({
          ...item,
          index: i,
        });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal pada beberapa item", validationErrors)
      );
    }

    // Check for existing realisasi and duplicate periods in the request
    const checkPromises = validatedItems.map(async (item) => {
      // Check existing in database
      const existing = await prisma.realisasiItemKeuangan.findFirst({
        where: {
          itemKeuanganId: item.itemKeuanganId,
          tahun: parseInt(item.tahun),
          bulan: parseInt(item.bulan),
          minggu: item.minggu ? parseInt(item.minggu) : null,
        },
      });

      return {
        ...item,
        hasExisting: !!existing,
        existingId: existing?.id,
      };
    });

    const checkedItems = await Promise.all(checkPromises);

    // Check for duplicates within the request
    const duplicateErrors = [];
    const seenPeriods = new Set();

    checkedItems.forEach((item, index) => {
      const periodKey = `${item.itemKeuanganId}-${item.tahun}-${item.bulan}-${item.minggu || 'null'}`;

      if (seenPeriods.has(periodKey)) {
        duplicateErrors.push({
          index: item.index,
          error: "Duplikat periode dalam request yang sama",
        });
      } else {
        seenPeriods.add(periodKey);
      }

      if (item.hasExisting) {
        duplicateErrors.push({
          index: item.index,
          error: "Realisasi untuk periode ini sudah ada di database",
          existingId: item.existingId,
        });
      }
    });

    if (duplicateErrors.length > 0) {
      return res.status(400).json(
        apiResponse(false, null, "Terdapat duplikat periode", duplicateErrors)
      );
    }

    // Verify all item keuangan exist
    const itemKeuanganIds = [...new Set(validatedItems.map(item => item.itemKeuanganId))];
    const existingItems = await prisma.itemKeuangan.findMany({
      where: {
        id: { in: itemKeuanganIds },
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        kategori: {
          select: {
            nama: true,
            kode: true,
          },
        },
      },
    });

    const existingItemIds = new Set(existingItems.map(item => item.id));
    const missingItems = itemKeuanganIds.filter(id => !existingItemIds.has(id));

    if (missingItems.length > 0) {
      return res.status(400).json(
        apiResponse(false, null, "Beberapa item keuangan tidak ditemukan", {
          missingItems,
        })
      );
    }

    // Prepare data for bulk insert
    const realisasiData = validatedItems.map(item => ({
      itemKeuanganId: item.itemKeuanganId,
      tahun: parseInt(item.tahun),
      bulan: parseInt(item.bulan),
      minggu: item.minggu ? parseInt(item.minggu) : null,
      periode: item.periode,
      frekuensiActual: parseInt(item.frekuensiActual),
      nominalSatuan: item.nominalSatuan ? parseFloat(item.nominalSatuan) : null,
      totalRealisasi: parseFloat(item.totalRealisasi),
      tanggalMulai: new Date(item.tanggalMulai),
      tanggalSelesai: new Date(item.tanggalSelesai),
      keterangan: item.keterangan || null,
    }));

    // Use transaction for bulk insert
    const result = await prisma.$transaction(async (tx) => {
      const createdItems = [];

      for (const data of realisasiData) {
        const created = await tx.realisasiItemKeuangan.create({
          data,
          include: {
            itemKeuangan: {
              select: {
                id: true,
                kode: true,
                nama: true,
                level: true,
                kategori: {
                  select: {
                    id: true,
                    nama: true,
                    kode: true,
                  },
                },
              },
            },
          },
        });
        createdItems.push(created);
      }

      return createdItems;
    });

    // Convert BigInt/Decimal fields to string
    const responseData = result.map(item => ({
      ...item,
      nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : null,
      totalRealisasi: item.totalRealisasi.toString(),
    }));

    return res
      .status(201)
      .json(apiResponse(true, {
        created: responseData,
        summary: {
          totalCreated: responseData.length,
          totalAmount: responseData.reduce((sum, item) =>
            sum + parseFloat(item.totalRealisasi), 0).toString(),
        }
      }, `${responseData.length} realisasi berhasil dibuat`));
  } catch (error) {
    console.error("Error creating bulk realisasi:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Terdapat duplikat periode dalam data"));
    }

    if (error.code === "P2003") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Beberapa item keuangan tidak valid"));
    }

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal membuat realisasi bulk", error.message)
      );
  }
}