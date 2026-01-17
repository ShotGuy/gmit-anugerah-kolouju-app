"use client";
import { useState } from "react";

export default function FileUpload({
  uploadType = "uploads",
  onUploadSuccess,
  multiple = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (multiple) {
        // Multiple files
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
        formData.append("type", uploadType);

        const response = await fetch("/api/upload/multiple", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onUploadSuccess?.(result.data.uploaded);
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } else {
        // Single file
        formData.append("file", files[0]);
        formData.append("type", uploadType);

        const response = await fetch("/api/upload/single", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onUploadSuccess?.(result.data);
        } else {
          throw new Error(result.error || "Upload failed");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-container">
      <input
        accept="image/*,application/pdf"
        className="file-input"
        disabled={uploading}
        multiple={multiple}
        type="file"
        onChange={handleFileUpload}
      />

      {uploading && (
        <div className="upload-progress">
          <div>Uploading...</div>
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
