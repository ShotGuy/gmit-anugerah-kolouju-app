import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Paperclip,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import pengumumanService from "@/services/pengumumanService";

// Loading Skeleton
function AttachmentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-5 bg-gray-300 rounded" />
              <div className="h-8 w-16 bg-gray-300 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// File Preview Modal
function FilePreviewModal({ file, isOpen, onClose }) {
  if (!isOpen || !file) return null;

  const isImage = file.fileType?.startsWith("image/");
  const fileUrl = pengumumanService.getFileUrl(file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-4xl w-full mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{file.fileName}</h3>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {isImage ? (
            <div className="max-h-96 overflow-hidden flex justify-center">
              <img
                alt={file.fileName}
                className="max-w-full h-auto rounded-lg"
                src={fileUrl}
                style={{ maxHeight: "24rem" }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Preview tidak tersedia untuk file PDF
              </p>
              <Button
                className="inline-flex items-center gap-2"
                onClick={() => pengumumanService.downloadFile(file)}
              >
                <Download className="h-4 w-4" />
                Download File
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => pengumumanService.downloadFile(file)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

// File Card Component
function FileCard({ file, onPreview, onDownload }) {
  const isImage = file.fileType?.startsWith("image/");
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isImage ? (
            <ImageIcon className="h-5 w-5 text-blue-500" />
          ) : (
            <FileText className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {isImage ? "Gambar" : "PDF"}
          </span>
        </div>

        <div className="flex gap-2">
          {isImage && (
            <Button
              className="p-2"
              size="sm"
              variant="outline"
              onClick={() => onPreview(file)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            className="p-2"
            size="sm"
            variant="outline"
            onClick={() => onDownload(file)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
          {file.fileName}
        </h4>
        <p className="text-xs text-gray-500">
          {formatFileSize(file.fileSize)} • {file.fileType}
        </p>
      </div>
    </div>
  );
}

export default function AttachmentsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch attachments data
  const {
    data: attachmentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pengumuman-attachments", id],
    queryFn: () => pengumumanService.getAttachments(id),
    enabled: !!id,
  });

  const handlePreview = (file) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleDownload = (file) => {
    pengumumanService.downloadFile(file);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <PageHeader
          breadcrumb={[
            { label: "Majelis", href: "/majelis/dashboard" },
            { label: "Pengumuman", href: "/majelis/pengumuman" },
            { label: "Lampiran" },
          ]}
          title="Lampiran Pengumuman"
        />

        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gagal Memuat Lampiran
            </h3>
            <p className="text-gray-600 mb-4">
              {error.response?.data?.message ||
                "Terjadi kesalahan saat memuat lampiran"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/majelis/pengumuman")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pengumuman = attachmentsData?.data || {};
  const attachments = pengumuman.attachments || [];
  const totalAttachments = pengumuman.totalAttachments || 0;

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        breadcrumb={[
          { label: "Majelis", href: "/majelis/dashboard" },
          { label: "Pengumuman", href: "/majelis/pengumuman" },
          { label: "Lampiran" },
        ]}
        description={`${totalAttachments} file lampiran`}
        title={`Lampiran: ${pengumuman.judul || "Loading..."}`}
      />

      {/* Back Button */}
      <div>
        <Button
          variant="outline"
          onClick={() => router.push("/majelis/pengumuman")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Pengumuman
        </Button>
      </div>

      {/* Pengumuman Info */}
      {!isLoading && pengumuman.judul && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Paperclip className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {pengumuman.judul}
                </h3>
                <p className="text-sm text-gray-600">
                  {pengumuman.kategori?.nama}
                  {pengumuman.jenis?.nama && ` • ${pengumuman.jenis.nama}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Lampiran File ({totalAttachments})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AttachmentsSkeleton />
          ) : attachments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((file, index) => (
                  <FileCard
                    key={index}
                    file={file}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                  />
                ))}
              </div>

              {/* Bulk Download */}
              {attachments.length > 1 && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    className="inline-flex items-center gap-2"
                    onClick={() => {
                      attachments.forEach((file) => {
                        setTimeout(
                          () => pengumumanService.downloadFile(file),
                          100
                        );
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Semua ({attachments.length} file)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Lampiran
              </h3>
              <p className="text-gray-600">
                Pengumuman ini tidak memiliki file lampiran.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
