import axios from 'axios';

class PublicStatisticsService {
  constructor() {
    this.baseURL = '/api/public';
  }

  async getChurchStatistics() {
    try {
      const response = await axios.get(`${this.baseURL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching church statistics:', error);
      throw new Error('Failed to fetch church statistics');
    }
  }

  // Method untuk format data chart sesuai kebutuhan component
  formatChartData(apiData) {
    if (!apiData?.data?.charts) {
      return [];
    }

    return apiData.data.charts.map(chart => ({
      title: chart.title,
      type: chart.type,
      data: chart.data
    }));
  }

  // Method untuk mendapatkan overview statistics
  getOverviewStats(apiData) {
    return apiData?.data?.overview || {
      totalJemaat: 0,
      totalKeluarga: 0,
      totalRayon: 0,
      totalBaptis: 0,
      totalSidi: 0
    };
  }
}

export default new PublicStatisticsService();