import axios from "@/lib/axios";

const statisticsService = {
  // Get overview statistics
  getOverview: async () => {
    const response = await axios.get("/statistics/overview");
    return response.data;
  },

  // Get growth trends
  getGrowth: async (params = {}) => {
    const response = await axios.get("/statistics/growth", { params });
    return response.data;
  },

  // Get demographics
  getDemographics: async () => {
    const response = await axios.get("/statistics/demographics");
    return response.data;
  },

  // Export statistics report
  exportReport: async (options = {}) => {
    const {
      format = 'pdf',
      type = 'overview', // overview, growth, demographics, all
      period,
      year,
      includeCharts = true
    } = options;

    const params = {
      format,
      type,
      includeCharts,
      ...(period && { period }),
      ...(year && { year })
    };

    const response = await axios.get("/statistics/export", {
      params,
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Set filename based on format and type
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `laporan-${type}-${timestamp}.${format}`;
    link.setAttribute('download', filename);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  },

  // Generate report data for export (fallback if API not available)
  generateReportData: async (type = 'overview') => {
    try {
      let data = {};

      if (type === 'overview' || type === 'all') {
        const overview = await statisticsService.getOverview();
        data.overview = overview.data;
      }

      if (type === 'growth' || type === 'all') {
        const growth = await statisticsService.getGrowth();
        data.growth = growth.data;
      }

      if (type === 'demographics' || type === 'all') {
        const demographics = await statisticsService.getDemographics();
        data.demographics = demographics.data;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error generating report data:', error);
      throw error;
    }
  }
};

export default statisticsService;