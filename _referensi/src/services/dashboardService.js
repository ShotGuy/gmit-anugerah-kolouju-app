import axios from "@/lib/axios";

class DashboardService {
  async getMajelisDashboard() {
    try {
      const response = await axios.get("/dashboard/majelis");

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch majelis dashboard"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Majelis Dashboard Service Error:", error);

      // Handle 403 error specifically - show the actual API error message
      if (error.response && error.response.status === 403) {
        const apiErrorMessage =
          error.response.data?.message ||
          "Akses ditolak. Anda bukan majelis atau tidak memiliki izin untuk mengakses dashboard majelis.";

        throw new Error(apiErrorMessage);
      }

      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const response = await axios.get("/statistics/overview");

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch dashboard statistics"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
  }

  // General dashboard method that tries majelis first, falls back to general stats
  async getDashboard() {
    try {
      // Try to get majelis dashboard first
      return await this.getMajelisDashboard();
    } catch (error) {
      // If 403, user is not majelis - fall back to general dashboard stats
      if (error.response && error.response.status === 403) {
        return await this.getDashboardStats();
      }

      // Re-throw other errors
      throw error;
    }
  }

  async getRecentActivities() {
    try {
      // Get recent baptis, sidi activities using axios
      const [baptisResponse, sidiResponse] = await Promise.all([
        axios.get("/baptis?limit=5"),
        axios.get("/sidi?limit=5"),
      ]);

      const activities = [];

      // Process baptis data
      if (baptisResponse.data.success && baptisResponse.data.data?.items) {
        const baptisActivities = baptisResponse.data.data.items.map(
          (baptis) => ({
            id: `baptis-${baptis.id}`,
            type: "baptis",
            member: baptis.jemaat?.nama || "Unknown",
            date: baptis.tanggal,
            status: "completed",
          })
        );

        activities.push(...baptisActivities);
      }

      // Process sidi data
      if (sidiResponse.data.success && sidiResponse.data.data?.items) {
        const sidiActivities = sidiResponse.data.data.items.map((sidi) => ({
          id: `sidi-${sidi.id}`,
          type: "sidi",
          member: sidi.jemaat?.nama || "Unknown",
          date: sidi.tanggal,
          status: "completed",
        }));

        activities.push(...sidiActivities);
      }

      // Sort by date and take the 10 most recent
      return activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    } catch (error) {
      console.error("Recent Activities Service Error:", error);

      return [];
    }
  }

  async getUpcomingEvents() {
    try {
      // Fetch real worship schedule data from API using axios
      const response = await axios.get(
        "/public/jadwal-ibadah?limit=50&upcoming=true"
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch worship schedules"
        );
      }

      // Transform the API response to match the expected format
      return response.data.data.schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.rawDate
          ? new Date(schedule.rawDate).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })
          : schedule.date,
        time: schedule.time,
        type: schedule.jenisIbadah.toLowerCase().includes("ibadah")
          ? "worship"
          : schedule.jenisIbadah.toLowerCase().includes("persekutuan")
            ? "fellowship"
            : schedule.jenisIbadah.toLowerCase().includes("doa")
              ? "prayer"
              : "worship",
        location: schedule.location,
        speaker: schedule.speaker,
        tema: schedule.tema,
        firman: schedule.firman,
        kategori: schedule.kategori,
        rayon: schedule.rayon,
      }));
    } catch (error) {
      console.error("Upcoming Events Service Error:", error);

      // Fallback to mock data if API fails
      return this.getMockUpcomingEvents();
    }
  }

  // Fallback method with mock data
  getMockUpcomingEvents() {
    const upcomingEvents = [
      {
        id: 1,
        title: "Ibadah Minggu",
        date: this.getNextSunday(),
        time: "08:00",
        type: "worship",
        location: "Gereja",
        speaker: "Pendeta",
      },
      {
        id: 2,
        title: "Persekutuan Remaja",
        date: this.getNextDay(6),
        time: "19:00",
        type: "fellowship",
        location: "Aula Gereja",
        speaker: "Majelis Remaja",
      },
      {
        id: 3,
        title: "Doa Pagi",
        date: this.getNextWeekday(),
        time: "06:00",
        type: "prayer",
        location: "Gereja",
        speaker: "Majelis",
      },
    ];

    return upcomingEvents;
  }

  // Helper methods for date calculations
  getNextSunday() {
    const today = new Date();
    const nextSunday = new Date(today);

    nextSunday.setDate(today.getDate() + (7 - today.getDay()));

    return nextSunday.toISOString().split("T")[0];
  }

  getNextWeekday() {
    const today = new Date();
    const nextWeekday = new Date(today);

    if (today.getDay() === 5) {
      // Friday
      nextWeekday.setDate(today.getDate() + 3); // Monday
    } else if (today.getDay() === 6) {
      // Saturday
      nextWeekday.setDate(today.getDate() + 2); // Monday
    } else {
      nextWeekday.setDate(today.getDate() + 1); // Next day
    }

    return nextWeekday.toISOString().split("T")[0];
  }

  getNextDay(dayOfWeek) {
    const today = new Date();
    const nextDay = new Date(today);
    const daysUntil = (dayOfWeek - today.getDay() + 7) % 7;

    nextDay.setDate(today.getDate() + (daysUntil === 0 ? 7 : daysUntil));

    return nextDay.toISOString().split("T")[0];
  }
}

const dashboardService = new DashboardService();

export default dashboardService;
