import axios from "axios";

const BASE_URL = "/api/konten-landing-page";

const kontenLandingPageService = {
  // Get all konten with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(BASE_URL, { params });

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get konten by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get public konten by section
  getPublicBySection: async (section) => {
    try {
      const response = await axios.get(`${BASE_URL}/public`, {
        params: { section },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new konten
  create: async (data) => {
    try {
      const response = await axios.post(BASE_URL, data);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update konten
  update: async (data) => {
    try {
      const response = await axios.put(BASE_URL, data);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete konten
  delete: async (id) => {
    try {
      const response = await axios.delete(BASE_URL, { data: { id } });

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default kontenLandingPageService;
