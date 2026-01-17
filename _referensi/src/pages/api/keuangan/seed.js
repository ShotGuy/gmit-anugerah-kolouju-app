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
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  if (req.method === "DELETE") {
    return await handleClearData(req, res);
  }

  try {
    const { force = false } = req.body;
    
    // Check if data already exists
    const existingKategori = await prisma.kategoriKeuangan.findFirst();
    if (existingKategori && !force) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Data seed sudah ada. Gunakan force=true untuk menimpa."));
    }

    if (existingKategori && force) {
      await handleClearData(req, res);
    }

    // Create categories
    const penerima = await prisma.kategoriKeuangan.create({
      data: {
        nama: "PENERIMAAN",
        kode: "A",
        isActive: true
      }
    });

    const pengeluaran = await prisma.kategoriKeuangan.create({
      data: {
        nama: "PENGELUARAN", 
        kode: "B",
        isActive: true
      }
    });

    // Create main items for PENERIMAAN (A)
    const perpuluhan = await prisma.itemKeuangan.create({
      data: {
        kategoriId: penerima.id,
        kode: "A.1",
        nama: "Perpuluhan",
        deskripsi: "Persembahan perpuluhan jemaat",
        level: 1,
        urutan: 1,
        isActive: true
      }
    });

    const persembahan = await prisma.itemKeuangan.create({
      data: {
        kategoriId: penerima.id,
        kode: "A.2", 
        nama: "Persembahan Khusus",
        deskripsi: "Persembahan khusus untuk berbagai keperluan",
        level: 1,
        urutan: 2,
        isActive: true
      }
    });

    const bantuan = await prisma.itemKeuangan.create({
      data: {
        kategoriId: penerima.id,
        kode: "A.3",
        nama: "Bantuan & Hibah",
        deskripsi: "Bantuan dari pihak luar dan hibah",
        level: 1,
        urutan: 3,
        isActive: true
      }
    });

    // Create sub-items for Persembahan Khusus
    await prisma.itemKeuangan.createMany({
      data: [
        {
          kategoriId: penerima.id,
          parentId: persembahan.id,
          kode: "A.2.1",
          nama: "Persembahan Ibadah Minggu",
          deskripsi: "Persembahan setiap ibadah minggu",
          level: 2,
          urutan: 1,
          isActive: true,
          targetFrekuensi: 52,
          satuanFrekuensi: "Kali",
          nominalSatuan: 500000,
          totalTarget: 26000000
        },
        {
          kategoriId: penerima.id,
          parentId: persembahan.id,
          kode: "A.2.2",
          nama: "Persembahan Natal",
          deskripsi: "Persembahan khusus natal",
          level: 2,
          urutan: 2,
          isActive: true,
          targetFrekuensi: 1,
          satuanFrekuensi: "Tahun",
          nominalSatuan: 5000000,
          totalTarget: 5000000
        },
        {
          kategoriId: penerima.id,
          parentId: persembahan.id,
          kode: "A.2.3",
          nama: "Persembahan Paskah",
          deskripsi: "Persembahan khusus paskah",
          level: 2,
          urutan: 3,
          isActive: true,
          targetFrekuensi: 1,
          satuanFrekuensi: "Tahun",
          nominalSatuan: 3000000,
          totalTarget: 3000000
        }
      ]
    });

    // Create main items for PENGELUARAN (B)
    const operasional = await prisma.itemKeuangan.create({
      data: {
        kategoriId: pengeluaran.id,
        kode: "B.1",
        nama: "Operasional Gereja",
        deskripsi: "Biaya operasional harian gereja",
        level: 1,
        urutan: 1,
        isActive: true
      }
    });

    const pelayanan = await prisma.itemKeuangan.create({
      data: {
        kategoriId: pengeluaran.id,
        kode: "B.2",
        nama: "Pelayanan & Kegiatan",
        deskripsi: "Biaya untuk pelayanan dan kegiatan gereja",
        level: 1,
        urutan: 2,
        isActive: true
      }
    });

    const pembangunan = await prisma.itemKeuangan.create({
      data: {
        kategoriId: pengeluaran.id,
        kode: "B.3",
        nama: "Pembangunan & Renovasi",
        deskripsi: "Biaya pembangunan dan renovasi fasilitas",
        level: 1,
        urutan: 3,
        isActive: true
      }
    });

    // Create sub-items for Operasional
    await prisma.itemKeuangan.createMany({
      data: [
        {
          kategoriId: pengeluaran.id,
          parentId: operasional.id,
          kode: "B.1.1",
          nama: "Listrik & Air",
          deskripsi: "Biaya utilitas listrik dan air",
          level: 2,
          urutan: 1,
          isActive: true,
          targetFrekuensi: 12,
          satuanFrekuensi: "Bulan",
          nominalSatuan: 800000,
          totalTarget: 9600000
        },
        {
          kategoriId: pengeluaran.id,
          parentId: operasional.id,
          kode: "B.1.2",
          nama: "Kebersihan & Perawatan",
          deskripsi: "Biaya kebersihan dan perawatan gedung",
          level: 2,
          urutan: 2,
          isActive: true,
          targetFrekuensi: 12,
          satuanFrekuensi: "Bulan",
          nominalSatuan: 500000,
          totalTarget: 6000000
        },
        {
          kategoriId: pengeluaran.id,
          parentId: operasional.id,
          kode: "B.1.3",
          nama: "Alat Tulis & ATK",
          deskripsi: "Biaya alat tulis dan administrasi",
          level: 2,
          urutan: 3,
          isActive: true,
          targetFrekuensi: 4,
          satuanFrekuensi: "Kali",
          nominalSatuan: 300000,
          totalTarget: 1200000
        }
      ]
    });

    // Create a sample periode
    const currentYear = new Date().getFullYear();
    const samplePeriode = await prisma.periodeAnggaran.create({
      data: {
        nama: `Anggaran ${currentYear}`,
        tahun: currentYear,
        tanggalMulai: new Date(`${currentYear}-01-01`),
        tanggalAkhir: new Date(`${currentYear}-12-31`),
        status: "ACTIVE",
        keterangan: `Periode anggaran tahunan ${currentYear}`,
        isActive: true
      }
    });

    // Auto populate anggaran items dari item keuangan yang sudah dibuat
    const allItems = await prisma.itemKeuangan.findMany({
      where: { isActive: true },
      orderBy: [
        { kategoriId: 'asc' },
        { level: 'asc' },
        { urutan: 'asc' },
        { kode: 'asc' }
      ]
    });

    if (allItems.length > 0) {
      const anggaranItemsData = allItems.map(item => ({
        periodeId: samplePeriode.id,
        itemKeuanganId: item.id,
        targetFrekuensi: item.targetFrekuensi || null,
        satuanFrekuensi: item.satuanFrekuensi || null,
        nominalSatuan: item.nominalSatuan || null,
        totalAnggaran: item.totalTarget || 0,
        keterangan: `Template dari item: ${item.nama}`
      }));

      await prisma.anggaranItem.createMany({
        data: anggaranItemsData
      });
    }

    return res
      .status(201)
      .json(apiResponse(true, null, "Data seed berhasil dibuat"));

  } catch (error) {
    console.error("Error seeding keuangan data:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal membuat data seed", error.message));
  }
}

async function handleClearData(req, res) {
  try {
    // Delete in correct order (children first)
    await prisma.transaksiPenerimaan.deleteMany({});
    await prisma.transaksiPengeluaran.deleteMany({});
    await prisma.anggaranItem.deleteMany({});
    await prisma.rekapKeuangan.deleteMany({});
    await prisma.periodeAnggaran.deleteMany({});
    await prisma.itemKeuangan.deleteMany({});
    await prisma.kategoriKeuangan.deleteMany({});

    return res
      .status(200)
      .json(apiResponse(true, null, "Data keuangan berhasil dihapus"));
  } catch (error) {
    console.error("Error clearing keuangan data:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal menghapus data keuangan", error.message));
  }
}