import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Helper function to convert base64 to blob and download
const downloadAttachment = (attachment) => {
  try {
    // Convert base64 to binary
    const byteCharacters = atob(attachment.base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create blob
    const blob = new Blob([byteArray], { type: attachment.fileType });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("Terjadi kesalahan saat mengunduh file");
  }
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to get file icon
const getFileIcon = (fileType) => {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="w-5 h-5 text-blue-600" />;
  }

  return <FileText className="w-5 h-5 text-gray-600" />;
};

// Attachment item component
const AttachmentItem = ({ attachment }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        {getFileIcon(attachment.fileType)}
        <div>
          <p className="font-medium text-gray-900">{attachment.fileName}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(attachment.fileSize)} • {attachment.fileType}
          </p>
        </div>
      </div>
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        onClick={() => downloadAttachment(attachment)}
      >
        <Download className="w-4 h-4" />
        <span>Unduh</span>
      </button>
    </div>
  );
};

export default function News() {
  const router = useRouter();
  const { newsId } = router.query;
  const [news, setNews] = useState(null);

  useEffect(() => {
    if (!newsId) return;
    async function fetchNewsDetail() {
      const res = await fetch(`/api/pengumuman/${newsId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setNews(data.data);
      }
    }
    fetchNewsDetail();
  }, [newsId]);

  if (!news) {
    return (
      <div className="min-h-screen py-24 px-4 md:px-24 bg-gray-100">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* content */}
      <div className="pt-24 px-4 md:px-24 pb-24 text-black w-full text-justify">
        <h1 className="text-3xl font-bold">{news.judul}</h1>
        <div className="mt-2 text-sm text-gray-600 flex gap-4">
          <span>Kategori: {news.kategori?.nama}</span>
          <span>Jenis: {news.jenis?.nama}</span>
          <span>
            Tanggal:{" "}
            {new Date(news.tanggalPengumuman).toLocaleDateString("id-ID")}
          </span>
        </div>
        <div className="mt-6">
          <p className="text-lg">{news.konten?.deskripsi || ""}</p>
          {news.konten?.informasiLainnya && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg">Informasi Lainnya:</h3>
              <p className="mt-2">{news.konten.informasiLainnya}</p>
            </div>
          )}
        </div>

        {/* Attachments Section */}
        {news.attachments && news.attachments.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">Lampiran:</h3>
            <div className="space-y-3">
              {news.attachments.map((attachment, index) => (
                <AttachmentItem key={index} attachment={attachment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
