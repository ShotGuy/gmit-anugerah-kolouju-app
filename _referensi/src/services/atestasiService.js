import axios from "@/lib/axios";

const atestasiService = {
  // Get all atestasi with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/atestasi", { params });
    return response.data;
  },

  // Get atestasi by ID
  getById: async (id) => {
    const response = await axios.get(`/atestasi/${id}`);
    return response.data;
  },

  // Create new atestasi
  create: async (data) => {
    const response = await axios.post("/atestasi", data);
    return response.data;
  },

  // Update atestasi
  update: async (id, data) => {
    const response = await axios.put(`/atestasi/${id}`, data);
    return response.data;
  },

  // Delete atestasi
  delete: async (id) => {
    const response = await axios.delete(`/atestasi/${id}`);
    return response.data;
  },

  // Create jemaat from atestasi masuk
  createJemaatFromAtestasi: async (atestasiId, jemaatData) => {
    const response = await axios.post(`/atestasi/${atestasiId}/create-jemaat`, jemaatData);
    return response.data;
  },

  // Get statistics for atestasi
  getStatistics: async () => {
    const response = await axios.get("/atestasi/statistics");
    return response.data;
  },
};

export default atestasiService;