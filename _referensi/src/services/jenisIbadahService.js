import axios from "@/lib/axios";
import handleApiCall from "@/lib/apiErrorHandler";

const jenisIbadahService = {
  // Get all jenis ibadah with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/jenis-ibadah", { params });

    return response.data;
  },

  // Get jenis ibadah by ID
  getById: async (id) => {
    const response = await axios.get(`/jenis-ibadah/${id}`);

    return response.data;
  },

  // Create new jenis ibadah
  create: async (data) => {
    return handleApiCall(() => axios.post("/jenis-ibadah", data));
  },

  // Update jenis ibadah
  update: async (id, data) => {
    return handleApiCall(() => axios.patch(`/jenis-ibadah/${id}`, data));
  },

  // Delete jenis ibadah
  delete: async (id) => {
    return handleApiCall(() => axios.delete(`/jenis-ibadah/${id}`));
  },
};

export default jenisIbadahService;
