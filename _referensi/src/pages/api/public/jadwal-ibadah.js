import { publicEndpoint } from "../../../lib/apiMiddleware";
import prisma from "../../../lib/prisma";

async function handler(req, res) {
  try {
    const { jenisIbadah, limit = 10, upcoming = true, kategori } = req.query;

    // Build filter conditions
    const where = {};

    // Filter by jenis ibadah if specified
    if (jenisIbadah) {
      where.jenisIbadah = {
        namaIbadah: jenisIbadah,
      };
    }

    // Filter by kategori if specified
    if (kategori) {
      where.kategori = {
        namaKategori: kategori,
      };
    }

    // Filter upcoming events only
    if (upcoming === "true") {
      const now = new Date();
      where.tanggal = {
        gte: now,
      };
    }

    // Get jadwal ibadah with relations
    const jadwalIbadah = await prisma.jadwalIbadah.findMany({
      where,
      take: parseInt(limit),
      orderBy: [{ tanggal: "asc" }, { waktuMulai: "asc" }],
      select: {
        id: true,
        judul: true,
        tanggal: true,
        waktuMulai: true,
        waktuSelesai: true,
        lokasi: true,
        alamat: true,
        tema: true,
        firman: true,
        keterangan: true,
        jenisIbadah: {
          select: {
            namaIbadah: true,
          },
        },
        kategori: {
          select: {
            namaKategori: true,
            deskripsi: true,
          },
        },
        pemimpin: {
          select: {
            nama: true,
          },
        },
        rayon: {
          select: {
            namaRayon: true,
          },
        },
        keluarga: {
          select: {
            noBagungan: true,
            rayon: {
              select: {
                namaRayon: true,
              },
            },
          },
        },
      },
    });

    // Format data for frontend
    const formattedSchedules = jadwalIbadah.map((jadwal) => ({
      id: jadwal.id,
      title: jadwal.judul,
      jenisIbadah: jadwal.jenisIbadah?.namaIbadah || "Ibadah",
      kategori: jadwal.kategori?.namaKategori || "Umum",
      date: jadwal.tanggal
        ? new Date(jadwal.tanggal).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
      time: jadwal.waktuMulai
        ? typeof jadwal.waktuMulai === "string"
          ? jadwal.waktuMulai.substring(0, 5)
          : jadwal.waktuMulai.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : "Belum ditentukan",
      location: jadwal.lokasi || jadwal.alamat || "Gereja",
      speaker: jadwal.pemimpin?.nama || "Belum ditentukan",
      tema: jadwal.tema,
      firman: jadwal.firman,
      keterangan: jadwal.keterangan,
      rayon: jadwal.rayon?.namaRayon || jadwal.keluarga?.rayon?.namaRayon,
      // Raw data untuk keperluan lain
      rawDate: jadwal.tanggal,
      rawTime: jadwal.waktuMulai,
    }));

    // Group by jenis ibadah
    const groupedByJenis = formattedSchedules.reduce((acc, jadwal) => {
      const jenis = jadwal.jenisIbadah;
      if (!acc[jenis]) {
        acc[jenis] = [];
      }
      acc[jenis].push(jadwal);
      return acc;
    }, {});

    // Get available jenis ibadah untuk filter
    const availableJenisIbadah = await prisma.jenisIbadah.findMany({
      where: { isActive: true },
      select: {
        id: true,
        namaIbadah: true,
      },
      orderBy: { namaIbadah: "asc" },
    });

    // Get available kategori untuk filter
    const availableKategori = await prisma.kategoriJadwal.findMany({
      where: { isActive: true },
      select: {
        id: true,
        namaKategori: true,
        deskripsi: true,
      },
      orderBy: { namaKategori: "asc" },
    });

    res.status(200).json({
      success: true,
      data: {
        schedules: formattedSchedules,
        groupedByJenis,
        filters: {
          jenisIbadah: availableJenisIbadah,
          kategori: availableKategori,
        },
        meta: {
          total: formattedSchedules.length,
          filtered: {
            jenisIbadah: jenisIbadah || null,
            kategori: kategori || null,
            upcoming: upcoming === "true",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public jadwal ibadah:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Export with public middleware
export default publicEndpoint(handler);
