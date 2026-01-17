import axios from "@/lib/axios";

const majelisService = {
  // Create majelis with auto user account creation
  createWithAccount: async (data) => {
    const res = await axios.post("/majelis/create-with-account", data);
    return res.data;
  },

  // Get all majelis
  getAll: async (params = {}) => {
    const res = await axios.get("/majelis", { params });
    return res.data;
  },

  // Get majelis by ID
  getById: async (id) => {
    const res = await axios.get(`/majelis/${id}`);
    return res.data;
  },

  // Update majelis
  update: async (id, data) => {
    const res = await axios.patch(`/majelis/${id}`, data);
    return res.data;
  },

  // Delete majelis
  delete: async (id) => {
    const res = await axios.delete(`/majelis/${id}`);
    return res.data;
  },
};

export default majelisService;