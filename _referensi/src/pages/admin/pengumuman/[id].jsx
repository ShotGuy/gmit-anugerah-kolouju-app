import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Edit,
  Eye,
  Download,
  Pin,
  Trash2,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

import pengumumanService from "@/services/pengumumanService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/utils/showToast";

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
    PUBLISHED: { color: "bg-green-100 text-green-800", label: "Published" },
    ARCHIVED: { color: "bg-yellow-100 text-yellow-800", label: "Archived" },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }) {
  const priorityConfig = {
    LOW: { color: "bg-blue-100 text-blue-800", label: "Low" },
    MEDIUM: { color: "bg-gray-100 text-gray-800", label: "Medium" },
    HIGH: { color: "bg-orange-100 text-orange-800", label: "High" },
    URGENT: { color: "bg-red-100 text-red-800", label: "Urgent" },
  };

  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export default function PengumumanDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  // Fetch pengumuman detail
  const {
    data: pengumumanData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pengumuman", id],
    queryFn: () => pengumumanService.getById(id),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: pengumumanService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Pengumuman berhasil dihapus",
        color: "success",
      });
      router.push("/admin/pengumuman");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal menghapus pengumuman",
        color: "danger",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy, HH:mm", {
        locale: idLocale,
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <PageHeader
          breadcrumb={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Pengumuman", href: "/admin/pengumuman" },
            { label: "Detail" },
          ]}
          title="Detail Pengumuman"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Pengumuman Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              {error.response?.data?.message ||
                "Pengumuman yang Anda cari tidak ditemukan"}
            </p>
            <Button variant="outline" onClick={() => router.push("/admin/pengumuman")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pengumuman = pengumumanData?.data || {};

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        actions={[
          {
            label: "Edit",
            onClick: () => router.push(`/admin/pengumuman/${id}/edit`),
            icon: Edit,
            variant: "outline",
          },
          {
            label: "Hapus",
            onClick: handleDelete,
            icon: Trash2,
            variant: "outline",
            className: "text-red-600 hover:text-red-700",
          },
        ]}
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Pengumuman", href: "/admin/pengumuman" },
          { label: "Detail" },
        ]}
        title="Detail Pengumuman"
      />

      {/* Back Button */}
      <div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/pengumuman")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl">{pengumuman.judul}</CardTitle>
                    {pengumuman.isPinned && (
                      <Pin className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bell className="h-4 w-4" />
                      {pengumuman.kategori?.nama}
                      {pengumuman.jenis?.nama && ` • ${pengumuman.jenis.nama}`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(pengumuman.tanggalPengumuman)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: pengumuman.konten || "Tidak ada konten",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Content */}
          {pengumuman.kontenDinamis && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: pengumuman.kontenDinamis,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {pengumuman.attachments && pengumuman.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lampiran ({pengumuman.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pengumuman.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        {attachment.type?.startsWith("image/") ? (
                          <ImageIcon className="h-8 w-8 text-blue-500" />
                        ) : (
                          <FileText className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {attachment.filename || `Lampiran ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {attachment.size && `${(attachment.size / 1024).toFixed(1)} KB`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/pengumuman/${id}/attachments`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Semua Lampiran
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengumuman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={pengumuman.status} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Prioritas</label>
                <div className="mt-1">
                  <PriorityBadge priority={pengumuman.prioritas} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tanggal Pengumuman
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(pengumuman.tanggalPengumuman)}
                </p>
              </div>

              {pengumuman.publishedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dipublikasi
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(pengumuman.publishedAt)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Dibuat
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(pengumuman.createdAt)}
                </p>
              </div>

              {pengumuman.updatedAt !== pengumuman.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Diperbarui
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(pengumuman.updatedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => router.push(`/admin/pengumuman/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Pengumuman
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/admin/pengumuman/${id}/attachments`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Kelola Lampiran
                </Button>
                <Button
                  className="w-full text-red-600 hover:text-red-700"
                  disabled={deleteMutation.isPending}
                  variant="outline"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}