import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const [
      educationStats,
      jobStats,
      incomeStats,
      healthInsuranceStats,
      tribeStats,
      familyStatusStats,
      ageDistribution,
    ] = await Promise.all([
      // Education distribution
      prisma.pendidikan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          jemaats: {
            _count: "desc",
          },
        },
      }),

      // Job distribution
      prisma.pekerjaan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          jemaats: {
            _count: "desc",
          },
        },
      }),

      // Income distribution
      prisma.pendapatan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          min: "asc",
        },
      }),

      // Health insurance distribution
      prisma.jaminanKesehatan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          jemaats: {
            _count: "desc",
          },
        },
      }),

      // Tribe distribution
      prisma.suku.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          jemaats: {
            _count: "desc",
          },
        },
      }),

      // Family status distribution
      prisma.statusKeluarga.findMany({
        include: {
          _count: {
            select: {
              keluargas: true,
            },
          },
        },
        orderBy: {
          keluargas: {
            _count: "desc",
          },
        },
      }),

      // Detailed age distribution
      prisma.jemaat.findMany({
        select: {
          tanggalLahir: true,
          jenisKelamin: true,
        },
      }),
    ]);

    // Process age distribution with more detailed breakdown
    const currentDate = new Date();
    const detailedAgeGroups = {
      "0-12": { male: 0, female: 0, total: 0 },
      "13-17": { male: 0, female: 0, total: 0 },
      "18-25": { male: 0, female: 0, total: 0 },
      "26-35": { male: 0, female: 0, total: 0 },
      "36-45": { male: 0, female: 0, total: 0 },
      "46-55": { male: 0, female: 0, total: 0 },
      "56-65": { male: 0, female: 0, total: 0 },
      "65+": { male: 0, female: 0, total: 0 },
    };

    ageDistribution.forEach((member) => {
      const birthDate = new Date(member.tanggalLahir);
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      const isMale = member.jenisKelamin;
      
      let ageGroup;
      if (age <= 12) ageGroup = "0-12";
      else if (age <= 17) ageGroup = "13-17";
      else if (age <= 25) ageGroup = "18-25";
      else if (age <= 35) ageGroup = "26-35";
      else if (age <= 45) ageGroup = "36-45";
      else if (age <= 55) ageGroup = "46-55";
      else if (age <= 65) ageGroup = "56-65";
      else ageGroup = "65+";

      if (isMale) {
        detailedAgeGroups[ageGroup].male += 1;
      } else {
        detailedAgeGroups[ageGroup].female += 1;
      }
      detailedAgeGroups[ageGroup].total += 1;
    });

    // Filter and format data
    const education = educationStats
      .filter(item => item._count.jemaats > 0)
      .map(item => ({
        label: item.jenjang,
        count: item._count.jemaats,
        percentage: 0, // Will calculate after getting total
      }));

    const jobs = jobStats
      .filter(item => item._count.jemaats > 0)
      .slice(0, 15) // Top 15 jobs
      .map(item => ({
        label: item.namaPekerjaan,
        count: item._count.jemaats,
        percentage: 0,
      }));

    const income = incomeStats
      .filter(item => item._count.jemaats > 0)
      .map(item => ({
        label: item.label,
        count: item._count.jemaats,
        percentage: 0,
        range: {
          min: item.min,
          max: item.max,
        },
      }));

    const healthInsurance = healthInsuranceStats
      .filter(item => item._count.jemaats > 0)
      .map(item => ({
        label: item.jenisJaminan,
        count: item._count.jemaats,
        percentage: 0,
      }));

    const tribes = tribeStats
      .filter(item => item._count.jemaats > 0)
      .slice(0, 10) // Top 10 tribes
      .map(item => ({
        label: item.namaSuku,
        count: item._count.jemaats,
        percentage: 0,
      }));

    const familyStatus = familyStatusStats
      .filter(item => item._count.keluargas > 0)
      .map(item => ({
        label: item.status,
        count: item._count.keluargas,
        percentage: 0,
      }));

    // Calculate percentages
    const totalMembers = await prisma.jemaat.count();
    const totalFamilies = await prisma.keluarga.count();

    education.forEach(item => {
      item.percentage = Math.round((item.count / totalMembers) * 100);
    });

    jobs.forEach(item => {
      item.percentage = Math.round((item.count / totalMembers) * 100);
    });

    income.forEach(item => {
      item.percentage = Math.round((item.count / totalMembers) * 100);
    });

    healthInsurance.forEach(item => {
      item.percentage = Math.round((item.count / totalMembers) * 100);
    });

    tribes.forEach(item => {
      item.percentage = Math.round((item.count / totalMembers) * 100);
    });

    familyStatus.forEach(item => {
      item.percentage = Math.round((item.count / totalFamilies) * 100);
    });

    const demographics = {
      education,
      jobs,
      income,
      healthInsurance,
      tribes,
      familyStatus,
      ageDistribution: detailedAgeGroups,
      summary: {
        totalMembers,
        totalFamilies,
        averageAge: Math.round(
          ageDistribution.reduce((sum, member) => {
            const age = currentDate.getFullYear() - new Date(member.tanggalLahir).getFullYear();
            return sum + age;
          }, 0) / ageDistribution.length
        ),
      },
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json(
      apiResponse(true, demographics, "Data demografi berhasil diambil")
    );
  } catch (error) {
    console.error("Error fetching demographics:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal mengambil data demografi", error.message)
    );
  }
}

export default createApiHandler({
  GET: handleGet,
});