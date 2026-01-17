import axios from "@/lib/axios";

export const jadwalIbadahService = {
  // Get all jadwal ibadah with pagination and filtering
  getAll: async (params = {}) => {
    const response = await axios.get("/jadwal-ibadah", { params });
    return response.data;
  },

  // Get jadwal ibadah by ID
  getById: async (id) => {
    const response = await axios.get(`/jadwal-ibadah/${id}`);
    return response.data;
  },

  // Create new jadwal ibadah
  create: async (data) => {
    // Transform data for API
    const transformedData = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    };
    
    const response = await axios.post("/jadwal-ibadah", transformedData);
    return response.data;
  },

  // Update jadwal ibadah
  update: async (id, data) => {
    // Transform data for API
    const transformedData = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    };
    
    const response = await axios.patch(`/jadwal-ibadah/${id}`, transformedData);
    return response.data;
  },

  // Delete jadwal ibadah
  delete: async (id) => {
    const response = await axios.delete(`/jadwal-ibadah/${id}`);
    return response.data;
  },

  // Get options for dropdowns
  getOptions: async () => {
    const response = await axios.get("/jadwal-ibadah/options");
    return response.data;
  }
};

export default jadwalIbadahService;