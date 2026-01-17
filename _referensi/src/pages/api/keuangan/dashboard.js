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
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  try {
    const { 
      periodeId,
      tahun = new Date().getFullYear(),
      bulan = new Date().getMonth() + 1
    } = req.query;

    // Get active periode if not specified
    let activePeriode;
    if (periodeId) {
      activePeriode = await prisma.periodeAnggaran.findUnique({
        where: { id: periodeId }
      });
    } else {
      activePeriode = await prisma.periodeAnggaran.findFirst({
        where: {
          status: "ACTIVE",
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Date filters
    const currentDate = new Date();
    const startOfMonth = new Date(tahun, bulan - 1, 1);
    const endOfMonth = new Date(tahun, bulan, 0, 23, 59, 59);
    const startOfYear = new Date(tahun, 0, 1);
    const endOfYear = new Date(tahun, 11, 31, 23, 59, 59);

    // Build where clause for transactions
    const whereClause = {
      tanggal: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    };

    if (activePeriode) {
      whereClause.periodeId = activePeriode.id;
    }

    // Get item keuangan data for stats
    let itemPenerimaan = [];
    let itemPengeluaran = [];
    
    if (activePeriode) {
      [itemPenerimaan, itemPengeluaran] = await Promise.all([
        // Get all penerimaan items
        prisma.itemKeuangan.findMany({
          where: {
            periodeId: activePeriode.id,
            kategori: { kode: "A" }, // Penerimaan
            isActive: true
          },
          select: {
            id: true,
            kode: true,
            nama: true,
            nominalActual: true,
            jumlahTransaksi: true,
            kategori: { select: { nama: true } }
          }
        }),
        
        // Get all pengeluaran items
        prisma.itemKeuangan.findMany({
          where: {
            periodeId: activePeriode.id,
            kategori: { kode: "B" }, // Pengeluaran
            isActive: true
          },
          select: {
            id: true,
            kode: true,
            nama: true,
            nominalActual: true,
            jumlahTransaksi: true,
            kategori: { select: { nama: true } }
          }
        })
      ]);
    }

    // Calculate totals from item keuangan
    const totalPenerimaan = itemPenerimaan.reduce((sum, item) => 
      sum + parseFloat(item.nominalActual || 0), 0
    );
    const totalPengeluaran = itemPengeluaran.reduce((sum, item) => 
      sum + parseFloat(item.nominalActual || 0), 0
    );
    const saldoPeriode = totalPenerimaan - totalPengeluaran;

    const totalTransaksiPenerimaan = itemPenerimaan.reduce((sum, item) => 
      sum + parseInt(item.jumlahTransaksi || 0), 0
    );
    const totalTransaksiPengeluaran = itemPengeluaran.reduce((sum, item) => 
      sum + parseInt(item.jumlahTransaksi || 0), 0
    );

    // Get recent transactions from top 5 items with most recent activity
    const recentItems = [...itemPenerimaan, ...itemPengeluaran]
      .filter(item => item.jumlahTransaksi > 0)
      .sort((a, b) => b.nominalActual - a.nominalActual)
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        nominal: item.nominalActual,
        tanggal: new Date().toISOString().split('T')[0], // Mock current date
        itemKeuangan: {
          kode: item.kode,
          nama: item.nama,
          kategori: item.kategori
        }
      }));

    // Get system counts
    const [kategoriCount, itemCount, periodeCount] = await Promise.all([
      prisma.kategoriKeuangan.count({ where: { isActive: true } }),
      prisma.itemKeuangan.count({ where: { isActive: true } }),
      prisma.periodeAnggaran.count({ where: { isActive: true } })
    ]);

    // Format response
    const dashboardData = {
      periode: activePeriode,
      stats: {
        totalPenerimaan: {
          bulan: totalPenerimaan.toString(),
          tahun: totalPenerimaan.toString(), // Same as periode in this simple system
          jumlahTransaksi: totalTransaksiPenerimaan
        },
        totalPengeluaran: {
          bulan: totalPengeluaran.toString(),
          tahun: totalPengeluaran.toString(), // Same as periode in this simple system
          jumlahTransaksi: totalTransaksiPengeluaran
        },
        saldo: {
          bulan: saldoPeriode.toString(),
          tahun: saldoPeriode.toString() // Same as periode in this simple system
        },
        anggaran: {
          target: "0", // No separate anggaran in this system
          realisasi: totalPenerimaan.toString(),
          persentase: "100" // Always 100% since no separate target
        }
      },
      recentTransaksi: recentItems,
      systemCounts: {
        kategori: kategoriCount,
        item: itemCount,
        periode: periodeCount
      },
      filter: {
        tahun: parseInt(tahun),
        bulan: parseInt(bulan),
        periode: activePeriode?.nama || "Tidak ada periode aktif"
      }
    };

    return res
      .status(200)
      .json(apiResponse(true, dashboardData, "Dashboard data berhasil diambil"));

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil data dashboard", error.message));
  }
}