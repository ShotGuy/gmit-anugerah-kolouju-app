import api from "@/lib/axios";

const pengumumanService = {
  // Get all pengumuman with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get("/pengumuman", { params });
    return response.data;
  },

  // Get pengumuman by ID
  getById: async (id) => {
    const response = await api.get(`/pengumuman/${id}`);
    return response.data;
  },

  // Get attachments only for specific pengumuman
  getAttachments: async (id) => {
    const response = await api.get(`/pengumuman/${id}/attachments`);
    return response.data;
  },

  // Create new pengumuman
  create: async (data) => {
    const response = await api.post("/pengumuman", data);
    return response.data;
  },

  // Update pengumuman
  update: async (id, data) => {
    const response = await api.put("/pengumuman", { ...data, id });
    return response.data;
  },

  // Delete pengumuman
  delete: async (id) => {
    const response = await api.delete("/pengumuman", { data: { id } });
    return response.data;
  },

  // Get options for dropdowns
  getOptions: async (type = "all", kategoriId = null) => {
    const params = { type };
    if (kategoriId) params.kategoriId = kategoriId;
    
    const response = await api.get("/pengumuman/options", { params });
    return response.data;
  },

  // Helper function to convert file to base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          base64Data: base64,
        });
      };
      reader.onerror = (error) => reject(error);
    });
  },

  // Helper function to validate file size
  validateFileSize: (file) => {
    const maxSizes = {
      'image': 1024 * 1024, // 1MB untuk gambar
      'application/pdf': 3 * 1024 * 1024, // 3MB untuk PDF
    };

    const fileTypeCategory = file.type.startsWith('image/') ? 'image' : file.type;
    const maxSize = maxSizes[fileTypeCategory];

    if (!maxSize) {
      throw new Error(`Tipe file ${file.type} tidak didukung`);
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(`File ${file.name} melebihi ukuran maksimal ${maxSizeMB}MB`);
    }

    return true;
  },

  // Helper function to process multiple files
  processFiles: async (files) => {
    if (!files || files.length === 0) return null;

    const processedFiles = [];
    
    for (const file of files) {
      // Validate file size
      pengumumanService.validateFileSize(file);
      
      // Convert to base64
      const fileData = await pengumumanService.fileToBase64(file);
      processedFiles.push(fileData);
    }

    return processedFiles;
  },

  // Helper function to get file download URL from base64
  getFileUrl: (attachment) => {
    if (!attachment || !attachment.base64Data || !attachment.fileType) {
      return null;
    }

    const blob = new Blob(
      [Uint8Array.from(atob(attachment.base64Data), c => c.charCodeAt(0))],
      { type: attachment.fileType }
    );

    return URL.createObjectURL(blob);
  },

  // Helper function to download file
  downloadFile: (attachment) => {
    const url = pengumumanService.getFileUrl(attachment);
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default pengumumanService;