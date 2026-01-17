import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Heart,
  MapPin,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import pernikahanService from "@/services/pernikahanService";
import { showToast } from "@/utils/showToast";

export default function PernikahanDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: pernikahan,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pernikahan", id],
    queryFn: () => pernikahanService.getById(id),
    enabled: !!id,
  });

  const handleDelete = async () => {
    try {
      await pernikahanService.delete(id);
      showToast({
        title: "Berhasil",
        description: "Data pernikahan berhasil dihapus",
        color: "success",
      });
      queryClient.invalidateQueries(["pernikahan"]);
      router.push("/employee/lainnya/pernikahan");
    } catch (error) {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus data pernikahan",
        color: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Memuat detail pernikahan...
          </p>
        </div>
      </div>
    );
  }

  if (error || !pernikahan?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Gagal memuat detail pernikahan
          </p>
          <Button onClick={() => router.push("/employee/lainnya/pernikahan")}>Kembali</Button>
        </div>
      </div>
    );
  }

  const data = pernikahan.data;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Lainnya", href: "/employee/lainnya" },
          { label: "Data Pernikahan", href: "/employee/lainnya/pernikahan" },
          { label: "Detail" },
        ]}
        description="Detail informasi pernikahan jemaat"
        title="Detail Pernikahan"
      />

      <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="mb-6 flex items-center justify-between">
          <Button
            className="flex items-center"
            variant="outline"
            onClick={() => router.push("/employee/lainnya/pernikahan")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="flex items-center gap-2">
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() => router.push(`/employee/lainnya/pernikahan/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              className="flex items-center"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Pernikahan */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Informasi Pernikahan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tanggal Pernikahan
                    </label>
                    <p className="text-gray-900 dark:text-white transition-colors">
                      {formatDate(data.tanggal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Klasis
                    </label>
                    <p className="text-gray-900 dark:text-white transition-colors">
                      {data.klasis?.nama || "-"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 transition-colors">
                    <p>
                      Dibuat:{" "}
                      {new Date(data.createdAt).toLocaleDateString("id-ID")}
                    </p>
                    <p>
                      Diperbarui:{" "}
                      {new Date(data.updatedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Pasangan */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-500" />
                  Pasangan ({data.jemaats?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.jemaats && data.jemaats.length > 0 ? (
                  <div className="space-y-4">
                    {data.jemaats.map((jemaat, index) => (
                      <div
                        key={jemaat.id}
                        className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              jemaat.jenisKelamin ? "bg-blue-500" : "bg-pink-500"
                            }`}
                          >
                            {jemaat.jenisKelamin ? "♂" : "♀"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {jemaat.nama}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"}
                            </p>
                            {jemaat.keluarga && (
                              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>
                                  Bag. {jemaat.keluarga.noBagungan || "-"} • {jemaat.keluarga.rayon?.namaRayon || "-"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada data pasangan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        confirmText="Hapus"
        isOpen={showDeleteDialog}
        message={`Yakin ingin menghapus data pernikahan ini? Tindakan ini tidak dapat dibatalkan.`}
        title="Hapus Data Pernikahan"
        variant="danger"
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}