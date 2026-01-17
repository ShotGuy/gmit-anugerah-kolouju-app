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

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);

        return res
          .status(405)
          .json(apiResponse(false, null, `Method ${method} not allowed`));
    }
  } catch (error) {
    console.error("API Periode Anggaran Error:", error);

    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const { page = 1, limit = 10, search, tahun, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { keterangan: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tahun) {
      where.tahun = parseInt(tahun);
    }

    if (status && status !== "") {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.periodeAnggaran.findMany({
        where,
        include: {
          _count: {
            select: {
              itemKeuangan: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: [{ tahun: "desc" }, { tanggalMulai: "desc" }],
      }),
      prisma.periodeAnggaran.count({ where }),
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    };

    return res
      .status(200)
      .json(apiResponse(true, { items, pagination }, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching periode anggaran:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data periode anggaran",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
  try {
    const {
      nama,
      tahun,
      tanggalMulai,
      tanggalAkhir,
      keterangan,
      status = "DRAFT",
      isActive = true,
      autoPopulateItems = false, // Parameter baru untuk auto populate
    } = req.body;

    if (!nama || !tahun || !tanggalMulai || !tanggalAkhir) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          nama: !nama ? "Nama periode wajib diisi" : undefined,
          tahun: !tahun ? "Tahun wajib diisi" : undefined,
          tanggalMulai: !tanggalMulai ? "Tanggal mulai wajib diisi" : undefined,
          tanggalAkhir: !tanggalAkhir ? "Tanggal akhir wajib diisi" : undefined,
        })
      );
    }

    // Validate dates
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalAkhir);

    if (startDate >= endDate) {
      return res.status(400).json(
        apiResponse(false, null, "Validasi gagal", {
          tanggalAkhir: "Tanggal akhir harus setelah tanggal mulai",
        })
      );
    }

    // Check for overlapping periods
    const overlapping = await prisma.periodeAnggaran.findFirst({
      where: {
        OR: [
          {
            AND: [
              { tanggalMulai: { lte: startDate } },
              { tanggalAkhir: { gte: startDate } },
            ],
          },
          {
            AND: [
              { tanggalMulai: { lte: endDate } },
              { tanggalAkhir: { gte: endDate } },
            ],
          },
          {
            AND: [
              { tanggalMulai: { gte: startDate } },
              { tanggalAkhir: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            null,
            "Periode anggaran tidak boleh tumpang tindih dengan periode lain"
          )
        );
    }

    const periode = await prisma.periodeAnggaran.create({
      data: {
        nama,
        tahun: parseInt(tahun),
        tanggalMulai: startDate,
        tanggalAkhir: endDate,
        keterangan: keterangan || null,
        status,
        isActive,
      },
    });

    // Auto populate anggaran items jika diminta
    if (autoPopulateItems) {
      try {
        // Get all active item keuangan
        const itemKeuanganList = await prisma.itemKeuangan.findMany({
          where: {
            isActive: true,
          },
          orderBy: [
            { kategoriId: "asc" },
            { level: "asc" },
            { urutan: "asc" },
            { kode: "asc" },
          ],
        });

        if (itemKeuanganList.length > 0) {
          // Prepare anggaran items data
          const anggaranItemsData = itemKeuanganList.map((item) => ({
            periodeId: periode.id,
            itemKeuanganId: item.id,
            targetFrekuensi: item.targetFrekuensi || null,
            satuanFrekuensi: item.satuanFrekuensi || null,
            nominalSatuan: item.nominalSatuan || null,
            totalAnggaran: item.totalTarget || 0,
            keterangan: `Auto-populated dari template: ${item.nama}`,
          }));

          // Create anggaran items in batch
          // Note: This would need to be implemented if AnggaranItem model exists
          // For now, we'll skip auto population
        }
      } catch (populateError) {
        // Tidak menggagalkan pembuatan periode, hanya warning
      }
    }

    return res
      .status(201)
      .json(apiResponse(true, periode, "Periode anggaran berhasil dibuat"));
  } catch (error) {
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal membuat periode anggaran",
          error.message
        )
      );
  }
}
