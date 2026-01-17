import axios from "@/lib/axios";

export const pegawaiService = {
    // Get all pegs with pagination
    getAll: async (params) => {
        const response = await axios.get("/pegawai", { params });
        return response.data;
    },

    // Get peg by ID
    getById: async (id) => {
        const response = await axios.get(`/pegawai/${id}`);
        return response.data;
    },

    // Create new peg with account
    create: async (data) => {
        const response = await axios.post("/pegawai/create-with-account", data);
        return response.data;
    },

    // Update peg
    update: async (id, data) => {
        const response = await axios.patch(`/pegawai/${id}`, data);
        return response.data;
    },

    // Delete peg
    delete: async (id) => {
        const response = await axios.delete(`/pegawai/${id}`);
        return response.data;
    },
};

export default pegawaiService;
