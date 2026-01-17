import { PrismaClient } from "@prisma/client";

import { publicEndpoint } from "../../../lib/apiMiddleware";

const prisma = new PrismaClient();

async function handler(req, res) {
  try {
    // Ambil statistik dasar tanpa data sensitif
    const [
      totalJemaat,
      totalKeluarga,
      totalRayon,
      totalBaptis,
      totalSidi,
      jemaatByGender,
      jemaatWithBirthDates,
      pendidikanData,
      rayonData,
    ] = await Promise.all([
      // Total Jemaat
      prisma.jemaat.count(),

      // Total Keluarga
      prisma.keluarga.count(),

      // Total Rayon
      prisma.rayon.count(),

      // Total Baptis
      prisma.baptis.count(),

      // Total Sidi
      prisma.sidi.count(),

      // Jemaat berdasarkan jenis kelamin
      prisma.jemaat.groupBy({
        by: ["jenisKelamin"],
        _count: true,
      }),

      // Ambil semua jemaat dengan tanggal lahir untuk proses usia
      prisma.jemaat.findMany({
        select: {
          tanggalLahir: true,
        },
      }),

      // Jemaat berdasarkan pendidikan - ambil data pendidikan dengan count
      prisma.pendidikan.findMany({
        select: {
          id: true,
          jenjang: true,
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
      }),

      // Keluarga berdasarkan rayon - ambil data rayon dengan count
      prisma.rayon.findMany({
        select: {
          id: true,
          namaRayon: true,
          _count: {
            select: {
              keluargas: true,
            },
          },
        },
      }),
    ]);

    // Process age groups
    const ageGroups = {
      "Anak (0-11)": 0,
      "Remaja (12-17)": 0,
      "Pemuda (18-30)": 0,
      "Dewasa (31-50)": 0,
      "Lansia (50+)": 0,
    };

    const currentDate = new Date();

    jemaatWithBirthDates.forEach((jemaat) => {
      if (jemaat.tanggalLahir) {
        const birthDate = new Date(jemaat.tanggalLahir);
        const age = currentDate.getFullYear() - birthDate.getFullYear();

        if (age < 12) {
          ageGroups["Anak (0-11)"] += 1;
        } else if (age <= 17) {
          ageGroups["Remaja (12-17)"] += 1;
        } else if (age <= 30) {
          ageGroups["Pemuda (18-30)"] += 1;
        } else if (age <= 50) {
          ageGroups["Dewasa (31-50)"] += 1;
        } else {
          ageGroups["Lansia (50+)"] += 1;
        }
      }
    });

    const jemaatByAgeGroup = Object.entries(ageGroups).map(
      ([age_group, count]) => ({
        age_group,
        count,
      })
    );

    // Format data untuk chart
    const statistics = {
      overview: {
        totalJemaat,
        totalKeluarga,
        totalRayon,
        totalBaptis,
        totalSidi,
      },
      charts: [
        {
          title: "Jemaat Berdasarkan Jenis Kelamin",
          type: "pie",
          data: jemaatByGender.map((item) => ({
            name: item.jenisKelamin ? "Laki-laki" : "Perempuan",
            value: item._count,
            color: item.jenisKelamin ? "#3B82F6" : "#EF4444",
          })),
        },
        {
          title: "Jemaat Berdasarkan Kelompok Usia",
          type: "pie",
          data: jemaatByAgeGroup.map((item, index) => ({
            name: item.age_group,
            value: item.count,
            color: ["#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#84CC16"][
              index % 5
            ],
          })),
        },
        {
          title: "Distribusi Keluarga per Rayon",
          type: "bar",
          data: rayonData.map((item, index) => ({
            name: item.namaRayon,
            value: item._count.keluargas,
            color: ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E"][
              index % 5
            ],
          })),
        },
        {
          title: "Jemaat Berdasarkan Pendidikan",
          type: "pie",
          data: pendidikanData
            .filter((item) => item._count.jemaats > 0)
            .map((item, index) => ({
              name: item.jenjang,
              value: item._count.jemaats,
              color: [
                "#3B82F6",
                "#EF4444",
                "#10B981",
                "#F59E0B",
                "#8B5CF6",
                "#06B6D4",
              ][index % 6],
            })),
        },
        {
          title: "Status Sakramen",
          type: "pie",
          data: [
            {
              name: "Baptis",
              value: totalBaptis,
              color: "#3B82F6",
            },
            {
              name: "Sidi",
              value: totalSidi,
              color: "#10B981",
            },
          ],
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error fetching public statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Export handler dengan middleware public
export default publicEndpoint(handler);
