// api/keuangan/realisasi/index.js
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
    console.error("API Realisasi Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      itemKeuanganId,
      kategoriId,
      periodeId,
      tanggalMulai,
      tanggalSelesai,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Filter berdasarkan item keuangan
    if (itemKeuanganId && itemKeuanganId !== "" && itemKeuanganId !== "all") {
      where.itemKeuanganId = itemKeuanganId;
    }

    // Filter berdasarkan periode anggaran
    if (periodeId && periodeId !== "all") {
      where.periodeId = periodeId;
    }

    // Filter berdasarkan tanggal
    if (tanggalMulai || tanggalSelesai) {
      where.tanggalRealisasi = {};
      if (tanggalMulai) {
        where.tanggalRealisasi.gte = new Date(tanggalMulai);
      }
      if (tanggalSelesai) {
        where.tanggalRealisasi.lte = new Date(tanggalSelesai);
      }
    }

    // Filter berdasarkan kategori (melalui item keuangan)
    if (kategoriId && kategoriId !== "all") {
      where.itemKeuangan = {
        kategoriId: kategoriId,
      };
    }

    // Search dalam nama item atau keterangan
    if (search) {
      where.OR = [
        { keterangan: { contains: search, mode: "insensitive" } },
        {
          itemKeuangan: {
            nama: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [realisasiRaw, total] = await Promise.all([
      prisma.realisasiItemKeuangan.findMany({
        where,
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
        skip,
        take: parseInt(limit),
        orderBy: [
          { tanggalRealisasi: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.realisasiItemKeuangan.count({ where }),
    ]);

    // Convert BigInt/Decimal fields to string for JSON serialization
    const realisasi = realisasiRaw.map(item => ({
      ...item,
      totalRealisasi: item.totalRealisasi.toString(),
      itemKeuangan: {
        ...item.itemKeuangan,
        nominalSatuan: item.itemKeuangan.nominalSatuan ?
          item.itemKeuangan.nominalSatuan.toString() : null,
        totalTarget: item.itemKeuangan.totalTarget ?
          item.itemKeuangan.totalTarget.toString() : null,
      },
    }));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    };

    return res
      .status(200)
      .json(apiResponse(true, { realisasi, pagination }, "Data realisasi berhasil diambil"));
  } catch (error) {
    console.error("Error fetching realisasi:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data realisasi",
          error.message
        )
      );
  }
}

async function handlePost(req, res) {
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

    // Verify item keuangan exists and get periode info
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

    // Prepare realisasi data - simple!
    const realisasiData = {
      itemKeuanganId,
      periodeId,
      tanggalRealisasi: new Date(tanggalRealisasi),
      totalRealisasi: parseFloat(totalRealisasi),
      keterangan: keterangan || null,
    };

    // Create the realisasi
    const realisasi = await prisma.realisasiItemKeuangan.create({
      data: realisasiData,
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
        nominalSatuan: realisasi.itemKeuangan.nominalSatuan ?
          realisasi.itemKeuangan.nominalSatuan.toString() : null,
        totalTarget: realisasi.itemKeuangan.totalTarget ?
          realisasi.itemKeuangan.totalTarget.toString() : null,
      },
    };

    return res
      .status(201)
      .json(apiResponse(true, responseData, "Realisasi berhasil dibuat"));
  } catch (error) {
    console.error("Error creating realisasi:", error);

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
        apiResponse(false, null, "Gagal membuat realisasi", error.message)
      );
  }
}