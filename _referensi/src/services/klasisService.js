import axios from "@/lib/axios";

const klasisService = {
  // Get all klasis with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/klasis", { params });

    return response.data;
  },

  // Get klasis by ID
  getById: async (id) => {
    const response = await axios.get(`/klasis/${id}`);

    return response.data;
  },

  // Create new klasis
  create: async (data) => {
    const response = await axios.post("/klasis", data);

    return response.data;
  },

  // Update klasis
  update: async (id, data) => {
    const response = await axios.patch(`/klasis/${id}`, data);

    return response.data;
  },

  // Delete klasis
  delete: async (id) => {
    const response = await axios.delete(`/klasis/${id}`);

    return response.data;
  },
};

export default klasisService;
