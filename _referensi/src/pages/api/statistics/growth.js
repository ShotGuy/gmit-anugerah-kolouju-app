import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handleGet(req, res) {
  try {
    const { period = "monthly", year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    let memberGrowth = [];
    let sacramentTrends = [];

    if (period === "monthly") {
      // Get monthly data for the target year
      const monthlyData = [];
      
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(targetYear, month, 1);
        const monthEnd = new Date(targetYear, month + 1, 1);
        
        const [baptisCount, sidiCount, pernikahanCount] = await Promise.all([
          prisma.baptis.count({
            where: {
              tanggal: {
                gte: monthStart,
                lt: monthEnd,
              },
            },
          }),
          prisma.sidi.count({
            where: {
              tanggal: {
                gte: monthStart,
                lt: monthEnd,
              },
            },
          }),
          prisma.pernikahan.count({
            where: {
              tanggal: {
                gte: monthStart,
                lt: monthEnd,
              },
            },
          }),
        ]);

        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
          "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
        ];

        memberGrowth.push({
          period: monthNames[month],
          count: 0, // No member tracking available
          month: month + 1,
          year: targetYear,
        });

        sacramentTrends.push({
          period: monthNames[month],
          baptis: baptisCount,
          sidi: sidiCount,
          pernikahan: pernikahanCount,
          month: month + 1,
          year: targetYear,
        });
      }
    } else if (period === "yearly") {
      // Get yearly data for the last 5 years
      for (let year = targetYear - 4; year <= targetYear; year++) {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);
        
        const [baptisCount, sidiCount, pernikahanCount] = await Promise.all([
          prisma.baptis.count({
            where: {
              tanggal: {
                gte: yearStart,
                lt: yearEnd,
              },
            },
          }),
          prisma.sidi.count({
            where: {
              tanggal: {
                gte: yearStart,
                lt: yearEnd,
              },
            },
          }),
          prisma.pernikahan.count({
            where: {
              tanggal: {
                gte: yearStart,
                lt: yearEnd,
              },
            },
          }),
        ]);

        memberGrowth.push({
          period: year.toString(),
          count: 0, // No member tracking available
          year: year,
        });

        sacramentTrends.push({
          period: year.toString(),
          baptis: baptisCount,
          sidi: sidiCount,
          pernikahan: pernikahanCount,
          year: year,
        });
      }
    }

    // Calculate totals and averages
    const totalNewMembers = memberGrowth.reduce((sum, item) => sum + item.count, 0);
    const averageGrowth = Math.round(totalNewMembers / memberGrowth.length);

    const totalSacraments = sacramentTrends.reduce((acc, item) => ({
      baptis: acc.baptis + item.baptis,
      sidi: acc.sidi + item.sidi,
      pernikahan: acc.pernikahan + item.pernikahan,
    }), { baptis: 0, sidi: 0, pernikahan: 0 });

    const result = {
      period,
      year: targetYear,
      memberGrowth,
      sacramentTrends,
      summary: {
        totalNewMembers,
        averageGrowth,
        totalSacraments,
        periodCount: memberGrowth.length,
      },
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json(
      apiResponse(true, result, "Data pertumbuhan berhasil diambil")
    );
  } catch (error) {
    console.error("Error fetching growth data:", error);
    return res.status(500).json(
      apiResponse(false, null, "Gagal mengambil data pertumbuhan", error.message)
    );
  }
}

export default createApiHandler({
  GET: handleGet,
});