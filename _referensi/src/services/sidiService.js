import axios from "@/lib/axios";

const sidiService = {
  // Get all sidi with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/sidi", { params });
    return response.data;
  },

  // Get sidi by ID
  getById: async (id) => {
    const response = await axios.get(`/sidi/${id}`);
    return response.data;
  },

  // Create new sidi
  create: async (data) => {
    const response = await axios.post("/sidi", data);
    return response.data;
  },

  // Update sidi
  update: async (id, data) => {
    const response = await axios.patch(`/sidi/${id}`, data);
    return response.data;
  },

  // Delete sidi
  delete: async (id) => {
    const response = await axios.delete(`/sidi/${id}`);
    return response.data;
  },
};

export default sidiService;
