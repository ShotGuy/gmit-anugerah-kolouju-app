import axios from 'axios';

class PublicJadwalService {
  constructor() {
    this.baseURL = '/api/public';
  }

  async getJadwalIbadah(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.jenisIbadah) {
        params.append('jenisIbadah', filters.jenisIbadah);
      }
      
      if (filters.kategori) {
        params.append('kategori', filters.kategori);
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit);
      }
      
      if (filters.upcoming !== undefined) {
        params.append('upcoming', filters.upcoming);
      }

      const queryString = params.toString();
      const url = `${this.baseURL}/jadwal-ibadah${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching jadwal ibadah:', error);
      throw new Error('Failed to fetch jadwal ibadah');
    }
  }

  async getJadwalByJenis(jenisIbadah, limit = 6) {
    return this.getJadwalIbadah({
      jenisIbadah,
      limit,
      upcoming: true
    });
  }

  async getJadwalRayon(limit = 6) {
    return this.getJadwalIbadah({
      kategori: 'Rayon',
      limit,
      upcoming: true
    });
  }

  async getJadwalMingguan(limit = 6) {
    return this.getJadwalIbadah({
      jenisIbadah: 'Ibadah Minggu',
      limit,
      upcoming: true
    });
  }

  async getJadwalKhusus(limit = 6) {
    return this.getJadwalIbadah({
      kategori: 'Khusus',
      limit,
      upcoming: true
    });
  }

  // Method untuk mendapat semua filter yang tersedia
  async getAvailableFilters() {
    try {
      const response = await this.getJadwalIbadah({ limit: 1 });
      return response.data?.filters || { jenisIbadah: [], kategori: [] };
    } catch (error) {
      console.error('Error fetching filters:', error);
      return { jenisIbadah: [], kategori: [] };
    }
  }

  // Format data untuk komponen
  formatForScheduleRow(apiData) {
    if (!apiData?.data?.schedules) {
      return [];
    }

    return apiData.data.schedules.map(schedule => ({
      id: schedule.id,
      title: `${schedule.jenisIbadah}${schedule.rayon ? ` - ${schedule.rayon}` : ''}`,
      date: schedule.date,
      time: schedule.time,
      location: schedule.location,
      speaker: schedule.speaker,
      tema: schedule.tema,
      firman: schedule.firman,
      kategori: schedule.kategori,
      jenisIbadah: schedule.jenisIbadah,
      rayon: schedule.rayon
    }));
  }

  // Group schedules by jenis ibadah
  groupByJenisIbadah(schedules) {
    return schedules.reduce((groups, schedule) => {
      const jenis = schedule.jenisIbadah;
      if (!groups[jenis]) {
        groups[jenis] = [];
      }
      groups[jenis].push(schedule);
      return groups;
    }, {});
  }
}

export default new PublicJadwalService();