import axios from "@/lib/axios";

const pernikahanService = {
  // Get all pernikahan with pagination
  getAll: async (params = {}) => {
    const res = await axios.get("/pernikahan", { params });
    return res.data;
  },

  // Get pernikahan by id
  getById: async (id) => {
    const res = await axios.get(`/pernikahan/${id}`);
    return res.data;
  },

  // Create new pernikahan
  create: async (data) => {
    const res = await axios.post("/pernikahan", data);
    return res.data;
  },

  // Update pernikahan
  update: async (id, data) => {
    const res = await axios.put(`/pernikahan/${id}`, data);
    return res.data;
  },

  // Delete pernikahan
  delete: async (id) => {
    const res = await axios.delete(`/pernikahan/${id}`);
    return res.data;
  },
};

export default pernikahanService;