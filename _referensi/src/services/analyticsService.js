import axios from "@/lib/axios";

class AnalyticsService {
  async getFullAnalytics(period = "year") {
    try {
      const response = await axios.get(
        `/analytics/comprehensive?period=${period}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch analytics data"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Analytics Service Error:", error);

      // Return fallback data structure
      return this.getFallbackData();
    }
  }

  async getDemographicTrends() {
    try {
      const response = await axios.get("/analytics/trends");

      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error("Demographics Trends Service Error:", error);

      return {};
    }
  }

  async getSacramentAnalytics() {
    try {
      const response = await axios.get("/analytics/sacraments");

      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error("Sacrament Analytics Service Error:", error);

      return {};
    }
  }

  async getGrowthMetrics(period = "year") {
    try {
      const response = await axios.get(`/analytics/growth?period=${period}`);

      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error("Growth Metrics Service Error:", error);

      return {};
    }
  }

  async getDistributionAnalytics() {
    try {
      const response = await axios.get("/analytics/distribution");

      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error("Distribution Analytics Service Error:", error);

      return {};
    }
  }

  // Fallback data when API fails
  getFallbackData() {
    return {
      overview: {
        totalMembers: 0,
        totalFamilies: 0,
        activeFamilies: 0,
        maleMembers: 0,
        femaleMembers: 0,
        memberGenderRatio: 0,
      },
      demographics: {
        maleCount: 0,
        femaleCount: 0,
        malePercentage: 0,
        femalePercentage: 0,
        childrenCount: 0,
        youthCount: 0,
        adultCount: 0,
        elderlyCount: 0,
        childrenPercentage: 0,
        youthPercentage: 0,
        adultPercentage: 0,
        elderlyPercentage: 0,
        ageGroups: {
          children: { count: 0, male: 0, female: 0, percentage: 0 },
          youth: { count: 0, male: 0, female: 0, percentage: 0 },
          adult: { count: 0, male: 0, female: 0, percentage: 0 },
          elderly: { count: 0, male: 0, female: 0, percentage: 0 },
        },
      },
      sacraments: {
        baptisTotal: 0,
        sidiTotal: 0,
        pernikahanTotal: 0,
        baptisThisYear: 0,
        sidiThisYear: 0,
        pernikahanThisYear: 0,
        totalThisYear: 0,
        baptisTrend: 0,
        sidiTrend: 0,
        pernikahanTrend: 0,
      },
      distributions: {
        rayonStats: [],
        educationStats: [],
        jobStats: [],
        ethnicStats: [],
        avgMembersPerFamily: 0,
      },
      trends: {
        memberGrowth: 0,
        growthRate: 0,
        yearlyGrowth: 0,
        avgBaptisPerMonth: 0,
        newFamiliesThisYear: 0,
      },
    };
  }

  // Helper method to format chart data
  formatChartData(data, labelKey, valueKey) {
    return data.map((item) => ({
      label: item[labelKey],
      value: item[valueKey],
      percentage: item.percentage || 0,
    }));
  }

  // Helper method to calculate growth percentage
  calculateGrowthPercentage(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;

    return ((current - previous) / previous) * 100;
  }

  // Helper method to format age group data for charts
  formatAgeGroupData(ageGroups) {
    return [
      {
        label: "Anak (0-12)",
        value: ageGroups.children?.count || 0,
        percentage: ageGroups.children?.percentage || 0,
      },
      {
        label: "Remaja (13-25)",
        value: ageGroups.youth?.count || 0,
        percentage: ageGroups.youth?.percentage || 0,
      },
      {
        label: "Dewasa (26-59)",
        value: ageGroups.adult?.count || 0,
        percentage: ageGroups.adult?.percentage || 0,
      },
      {
        label: "Lansia (60+)",
        value: ageGroups.elderly?.count || 0,
        percentage: ageGroups.elderly?.percentage || 0,
      },
    ];
  }

  // Helper method to format gender distribution
  formatGenderData(demographics) {
    return [
      {
        label: "Pria",
        value: demographics.maleCount || 0,
        percentage: demographics.malePercentage || 0,
      },
      {
        label: "Wanita",
        value: demographics.femaleCount || 0,
        percentage: demographics.femalePercentage || 0,
      },
    ];
  }

  // Helper method to get summary insights
  getSummaryInsights(analytics) {
    const insights = [];

    // Gender balance insight
    const genderDiff = Math.abs(
      analytics.demographics.malePercentage -
        analytics.demographics.femalePercentage
    );

    if (genderDiff < 10) {
      insights.push("Distribusi jenis kelamin cukup seimbang");
    } else {
      const dominant =
        analytics.demographics.malePercentage >
        analytics.demographics.femalePercentage
          ? "pria"
          : "wanita";

      insights.push(
        `Jemaat ${dominant} lebih dominan (${genderDiff.toFixed(1)}% selisih)`
      );
    }

    // Age distribution insight
    const youthPercentage = analytics.demographics.youthPercentage || 0;

    if (youthPercentage > 25) {
      insights.push("Gereja memiliki populasi remaja yang cukup besar");
    } else if (youthPercentage < 15) {
      insights.push("Perlu fokus pada pelayanan remaja");
    }

    // Growth insight
    if (analytics.sacraments.baptisTrend > 0) {
      insights.push(
        `Baptis meningkat ${analytics.sacraments.baptisTrend.toFixed(1)}%`
      );
    }

    // Family size insight
    const avgFamily = analytics.distributions.avgMembersPerFamily || 0;

    if (avgFamily > 4) {
      insights.push("Ukuran keluarga rata-rata cukup besar");
    } else if (avgFamily < 3) {
      insights.push("Ukuran keluarga rata-rata relatif kecil");
    }

    return insights;
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
