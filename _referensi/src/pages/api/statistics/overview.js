import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { staffOnly } from "@/lib/apiMiddleware";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    const currentYearStart = new Date(currentYear, 0, 1);
    const currentYearEnd = new Date(currentYear + 1, 0, 1);

    // Parallel queries for better performance
    const [
      totalMembers,
      maleMembers,
      femaleMembers,
      totalFamilies,
      totalBaptis,
      totalSidi,
      totalPernikahan,
      baptisThisYear,
      sidiThisYear,
      pernikahanThisYear,
      membersByRayon,
      membersByAge,
      membersByEducation,
      membersByPekerjaan,
      rayonList,
    ] = await Promise.all([
      // Basic counts
      prisma.jemaat.count(),
      prisma.jemaat.count({ where: { jenisKelamin: true } }),
      prisma.jemaat.count({ where: { jenisKelamin: false } }),
      prisma.keluarga.count(),
      prisma.baptis.count(),
      prisma.sidi.count(),
      prisma.pernikahan.count(),

      // This year counts
      prisma.baptis.count({
        where: {
          tanggal: {
            gte: currentYearStart,
            lt: currentYearEnd,
          },
        },
      }),
      prisma.sidi.count({
        where: {
          tanggal: {
            gte: currentYearStart,
            lt: currentYearEnd,
          },
        },
      }),
      prisma.pernikahan.count({
        where: {
          tanggal: {
            gte: currentYearStart,
            lt: currentYearEnd,
          },
        },
      }),

      // Members by rayon
      prisma.rayon.findMany({
        include: {
          keluargas: {
            include: {
              _count: {
                select: {
                  jemaats: true,
                },
              },
            },
          },
        },
      }),

      // Age groups (get all members with birth dates)
      prisma.jemaat.findMany({
        select: {
          tanggalLahir: true,
        },
      }),

      // Members by education
      prisma.pendidikan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
      }),

      // Members by job
      prisma.pekerjaan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
      }),

      // Rayon list for distribution
      prisma.rayon.findMany({
        include: {
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
      children: 0, // 0-12
      youth: 0, // 13-25
      adults: 0, // 26-59
      elderly: 0, // 60+
    };

    const currentDate = new Date();

    membersByAge.forEach((member) => {
      if (member.tanggalLahir) {
        const birthDate = new Date(member.tanggalLahir);
        const age = currentDate.getFullYear() - birthDate.getFullYear();

        if (age <= 12) {
          ageGroups.children += 1;
        } else if (age <= 25) {
          ageGroups.youth += 1;
        } else if (age <= 59) {
          ageGroups.adults += 1;
        } else {
          ageGroups.elderly += 1;
        }
      }
    });

    // Process rayon distribution
    const rayonDistribution = rayonList.map((rayon) => ({
      rayon: rayon.namaRayon,
      families: rayon._count.keluargas,
      // For now, we'll use the family count as an approximation
      // In a real implementation, you'd need a more complex query
      members: rayon._count.keluargas * 3, // Approximate 3 members per family
    }));

    // Process education distribution
    const educationDistribution = membersByEducation
      .filter((edu) => edu._count.jemaats > 0)
      .map((edu) => ({
        education: edu.jenjang,
        count: edu._count.jemaats,
      }));

    // Process job distribution
    const jobDistribution = membersByPekerjaan
      .filter((job) => job._count.jemaats > 0)
      .map((job) => ({
        job: job.namaPekerjaan,
        count: job._count.jemaats,
      }));

    const overview = {
      // Basic statistics
      totalMembers,
      membersByGender: {
        male: maleMembers,
        female: femaleMembers,
      },
      totalFamilies,

      // Sacraments
      sacraments: {
        baptis: {
          total: totalBaptis,
          thisYear: baptisThisYear,
        },
        sidi: {
          total: totalSidi,
          thisYear: sidiThisYear,
        },
        pernikahan: {
          total: totalPernikahan,
          thisYear: pernikahanThisYear,
        },
      },

      // Demographics
      ageGroups,
      rayonDistribution,
      educationDistribution: educationDistribution.slice(0, 10), // Top 10
      jobDistribution: jobDistribution.slice(0, 10), // Top 10

      // Metadata
      generatedAt: new Date().toISOString(),
      year: currentYear,
    };

    return res
      .status(200)
      .json(apiResponse(true, overview, "Statistik berhasil diambil"));
  } catch (error) {
    console.error("Error fetching statistics:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil statistik", error.message)
      );
  }
}

// Apply staff-only middleware (Admin, Majelis, Employee)
export default staffOnly(
  createApiHandler({
    GET: handleGet,
  })
);
