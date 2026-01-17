import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Plus,
  ToggleLeft,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

import ProfilPendetaModal from "./ProfilPendetaModal";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import profilPendetaService from "@/services/profilPendetaService";
import { showToast } from "@/utils/showToast";
import { useUser } from "@/hooks/useUser";

const ProfilPendetaList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const { user: authData } = useUser();

  const queryClient = useQueryClient();

  // Fetch all pastor profiles
  const {
    data: profilesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profil-pendeta"],
    queryFn: () => profilPendetaService.getAll(),
  });

  const profiles = profilesData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => profilPendetaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["profil-pendeta"]);
      queryClient.invalidateQueries(["profil-pendeta-active"]);
      showToast({
        title: "Berhasil",
        description: "Profil pendeta berhasil dihapus",
        color: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus profil",
        color: "error",
      });
    },
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      profilPendetaService.toggleActive(id, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["profil-pendeta"]);
      queryClient.invalidateQueries(["profil-pendeta-active"]);
      showToast({
        title: "Berhasil",
        description: `Profil pendeta berhasil ${variables.isActive ? "diaktifkan" : "dinonaktifkan"}`,
        color: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal mengubah status",
        color: "error",
      });
    },
  });

  const handleCreateNew = () => {
    setModalMode("create");
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (profile) => {
    setModalMode("edit");
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleDelete = (profile) => {
    setDeleteTarget(profile);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = (profile) => {
    setToggleTarget(profile);
    setShowToggleConfirm(true);
  };

  const confirmToggle = () => {
    if (toggleTarget) {
      const newStatus = !toggleTarget.isActive;
      toggleMutation.mutate({ id: toggleTarget.id, isActive: newStatus });
      setShowToggleConfirm(false);
      setToggleTarget(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Memuat data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {error.response?.data?.message ||
              "Gagal memuat data profil pendeta"}
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
            Profil Pendeta
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola profil pendeta untuk ditampilkan di website
          </p>
        </div>
        {...(authData?.isAdmin ? [
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleCreateNew}
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Profil</span>
        </button>
        ] : [])}
      </div>

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Belum ada profil pendeta
          </p>
          {...(authData?.isAdmin ? [
            <button
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={handleCreateNew}
            >
            Tambah profil pertama
          </button>
          ] : [])}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                profile.isActive
                  ? "border-green-500 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 shadow"
              }`}
            >
              <div className="p-6">
                {/* Status Badge */}
                {profile.isActive && (
                  <div className="flex items-center space-x-1 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                      Aktif
                    </span>
                  </div>
                )}

                {/* Photo */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
                    {profile.urlFoto ? (
                      <img
                        alt={profile.nama}
                        className="w-full h-full object-cover"
                        src={profile.urlFoto}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
                  {profile.nama}
                </h3>

                {/* Metadata */}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                  <p>Dibuat: {formatDate(profile.createdAt)}</p>
                  {profile.updatedAt !== profile.createdAt && (
                    <p>Diperbarui: {formatDate(profile.updatedAt)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center space-x-2">
                   {...(authData?.isAdmin ? [
                     <>
                  <button
                    className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      profile.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    disabled={toggleMutation.isPending}
                    onClick={() => handleToggleStatus(profile)}
                  >
                    <ToggleLeft className="w-3 h-3" />
                    <span>{profile.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
                  </button>


                 
                  <button
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    onClick={() => handleEdit(profile)}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(profile)}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                    </>
                  ] : [])}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ProfilPendetaModal
        isOpen={isModalOpen}
        mode={modalMode}
        profile={selectedProfile}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Profil Pendeta"
        message={`Apakah Anda yakin ingin menghapus profil "${deleteTarget?.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        title={toggleTarget?.isActive ? "Nonaktifkan Profil" : "Aktifkan Profil"}
        message={
          toggleTarget?.isActive
            ? `Nonaktifkan profil "${toggleTarget?.nama}"?`
            : `Aktifkan profil "${toggleTarget?.nama}"? Ini akan menonaktifkan profil lain yang sedang aktif.`
        }
        confirmText={toggleTarget?.isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        cancelText="Batal"
        variant={toggleTarget?.isActive ? "warning" : "info"}
        onClose={() => {
          setShowToggleConfirm(false);
          setToggleTarget(null);
        }}
        onConfirm={confirmToggle}
      />
    </div>
  );
};

export default ProfilPendetaList;
