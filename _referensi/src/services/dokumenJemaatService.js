import axios from "@/lib/axios";

const dokumenJemaatService = {
  // Get all documents with pagination and filters
  getAll: async (params = {}) => {
    const response = await axios.get("/dokumen", { params });
    return response.data;
  },

  // Get document by ID
  getById: async (id) => {
    const response = await axios.get(`/dokumen/${id}`);
    return response.data;
  },

  // Create new document
  create: async (data) => {
    const response = await axios.post("/dokumen", data);
    return response.data;
  },

  // Update document
  update: async (id, data) => {
    const response = await axios.patch(`/dokumen/${id}`, data);
    return response.data;
  },

  // Delete document
  delete: async (id) => {
    const response = await axios.delete(`/dokumen/${id}`);
    return response.data;
  },

  // Verify document (for majelis)
  verify: async (dokumenId, status, catatan = "") => {
    const response = await axios.put("/dokumen/verify", {
      dokumenId,
      status,
      catatan,
    });
    return response.data;
  },

  // Get documents for majelis rayon
  getMajelisRayonDocuments: async () => {
    const response = await axios.get("/dokumen/majelis/rayon");
    return response.data;
  },

  // Export documents data
  exportData: async (filters, exportConfig) => {
    const response = await axios.post("/dokumen/export", {
      filters,
      exportConfig,
    });
    return response.data;
  },

  // Get document statistics
  getStatistics: async (params = {}) => {
    const response = await axios.get("/dokumen/statistics", { params });
    return response.data;
  },

  // Get documents by jemaat ID
  getByJemaatId: async (jemaatId) => {
    const response = await axios.get(`/dokumen/jemaat/${jemaatId}`);
    return response.data;
  },

  // Replace existing document
  replace: async (dokumenId, formData) => {
    const response = await axios.patch(`/dokumen/replace`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default dokumenJemaatService;
