import axios from "@/lib/axios";

const realisasiService = {
  // Get all realisasi with pagination and filters
  getAll: async (params = {}) => {
    const response = await axios.get("/keuangan/realisasi", { params });
    return response.data;
  },

  // Get realisasi by ID
  getById: async (id) => {
    const response = await axios.get(`/keuangan/realisasi/${id}`);
    return response.data;
  },

  // Get realisasi summary (aggregated data)
  getSummary: async (params = {}) => {
    const response = await axios.get("/keuangan/realisasi/summary", { params });
    return response.data;
  },

  // Create new realisasi
  create: async (data) => {
    const response = await axios.post("/keuangan/realisasi", data);
    return response.data;
  },

  // Create multiple realisasi at once (bulk)
  createBulk: async (data) => {
    const response = await axios.post("/keuangan/realisasi/bulk", data);
    return response.data;
  },

  // Update realisasi
  update: async (id, data) => {
    const response = await axios.put(`/keuangan/realisasi/${id}`, data);
    return response.data;
  },

  // Delete realisasi
  delete: async (id) => {
    const response = await axios.delete(`/keuangan/realisasi/${id}`);
    return response.data;
  },

  // Get realisasi by item keuangan
  getByItemKeuangan: async (itemKeuanganId, params = {}) => {
    const response = await axios.get("/keuangan/realisasi", {
      params: {
        ...params,
        itemKeuanganId,
      },
    });
    return response.data;
  },
};

export default realisasiService;
