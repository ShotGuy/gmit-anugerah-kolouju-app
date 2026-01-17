import axios from "@/lib/axios";

const jemaatService = {
  // Get all jemaats with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/jemaat", { params });

    return response.data;
  },

  // Get jemaat by ID
  getById: async (id) => {
    const response = await axios.get(`/jemaat/${id}`);

    return response.data;
  },

  // Create new jemaat
  create: async (data) => {
    const response = await axios.post("/jemaat", data);

    return response.data;
  },

  // Create jemaat with user account, keluarga, and alamat
  createWithUser: async (data) => {
    const response = await axios.post("/jemaat/create-with-user", data);

    return response.data;
  },

  // Update jemaat
  update: async (id, data) => {
    const response = await axios.patch(`/jemaat/${id}`, data);

    return response.data;
  },

  // Delete jemaat
  delete: async (id) => {
    const response = await axios.delete(`/jemaat/${id}`);

    return response.data;
  },

  // Get jemaats by keluarga ID
  getByKeluargaId: async (keluargaId) => {
    const response = await axios.get("/jemaat", {
      params: { idKeluarga: keluargaId },
    });

    return response.data;
  },

  // Export jemaat data
  exportData: async (filters, exportConfig) => {
    const response = await axios.post("/jemaat/export", {
      filters,
      exportConfig,
    });

    return response.data;
  },
};

export default jemaatService;
