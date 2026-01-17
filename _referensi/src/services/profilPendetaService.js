import axios from "@/lib/axios";

const profilPendetaService = {
  // Get all pastor profiles
  getAll: async (params = {}) => {
    const response = await axios.get("/profil-pendeta", { params });
    return response.data;
  },

  // Get pastor profile by ID
  getById: async (id) => {
    const response = await axios.get(`/profil-pendeta/${id}`);
    return response.data;
  },

  // Get active pastor profile
  getActive: async () => {
    const response = await axios.get("/profil-pendeta/active");
    return response.data;
  },

  // Create new pastor profile
  create: async (formData) => {
    const response = await axios.post("/profil-pendeta", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update pastor profile
  update: async (id, formData) => {
    const response = await axios.patch(`/profil-pendeta/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete pastor profile
  delete: async (id) => {
    const response = await axios.delete(`/profil-pendeta/${id}`);
    return response.data;
  },

  // Toggle active status
  toggleActive: async (id, isActive) => {
    const response = await axios.patch(`/profil-pendeta/${id}/status`, { isActive });
    return response.data;
  },
};

export default profilPendetaService;