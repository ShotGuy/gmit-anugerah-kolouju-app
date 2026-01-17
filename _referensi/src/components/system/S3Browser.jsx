import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Download,
  Eye,
  File,
  FileText,
  Folder,
  Image,
  Music,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useCallback, useState } from "react";

import { showToast } from "@/utils/showToast";

const S3Browser = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch S3 objects
  const {
    data: s3Data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["s3-objects", currentPath, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (currentPath) params.append("prefix", currentPath);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(
        `/api/admin/s3/objects?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch S3 objects");
      }

      return response.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (keys) => {
      const response = await fetch("/api/admin/s3/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });

      if (!response.ok) throw new Error("Failed to delete objects");

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["s3-objects"]);
      setSelectedFiles([]);
      showToast({
        title: "Berhasil",
        description: "File berhasil dihapus",
        color: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.message,
        color: "error",
      });
    },
  });

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    if (["mp3", "wav", "flac", "aac"].includes(extension)) {
      return <Music className="w-5 h-5 text-purple-600" />;
    }
    if (["mp4", "avi", "mkv", "mov", "webm"].includes(extension)) {
      return <Video className="w-5 h-5 text-green-600" />;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return <Archive className="w-5 h-5 text-orange-600" />;
    }

    return <File className="w-5 h-5 text-gray-600" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Navigate to folder
  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
    setSelectedFiles([]);
  };

  // Go back to parent folder
  const goBack = () => {
    const pathParts = currentPath.split("/").filter(Boolean);

    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
    setSelectedFiles([]);
  };

  // Toggle file selection
  const toggleFileSelection = (fileKey) => {
    setSelectedFiles((prev) =>
      prev.includes(fileKey)
        ? prev.filter((key) => key !== fileKey)
        : [...prev, fileKey]
    );
  };

  // Handle file upload
  const handleFileUpload = useCallback(async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("prefix", currentPath);

        const response = await fetch("/api/admin/s3/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      queryClient.invalidateQueries(["s3-objects"]);
      setUploadFiles([]);
      showToast({
        title: "Berhasil",
        description: `${uploadFiles.length} file berhasil diupload`,
        color: "success",
      });
    } catch (error) {
      showToast({
        title: "Gagal",
        description: error.message,
        color: "error",
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadFiles, currentPath, queryClient]);

  // Download file
  const downloadFile = async (fileKey) => {
    try {
      const response = await fetch(
        `/api/admin/s3/download?key=${encodeURIComponent(fileKey)}`
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileKey.split("/").pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showToast({
        title: "Gagal",
        description: "Gagal mengunduh file",
        color: "error",
      });
    }
  };

  // Delete selected files
  const deleteSelectedFiles = () => {
    if (selectedFiles.length === 0) return;

    if (window.confirm(`Hapus ${selectedFiles.length} file terpilih?`)) {
      deleteMutation.mutate(selectedFiles);
    }
  };

  const objects = s3Data?.data?.objects || [];
  const folders = s3Data?.data?.folders || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Memuat data S3...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 dark:text-red-400">
            Gagal memuat data S3: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            S3 Storage Browser
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola file dan folder di AWS S3 bucket
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => setCurrentPath("")}
          >
            Root
          </button>
          {currentPath
            .split("/")
            .filter(Boolean)
            .map((part, index, array) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">/</span>
                <button
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() =>
                    navigateToFolder(array.slice(0, index + 1).join("/"))
                  }
                >
                  {part}
                </button>
              </div>
            ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Cari file..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload File
          </h3>
        </div>

        <div className="flex items-center space-x-4">
          <input
            multiple
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            type="file"
            onChange={(e) => setUploadFiles(Array.from(e.target.files))}
          />
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            disabled={uploadFiles.length === 0 || isUploading}
            onClick={handleFileUpload}
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Uploading..." : "Upload"}</span>
          </button>
        </div>

        {uploadFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {uploadFiles.length} file siap diupload
            </p>
            <div className="space-y-1">
              {uploadFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded"
                >
                  <span>{file.name}</span>
                  <span className="text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300">
              {selectedFiles.length} file terpilih
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={deleteSelectedFiles}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        {currentPath && (
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={goBack}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* File Browser */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    checked={
                      selectedFiles.length === objects.length &&
                      objects.length > 0
                    }
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...objects.map((obj) => obj.key)]);
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Folders */}
              {folders.map((folder) => (
                <tr
                  key={folder}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="w-4 h-4" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Folder className="w-5 h-5 text-blue-600 mr-3" />
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() =>
                          navigateToFolder(
                            currentPath ? `${currentPath}/${folder}` : folder
                          )
                        }
                      >
                        {folder}/
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                </tr>
              ))}

              {/* Files */}
              {objects.map((object) => (
                <tr
                  key={object.key}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      checked={selectedFiles.includes(object.key)}
                      type="checkbox"
                      onChange={() => toggleFileSelection(object.key)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(object.key)}
                      <span className="ml-3 text-gray-900 dark:text-white">
                        {object.key.split("/").pop()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(object.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(object.lastModified).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Download"
                        onClick={() => downloadFile(object.key)}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800"
                        title="Preview"
                        onClick={() => window.open(object.url, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {folders.length === 0 && objects.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "Tidak ada file yang ditemukan" : "Folder kosong"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default S3Browser;
