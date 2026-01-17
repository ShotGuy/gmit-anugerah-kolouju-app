import axios from "@/lib/axios";

const userService = {
  // Get all users with pagination and search
  getAll: async (params = {}) => {
    const response = await axios.get("/users", { params });

    return response.data;
  },

  // Get user by ID
  getById: async (id) => {
    const response = await axios.get(`/users/${id}`);

    return response.data;
  },

  // Create new user
  create: async (data) => {
    const response = await axios.post("/users", data);

    return response.data;
  },

  // Update user
  update: async (id, data) => {
    const response = await axios.patch(`/users/${id}`, data);

    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await axios.delete(`/users/${id}`);

    return response.data;
  },
};

export default userService;
