import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { period = 'year' } = req.query;
    
    // Define date ranges based on period
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let startDate, endDate, previousStartDate, previousEndDate;
    
    switch (period) {
      case 'month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 1);
        previousStartDate = new Date(currentYear, currentMonth - 1, 1);
        previousEndDate = new Date(currentYear, currentMonth, 1);
        break;
      case 'year':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear + 1, 0, 1);
        previousStartDate = new Date(currentYear - 1, 0, 1);
        previousEndDate = new Date(currentYear, 0, 1);
        break;
      default: // 'all'
        startDate = new Date(1900, 0, 1);
        endDate = new Date(currentYear + 1, 0, 1);
        previousStartDate = new Date(currentYear - 1, 0, 1);
        previousEndDate = new Date(currentYear, 0, 1);
    }

    // Parallel queries for better performance
    const [
      // Basic counts
      totalMembers,
      totalFamilies,
      maleMembers,
      femaleMembers,
      
      // Age-based demographics
      allMembersWithAge,
      
      // Sacrament counts
      totalBaptis,
      totalSidi,
      totalPernikahan,
      baptisThisPeriod,
      sidiThisPeriod,
      pernikahanThisPeriod,
      baptisPreviousPeriod,
      sidiPreviousPeriod,
      pernikahanPreviousPeriod,
      
      // Distribution data
      rayonDistribution,
      educationDistribution,
      pekerjaanDistribution,
      sukuDistribution,
      
      // Family and address data
      familyData,
      
    ] = await Promise.all([
      // Basic counts
      prisma.jemaat.count(),
      prisma.keluarga.count(),
      prisma.jemaat.count({ where: { jenisKelamin: true } }),
      prisma.jemaat.count({ where: { jenisKelamin: false } }),
      
      // Age demographics
      prisma.jemaat.findMany({
        select: {
          tanggalLahir: true,
          jenisKelamin: true,
        },
      }),
      
      // Sacrament totals
      prisma.baptis.count(),
      prisma.sidi.count(),
      prisma.pernikahan.count(),
      
      // Sacraments this period
      prisma.baptis.count({
        where: {
          tanggal: { gte: startDate, lt: endDate },
        },
      }),
      prisma.sidi.count({
        where: {
          tanggal: { gte: startDate, lt: endDate },
        },
      }),
      prisma.pernikahan.count({
        where: {
          tanggal: { gte: startDate, lt: endDate },
        },
      }),
      
      // Previous period for trends
      prisma.baptis.count({
        where: {
          tanggal: { gte: previousStartDate, lt: previousEndDate },
        },
      }),
      prisma.sidi.count({
        where: {
          tanggal: { gte: previousStartDate, lt: previousEndDate },
        },
      }),
      prisma.pernikahan.count({
        where: {
          tanggal: { gte: previousStartDate, lt: previousEndDate },
        },
      }),
      
      // Distribution queries
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
      
      prisma.pendidikan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          jenjang: 'asc',
        },
      }),
      
      prisma.pekerjaan.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          namaPekerjaan: 'asc',
        },
      }),
      
      prisma.suku.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
        },
        orderBy: {
          namaSuku: 'asc',
        },
      }),
      
      // Family data for additional insights
      prisma.keluarga.findMany({
        include: {
          _count: {
            select: {
              jemaats: true,
            },
          },
          rayon: {
            select: {
              namaRayon: true,
            },
          },
        },
      }),
    ]);

    // Process age demographics
    const ageGroups = {
      children: { count: 0, male: 0, female: 0 }, // 0-12
      youth: { count: 0, male: 0, female: 0 },    // 13-25
      adult: { count: 0, male: 0, female: 0 },    // 26-59
      elderly: { count: 0, male: 0, female: 0 },  // 60+
    };

    allMembersWithAge.forEach((member) => {
      if (member.tanggalLahir) {
        const birthDate = new Date(member.tanggalLahir);
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        const isMale = member.jenisKelamin;
        
        let group;
        if (age <= 12) group = 'children';
        else if (age <= 25) group = 'youth';
        else if (age <= 59) group = 'adult';
        else group = 'elderly';
        
        ageGroups[group].count += 1;
        if (isMale) {
          ageGroups[group].male += 1;
        } else {
          ageGroups[group].female += 1;
        }
      }
    });

    // Calculate percentages for age groups
    const ageGroupsWithPercentages = Object.keys(ageGroups).reduce((acc, key) => {
      acc[key] = {
        ...ageGroups[key],
        percentage: totalMembers > 0 ? (ageGroups[key].count / totalMembers) * 100 : 0,
      };
      return acc;
    }, {});

    // Process rayon distribution
    const rayonStats = rayonDistribution.map(rayon => {
      const totalMembersInRayon = rayon.keluargas.reduce((sum, keluarga) => 
        sum + keluarga._count.jemaats, 0
      );
      
      return {
        name: rayon.namaRayon,
        families: rayon.keluargas.length,
        members: totalMembersInRayon,
        percentage: totalMembers > 0 ? (totalMembersInRayon / totalMembers) * 100 : 0,
      };
    }).sort((a, b) => b.members - a.members);

    // Process education distribution
    const educationStats = educationDistribution
      .filter(edu => edu._count.jemaats > 0)
      .map(edu => ({
        level: edu.jenjang,
        count: edu._count.jemaats,
        percentage: totalMembers > 0 ? (edu._count.jemaats / totalMembers) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Process job distribution
    const jobStats = pekerjaanDistribution
      .filter(job => job._count.jemaats > 0)
      .map(job => ({
        job: job.namaPekerjaan,
        count: job._count.jemaats,
        percentage: totalMembers > 0 ? (job._count.jemaats / totalMembers) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    // Process ethnic distribution
    const ethnicStats = sukuDistribution
      .filter(suku => suku._count.jemaats > 0)
      .map(suku => ({
        ethnicity: suku.namaSuku,
        count: suku._count.jemaats,
        percentage: totalMembers > 0 ? (suku._count.jemaats / totalMembers) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    // Calculate family statistics
    const activeFamilies = familyData.filter(family => family._count.jemaats > 0).length;
    const avgMembersPerFamily = activeFamilies > 0 ? totalMembers / activeFamilies : 0;

    // Calculate growth trends
    const baptisTrend = baptisPreviousPeriod > 0 
      ? ((baptisThisPeriod - baptisPreviousPeriod) / baptisPreviousPeriod) * 100 
      : 0;
    
    const sidiTrend = sidiPreviousPeriod > 0 
      ? ((sidiThisPeriod - sidiPreviousPeriod) / sidiPreviousPeriod) * 100 
      : 0;
    
    const pernikahanTrend = pernikahanPreviousPeriod > 0 
      ? ((pernikahanThisPeriod - pernikahanPreviousPeriod) / pernikahanPreviousPeriod) * 100 
      : 0;

    // Compile comprehensive analytics
    const analytics = {
      overview: {
        totalMembers,
        totalFamilies,
        activeFamilies,
        maleMembers,
        femaleMembers,
        memberGenderRatio: femaleMembers > 0 ? maleMembers / femaleMembers : 0,
      },
      
      demographics: {
        maleCount: maleMembers,
        femaleCount: femaleMembers,
        malePercentage: totalMembers > 0 ? (maleMembers / totalMembers) * 100 : 0,
        femalePercentage: totalMembers > 0 ? (femaleMembers / totalMembers) * 100 : 0,
        childrenCount: ageGroupsWithPercentages.children.count,
        youthCount: ageGroupsWithPercentages.youth.count,
        adultCount: ageGroupsWithPercentages.adult.count,
        elderlyCount: ageGroupsWithPercentages.elderly.count,
        childrenPercentage: ageGroupsWithPercentages.children.percentage,
        youthPercentage: ageGroupsWithPercentages.youth.percentage,
        adultPercentage: ageGroupsWithPercentages.adult.percentage,
        elderlyPercentage: ageGroupsWithPercentages.elderly.percentage,
        ageGroups: ageGroupsWithPercentages,
      },
      
      sacraments: {
        baptisTotal: totalBaptis,
        sidiTotal: totalSidi,
        pernikahanTotal: totalPernikahan,
        baptisThisYear: baptisThisPeriod,
        sidiThisYear: sidiThisPeriod,
        pernikahanThisYear: pernikahanThisPeriod,
        totalThisYear: baptisThisPeriod + sidiThisPeriod + pernikahanThisPeriod,
        baptisTrend,
        sidiTrend,
        pernikahanTrend,
      },
      
      distributions: {
        rayonStats,
        educationStats,
        jobStats,
        ethnicStats,
        avgMembersPerFamily: Math.round(avgMembersPerFamily * 100) / 100,
      },
      
      trends: {
        memberGrowth: 0, // Would need historical data
        growthRate: 0,   // Would need historical data
        yearlyGrowth: 0, // Would need historical data
        avgBaptisPerMonth: Math.round((baptisThisPeriod / 12) * 100) / 100,
        newFamiliesThisYear: 0, // Would need family creation dates
      },
      
      // Metadata
      period,
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    return res.status(200).json(
      apiResponse(true, analytics, "Analitik komprehensif berhasil diambil")
    );
    
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal mengambil analitik", error.message)
    );
  }
}

export default createApiHandler({
  GET: handleGet,
});