"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Edit,
  MapPin,
  Plus,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";

export default function KelolaRayonMajelisPage() {
  const router = useRouter();
  const { rayonId } = router.query;
  const queryClient = useQueryClient();

  const [isEditPermissionOpen, setIsEditPermissionOpen] = useState(false);
  const [selectedMajelis, setSelectedMajelis] = useState(null);
  const [permissions, setPermissions] = useState({
    isUtama: false,
    canView: true,
    canEdit: false,
    canCreate: false,
    canDelete: false,
    canManageRayon: false,
  });

  // Query untuk get rayon detail
  const { data: rayonData, isLoading: rayonLoading } = useQuery({
    queryKey: ["rayon-detail", rayonId],
    queryFn: async () => {
      const response = await axios.get(`/api/rayon/${rayonId}`);
      return response.data.data;
    },
    enabled: !!rayonId,
  });

  // Query untuk get majelis by rayon
  const { data: majelisData, isLoading: majelisLoading } = useQuery({
    queryKey: ["majelis-by-rayon", rayonId],
    queryFn: async () => {
      const response = await axios.get(`/api/majelis/rayon/${rayonId}`);
      return response.data.data;
    },
    enabled: !!rayonId,
  });

  // Mutation untuk update permission
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ majelisId, permissions }) => {
      const response = await axios.patch(`/api/majelis/${majelisId}`, {
        ...selectedMajelis,
        ...permissions,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Permission berhasil diperbarui");
      queryClient.invalidateQueries(["majelis-by-rayon", rayonId]);
      setIsEditPermissionOpen(false);
      setSelectedMajelis(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui permission"
      );
    },
  });

  // Mutation untuk delete majelis
  const deleteMutation = useMutation({
    mutationFn: async (majelisId) => {
      const response = await axios.delete(`/api/majelis/${majelisId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Majelis berhasil dihapus");
      queryClient.invalidateQueries(["majelis-by-rayon", rayonId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus majelis");
    },
  });

  const handleEditPermission = (majelis) => {
    setSelectedMajelis(majelis);
    setPermissions({
      isUtama: majelis.isUtama || false,
      canView: majelis.canView || true,
      canEdit: majelis.canEdit || false,
      canCreate: majelis.canCreate || false,
      canDelete: majelis.canDelete || false,
      canManageRayon: majelis.canManageRayon || false,
    });
    setIsEditPermissionOpen(true);
  };

  const handleUpdatePermission = () => {
    if (!selectedMajelis) return;
    updatePermissionMutation.mutate({
      majelisId: selectedMajelis.id,
      permissions,
    });
  };

  const handleDelete = (majelis) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus majelis ${majelis.namaLengkap}?`
      )
    ) {
      deleteMutation.mutate(majelis.id);
    }
  };

  const getPermissionBadge = (majelis) => {
    if (majelis.isUtama) {
      return (
        <Badge className="bg-purple-600 text-white">Majelis Utama</Badge>
      );
    }
    if (majelis.canManageRayon && !majelis.canEdit) {
      return <Badge variant="outline">Koordinator Rayon</Badge>;
    }
    return <Badge variant="secondary">Majelis Biasa</Badge>;
  };

  if (rayonLoading || majelisLoading) {
    return <LoadingScreen isLoading={true} message="Memuat data rayon dan majelis..." />;
  }

  const majelisList = majelisData?.items || [];
  const rayon = rayonData || {};

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          {
            label: "Manajemen Rayon & Majelis",
            href: "/admin/manajemen-rayon-majelis",
          },
          { label: rayon.namaRayon || "Detail Rayon" },
        ]}
        description={`Kelola majelis di ${rayon.namaRayon || "rayon ini"}`}
        title={`Kelola Majelis - ${rayon.namaRayon || ""}`}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <Button
          className="mb-4"
          size="sm"
          variant="outline"
          onClick={() => router.push("/admin/manajemen-rayon-majelis")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        {/* Rayon Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <CardTitle className="text-2xl">
                    {rayon.namaRayon}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {rayon._count?.keluargas || 0} Keluarga Terdaftar
                  </p>
                </div>
              </div>
              <Button
                onClick={() =>
                  router.push("/admin/majelis/create?rayon=" + rayonId)
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Majelis
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Majelis List */}
        {majelisList.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum Ada Majelis
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Belum ada majelis yang ditugaskan di rayon ini
                </p>
                <Button
                  onClick={() =>
                    router.push("/admin/majelis/create?rayon=" + rayonId)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Majelis
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {majelisList.map((majelis) => (
              <Card key={majelis.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {majelis.namaLengkap}
                        </h3>
                        {getPermissionBadge(majelis)}
                        {majelis.User?.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            Akun Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Belum Ada Akun</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Jabatan</p>
                          <p className="text-sm font-medium">
                            {majelis.jenisJabatan?.namaJabatan || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Periode</p>
                          <p className="text-sm font-medium">
                            {new Date(majelis.mulai).toLocaleDateString(
                              "id-ID"
                            )}{" "}
                            -{" "}
                            {majelis.selesai
                              ? new Date(majelis.selesai).toLocaleDateString(
                                  "id-ID"
                                )
                              : "Sekarang"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Jemaat</p>
                          <p className="text-sm font-medium">
                            {majelis.jemaat?.nama || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Permission Info */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          <Shield className="h-3 w-3 inline mr-1" />
                          Permission:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {majelis.canView && (
                            <Badge className="text-xs" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              View
                            </Badge>
                          )}
                          {majelis.canEdit && (
                            <Badge className="text-xs" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Edit
                            </Badge>
                          )}
                          {majelis.canCreate && (
                            <Badge className="text-xs" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Create
                            </Badge>
                          )}
                          {majelis.canDelete && (
                            <Badge className="text-xs" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Delete
                            </Badge>
                          )}
                          {majelis.canManageRayon && (
                            <Badge className="text-xs" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Kelola Rayon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPermission(majelis)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(majelis)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Edit Permission */}
        {isEditPermissionOpen && selectedMajelis && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Edit Permission</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditPermissionOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedMajelis.namaLengkap}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Warning untuk isUtama */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        Hanya boleh 1 Majelis Utama per rayon. Jika mengaktifkan
                        ini, majelis utama lain akan otomatis menjadi non-utama.
                      </p>
                    </div>
                  </div>

                  {/* Permission Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        checked={permissions.isUtama}
                        className="w-4 h-4"
                        type="checkbox"
                        onChange={(e) =>
                          setPermissions((prev) => ({
                            ...prev,
                            isUtama: e.target.checked,
                            // Jika isUtama, aktifkan semua permission
                            ...(e.target.checked
                              ? {
                                  canView: true,
                                  canEdit: true,
                                  canCreate: true,
                                  canDelete: true,
                                  canManageRayon: true,
                                }
                              : {}),
                          }))
                        }
                      />
                      <span className="text-sm font-medium">
                        Majelis Utama (Full Access)
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        checked={permissions.canView}
                        className="w-4 h-4"
                        disabled={permissions.isUtama}
                        type="checkbox"
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            canView: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">View</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        checked={permissions.canEdit}
                        className="w-4 h-4"
                        disabled={permissions.isUtama}
                        type="checkbox"
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            canEdit: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">Edit</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        checked={permissions.canCreate}
                        className="w-4 h-4"
                        disabled={permissions.isUtama}
                        type="checkbox"
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            canCreate: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">Create</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        checked={permissions.canDelete}
                        className="w-4 h-4"
                        disabled={permissions.isUtama}
                        type="checkbox"
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            canDelete: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">Delete</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        checked={permissions.canManageRayon}
                        className="w-4 h-4"
                        disabled={permissions.isUtama}
                        type="checkbox"
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            canManageRayon: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">Kelola Rayon</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setIsEditPermissionOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={updatePermissionMutation.isPending}
                      onClick={handleUpdatePermission}
                    >
                      {updatePermissionMutation.isPending
                        ? "Menyimpan..."
                        : "Simpan"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

KelolaRayonMajelisPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
