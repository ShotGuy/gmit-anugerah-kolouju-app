import axios from "@/lib/axios";

const baptisService = {
  // Get all baptis with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/baptis", { params });
    return response.data;
  },

  // Get baptis by ID
  getById: async (id) => {
    const response = await axios.get(`/baptis/${id}`);
    return response.data;
  },

  // Create new baptis
  create: async (data) => {
    const response = await axios.post("/baptis", data);
    return response.data;
  },

  // Update baptis
  update: async (id, data) => {
    const response = await axios.patch(`/baptis/${id}`, data);
    return response.data;
  },

  // Delete baptis
  delete: async (id) => {
    const response = await axios.delete(`/baptis/${id}`);
    return response.data;
  },
};

export default baptisService;