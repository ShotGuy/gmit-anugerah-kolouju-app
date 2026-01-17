import axios from "@/lib/axios";

const rayonService = {
  // =================== RAYON ===================

  getRayon: async (params = {}) => {
    const res = await axios.get("/rayon", { params });

    return res.data;
  },

  getRayonById: async (id) => {
    const res = await axios.get(`/rayon/${id}`);

    return res.data;
  },

  createRayon: async (data) => {
    const res = await axios.post("/rayon", data);

    return res.data;
  },

  updateRayon: async (id, data) => {
    const res = await axios.patch(`/rayon/${id}`, data);

    return res.data;
  },

  deleteRayon: async (id) => {
    const res = await axios.delete(`/rayon/${id}`);

    return res.data;
  },
};

export default rayonService;
