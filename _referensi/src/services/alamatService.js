import axios from "@/lib/axios";

const alamatService = {
  // Get all alamats with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/alamat", { params });

    return response.data;
  },

  // Get alamat by ID
  getById: async (id) => {
    const response = await axios.get(`/alamat/${id}`);

    return response.data;
  },

  // Create new alamat
  create: async (data) => {
    const response = await axios.post("/alamat", data);

    return response.data;
  },

  // Update alamat
  update: async (id, data) => {
    const response = await axios.patch(`/alamat/${id}`, data);

    return response.data;
  },

  // Delete alamat
  delete: async (id) => {
    const response = await axios.delete(`/alamat/${id}`);

    return response.data;
  },
};

export default alamatService;
