import api from "@/lib/axios";

const galeriService = {
  // Get all galeri with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get("/galeri", { params });
    return response.data;
  },

  // Get galeri by ID
  getById: async (id) => {
    const response = await api.get(`/galeri/${id}`);
    return response.data;
  },

  // Create new galeri
  create: async (data) => {
    const response = await api.post("/galeri", data);
    return response.data;
  },

  // Update galeri
  update: async (id, data) => {
    const response = await api.patch(`/galeri/${id}`, data);
    return response.data;
  },

  // Delete galeri by ID
  deleteById: async (id) => {
    const response = await api.delete(`/galeri/${id}`);
    return response.data;
  },

  // Delete galeri (soft delete) - legacy method
  delete: async (id) => {
    const response = await api.delete("/galeri", { data: { id } });
    return response.data;
  },

  // Upload photos to S3
  uploadPhotos: async (files) => {
    const formData = new FormData();
    
    // Append files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    const response = await api.post("/galeri/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Helper function untuk validasi file
  validateFiles: (files) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFiles = 10;

    if (!files || files.length === 0) {
      throw new Error('Pilih minimal 1 foto untuk diupload');
    }

    if (files.length > maxFiles) {
      throw new Error(`Maksimal ${maxFiles} foto yang dapat diupload sekaligus`);
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} bukan format gambar yang didukung`);
      }

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} melebihi ukuran maksimal 5MB`);
      }
    }

    return true;
  },

  // Helper untuk format tanggal
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  },

  // Helper untuk generate thumbnail URL (jika S3 support resizing)
  getThumbnailUrl: (originalUrl, size = 300) => {
    // Untuk sekarang return original URL
    // Bisa dimodifikasi jika menggunakan image processing service
    return originalUrl;
  },
};

export default galeriService;