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
    console.error("API Transaksi Penerimaan Error:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Server error", error.message));
  }
}

async function handleGet(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      periodeId,
      itemKeuanganId,
      jemaatId,
      tanggalMulai,
      tanggalAkhir
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { keterangan: { contains: search, mode: 'insensitive' } },
        { nomorReferensi: { contains: search, mode: 'insensitive' } },
        {
          jemaat: {
            nama: { contains: search, mode: 'insensitive' }
          }
        },
        {
          itemKeuangan: {
            nama: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    if (periodeId && periodeId !== '') {
      where.periodeId = periodeId;
    }

    if (itemKeuanganId && itemKeuanganId !== '') {
      where.itemKeuanganId = itemKeuanganId;
    }

    if (jemaatId && jemaatId !== '') {
      where.jemaatId = jemaatId;
    }

    if (tanggalMulai && tanggalAkhir) {
      where.tanggal = {
        gte: new Date(tanggalMulai),
        lte: new Date(tanggalAkhir)
      };
    } else if (tanggalMulai) {
      where.tanggal = {
        gte: new Date(tanggalMulai)
      };
    } else if (tanggalAkhir) {
      where.tanggal = {
        lte: new Date(tanggalAkhir)
      };
    }

    const [items, total] = await Promise.all([
      prisma.transaksiPenerimaan.findMany({
        where,
        include: {
          periode: {
            select: {
              id: true,
              nama: true,
              tahun: true
            }
          },
          itemKeuangan: {
            select: {
              id: true,
              kode: true,
              nama: true,
              kategori: {
                select: {
                  nama: true
                }
              }
            }
          },
          jemaat: {
            select: {
              id: true,
              nama: true
            }
          },
          keluarga: {
            select: {
              id: true,
              noBagungan: true
            }
          },
          jadwalIbadah: {
            select: {
              id: true,
              judul: true,
              tanggal: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: [
          { tanggal: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.transaksiPenerimaan.count({ where })
    ]);

    // Convert BigInt to string for JSON serialization
    const itemsWithStrings = items.map(item => ({
      ...item,
      nominal: item.nominal.toString()
    }));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    };

    return res
      .status(200)
      .json(apiResponse(true, { items: itemsWithStrings, pagination }, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching transaksi penerimaan:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil data transaksi penerimaan", error.message));
  }
}

async function handlePost(req, res) {
  try {
    const {
      periodeId,
      itemKeuanganId,
      jadwalIbadahId,
      jemaatId,
      keluargaId,
      tanggal,
      nominal,
      keterangan,
      nomorReferensi,
      sumberData = "manual"
    } = req.body;

    // Validation
    if (!periodeId || !itemKeuanganId || !tanggal || !nominal) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Validasi gagal", {
          periodeId: !periodeId ? "Periode wajib dipilih" : undefined,
          itemKeuanganId: !itemKeuanganId ? "Item keuangan wajib dipilih" : undefined,
          tanggal: !tanggal ? "Tanggal wajib diisi" : undefined,
          nominal: !nominal ? "Nominal wajib diisi" : undefined,
        }));
    }

    // Verify periode exists and is active
    const periode = await prisma.periodeAnggaran.findUnique({
      where: { id: periodeId },
      select: { 
        id: true, 
        nama: true, 
        status: true, 
        isActive: true,
        tanggalMulai: true,
        tanggalAkhir: true
      }
    });

    if (!periode) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Periode anggaran tidak ditemukan"));
    }

    if (!periode.isActive || periode.status !== "ACTIVE") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Periode anggaran tidak aktif"));
    }

    // Verify item keuangan exists and is penerimaan
    const itemKeuangan = await prisma.itemKeuangan.findUnique({
      where: { id: itemKeuanganId },
      include: {
        kategori: {
          select: { kode: true, nama: true }
        }
      }
    });

    if (!itemKeuangan) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Item keuangan tidak ditemukan"));
    }

    if (itemKeuangan.kategori.kode !== "A") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Item yang dipilih bukan kategori penerimaan"));
    }

    // Verify jemaat if provided
    if (jemaatId) {
      const jemaat = await prisma.jemaat.findUnique({
        where: { id: jemaatId }
      });
      if (!jemaat) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Jemaat tidak ditemukan"));
      }
    }

    // Verify keluarga if provided
    if (keluargaId) {
      const keluarga = await prisma.keluarga.findUnique({
        where: { id: keluargaId }
      });
      if (!keluarga) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Keluarga tidak ditemukan"));
      }
    }

    // Verify jadwal ibadah if provided
    if (jadwalIbadahId) {
      const jadwalIbadah = await prisma.jadwalIbadah.findUnique({
        where: { id: jadwalIbadahId }
      });
      if (!jadwalIbadah) {
        return res
          .status(400)
          .json(apiResponse(false, null, "Jadwal ibadah tidak ditemukan"));
      }
    }

    // Validate tanggal in periode range
    const inputDate = new Date(tanggal);
    const startDate = new Date(periode.tanggalMulai);
    const endDate = new Date(periode.tanggalAkhir);

    if (inputDate < startDate || inputDate > endDate) {
      return res
        .status(400)
        .json(apiResponse(false, null, `Tanggal harus dalam rentang periode ${periode.nama} (${startDate.toDateString()} - ${endDate.toDateString()})`));
    }

    // Create transaksi
    const transaksi = await prisma.transaksiPenerimaan.create({
      data: {
        periodeId,
        itemKeuanganId,
        jadwalIbadahId: jadwalIbadahId || null,
        jemaatId: jemaatId || null,
        keluargaId: keluargaId || null,
        tanggal: inputDate,
        nominal: parseFloat(nominal),
        keterangan: keterangan || null,
        nomorReferensi: nomorReferensi || null,
        sumberData
      },
      include: {
        periode: {
          select: {
            nama: true
          }
        },
        itemKeuangan: {
          select: {
            kode: true,
            nama: true
          }
        },
        jemaat: {
          select: {
            nama: true
          }
        }
      }
    });

    // Convert BigInt to string for JSON serialization
    const transaksiWithString = {
      ...transaksi,
      nominal: transaksi.nominal.toString()
    };

    return res
      .status(201)
      .json(apiResponse(true, transaksiWithString, "Transaksi penerimaan berhasil dicatat"));
  } catch (error) {
    console.error("Error creating transaksi penerimaan:", error);

    if (error.code === "P2003") {
      return res
        .status(400)
        .json(apiResponse(false, null, "Data referensi tidak valid"));
    }

    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mencatat transaksi penerimaan", error.message));
  }
}