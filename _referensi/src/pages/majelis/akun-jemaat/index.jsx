import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CreateModal from "@/components/ui/CreateModal";
import EditModal from "@/components/ui/EditModal";
import ListGrid from "@/components/ui/ListGrid";
import PhoneInput from "@/components/ui/PhoneInput";
import ViewModal from "@/components/ui/ViewModal";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";
import jemaatService from "@/services/jemaatService";
import keluargaService from "@/services/keluargaService";

function MajelisAkunJemaatPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get majelis permissions
  const majelisPermissions = user?.majelis || {};
  const { canView = true, canEdit = false, canCreate = false, canDelete = false } = majelisPermissions;

  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [jemaatOptions, setJemaatOptions] = useState([]);
  const [keluargaOptions, setKeluargaOptions] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [rayonInfo, setRayonInfo] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedUserForInvitation, setSelectedUserForInvitation] =
    useState(null);
  const [showAccountDataModal, setShowAccountDataModal] = useState(false);
  const [selectedUserForAccountData, setSelectedUserForAccountData] =
    useState(null);
  const fileInputRef = useRef(null);

  // Fetch users data for majelis's rayon
  const { data, isLoading, error } = useQuery({
    queryKey: ["majelis-users"],
    queryFn: async () => {
      const response = await axios.get("/majelis/users");

      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // Update rayon info when data is loaded
  useEffect(() => {
    if (data?.data?.rayonInfo) {
      setRayonInfo(data.data.rayonInfo);
    }
  }, [data]);

  // Fetch jemaat and keluarga options for the rayon
  useEffect(() => {
    const fetchOptions = async () => {
      if (!user?.majelis?.idRayon) return;

      try {
        // Fetch jemaat options
        const jemaatResponse = await jemaatService.getAll({
          limit: 1000,
          idRayon: user.majelis.idRayon,
        });

        const jemaatOptions =
          jemaatResponse.data?.items?.map((jemaat) => ({
            value: jemaat.id,
            label: `${jemaat.nama} (${jemaat.keluarga?.noBagungan || "No Bangunan"})`,
          })) || [];

        setJemaatOptions(jemaatOptions);

        // Fetch keluarga options
        const keluargaResponse = await keluargaService.getAll({
          limit: 1000,
          idRayon: user.majelis.idRayon,
        });
        const keluargaOptions =
          keluargaResponse.data?.items?.map((keluarga) => {
            const kepalaKeluarga = keluarga.jemaats?.find(
              (j) => j.statusDalamKeluarga?.status === "Kepala Keluarga"
            );
            const displayName =
              kepalaKeluarga?.nama || `Bangunan ${keluarga.noBagungan}`;

            return {
              value: keluarga.id,
              label: `${displayName} - ${keluarga.rayon?.namaRayon || "Rayon"}`,
            };
          }) || [];

        setKeluargaOptions(keluargaOptions);
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };

    fetchOptions();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "username",
      label: "Username",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm font-medium">
          <User className="w-4 h-4 mr-2 text-blue-500" />
          {value || "-"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      render: (value) => (
        <span className="flex items-center text-sm">
          <Mail className="w-4 h-4 mr-2 text-gray-400" />
          {value || "-"}
        </span>
      ),
    },
    {
      key: "noWhatsapp",
      label: "No. WhatsApp",
      type: "custom",
      component: PhoneInput,
      render: (value) => (
        <span className="flex items-center text-sm">
          <Phone className="w-4 h-4 mr-2 text-green-500" />
          {value || "-"}
        </span>
      ),
    },
    {
      key: "jemaat",
      label: "Nama Jemaat",
      type: "text",
      render: (value) => value?.nama || "-",
    },
    {
      key: "jenisKelamin",
      label: "Jenis Kelamin",
      type: "text",
      render: (value, row) => {
        const gender = row.jemaat?.jenisKelamin;

        if (gender === null || gender === undefined) return "-";

        return (
          <span className="flex items-center text-sm">
            {gender ? (
              <>
                <UserCheck className="w-4 h-4 mr-1 text-blue-500" />
                Laki-laki
              </>
            ) : (
              <>
                <UserX className="w-4 h-4 mr-1 text-pink-500" />
                Perempuan
              </>
            )}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Tgl Dibuat",
      type: "text",
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
  ];

  const viewFields = [
    { key: "id", label: "ID" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "noWhatsapp", label: "No. WhatsApp" },
    {
      key: "role",
      label: "Role",
      getValue: (item) => item?.role || "-",
    },
    {
      key: "jemaat",
      label: "Nama Jemaat",
      getValue: (item) => item?.jemaat?.nama || "-",
    },
    {
      key: "jenisKelamin",
      label: "Jenis Kelamin",
      getValue: (item) => {
        const gender = item?.jemaat?.jenisKelamin;

        if (gender === null || gender === undefined) return "-";

        return gender ? "Laki-laki" : "Perempuan";
      },
    },
    {
      key: "tanggalLahir",
      label: "Tanggal Lahir",
      getValue: (item) =>
        item?.jemaat?.tanggalLahir ? formatDate(item.jemaat.tanggalLahir) : "-",
    },
    {
      key: "createdAt",
      label: "Tanggal Dibuat",
      getValue: (item) => formatDate(item?.createdAt),
    },
  ];

  const formFields = [
    {
      key: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "Masukkan username (unik)",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Masukkan email user",
    },
    {
      key: "noWhatsapp",
      label: "No. WhatsApp",
      type: "tel",
      required: false,
      placeholder: "Masukkan nomor WhatsApp (opsional)",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Masukkan password",
    },
    {
      key: "idJemaat",
      label: "Pilih Jemaat (Opsional)",
      type: "select",
      options: jemaatOptions,
      placeholder: "Pilih jemaat untuk akun ini",
    },
  ];

  // Format nomor WhatsApp dengan prefix +62
  const formatWhatsAppNumber = (number) => {
    if (!number) return null;

    // Remove all non-numeric characters
    let cleaned = number.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("62")) {
      // Already has 62 prefix
      return `+${cleaned}`;
    } else if (cleaned.startsWith("0")) {
      // Remove leading 0 and add +62
      return `+62${cleaned.substring(1)}`;
    } else {
      // Assume it's already without prefix
      return `+62${cleaned}`;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/majelis/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majelis-users"] });
      toast.success("Akun jemaat berhasil dihapus");
      setDeleteItem(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Gagal menghapus akun jemaat"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      // Format WhatsApp number if provided
      const cleanData = { ...data };

      if (cleanData.noWhatsapp && cleanData.noWhatsapp !== "") {
        cleanData.noWhatsapp = formatWhatsAppNumber(cleanData.noWhatsapp);
      } else {
        cleanData.noWhatsapp = null;
      }

      return axios.patch(`/majelis/users/${id}`, cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majelis-users"] });
      toast.success("Akun jemaat berhasil diperbarui");
      setEditItem(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Gagal memperbarui akun jemaat"
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Clean up the data before sending
      const cleanData = { ...data };

      // Convert empty strings to null or undefined for optional fields
      if (!cleanData.idJemaat || cleanData.idJemaat === "") {
        cleanData.idJemaat = null;
      }

      // Format WhatsApp number with +62 prefix
      if (cleanData.noWhatsapp && cleanData.noWhatsapp !== "") {
        cleanData.noWhatsapp = formatWhatsAppNumber(cleanData.noWhatsapp);
      } else {
        cleanData.noWhatsapp = null;
      }

      return axios.post("/majelis/users", cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majelis-users"] });
      toast.success("Akun jemaat berhasil ditambahkan");
      setShowCreate(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Gagal menambahkan akun jemaat"
      );
    },
  });

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get("/majelis/users/template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `template_import_akun_jemaat_rayon_${rayonInfo?.namaRayon || "data"}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Template berhasil diunduh");
    } catch (error) {
      console.error("Download template error:", error);
      toast.error("Gagal mengunduh template");
    }
  };

  // Handle import file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImportFile(file);
    }
  };

  // Import mutation with 60 second timeout
  const importMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post("/majelis/users/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["majelis-users"] });
      setImportResults(data.data);
      setShowImportModal(false);
      setImportFile(null);

      if (data.data.summary.failed === 0) {
        toast.success(
          `Berhasil import ${data.data.summary.success} akun jemaat`
        );
      } else {
        toast.warning(
          `Import selesai: ${data.data.summary.success} berhasil, ${data.data.summary.failed} gagal`
        );
      }
    },
    onError: (error) => {
      console.error("Import error:", error);
      toast.error(
        error?.response?.data?.message || "Gagal import data akun jemaat"
      );
    },
  });

  const handleImportSubmit = () => {
    if (!importFile) {
      toast.error("Pilih file Excel terlebih dahulu");

      return;
    }

    importMutation.mutate(importFile);
  };

  const invitationMutation = useMutation({
    mutationFn: async ({ userId, keluargaId, whatsappNumber, password }) => {
      const response = await axios.post("/auth/generate-invitation", {
        userId,
        keluargaId,
        whatsappNumber,
        password,
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Undangan berhasil dibuat!");

      // Open WhatsApp URL
      if (data.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, "_blank");
      }

      setShowInvitationModal(false);
      setSelectedUserForInvitation(null);
    },
    onError: (error) => {
      console.error("Invitation error:", error);
      toast.error(error?.response?.data?.message || "Gagal membuat undangan");
    },
  });

  const accountDataMutation = useMutation({
    mutationFn: async ({ userId, whatsappNumber, tempPassword }) => {
      const response = await axios.post("/auth/send-account-data", {
        userId,
        whatsappNumber,
        tempPassword,
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Data akun berhasil disiapkan!");

      // Open WhatsApp URL
      if (data.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, "_blank");
      }

      setShowAccountDataModal(false);
      setSelectedUserForAccountData(null);
    },
    onError: (error) => {
      console.error("Account data error:", error);
      toast.error(error?.response?.data?.message || "Gagal mengirim data akun");
    },
  });

  const handleSendInvitation = (user) => {
    if (user.role !== "JEMAAT") {
      toast.error("Hanya user dengan role JEMAAT yang dapat diundang");

      return;
    }

    if (user.idJemaat) {
      toast.error("User sudah memiliki profil lengkap");

      return;
    }

    if (!user.noWhatsapp) {
      toast.error("User belum memiliki nomor WhatsApp");

      return;
    }

    setSelectedUserForInvitation(user);
    setShowInvitationModal(true);
  };

  const handleSendAccountData = (user) => {
    if (!user.noWhatsapp) {
      toast.error("User belum memiliki nomor WhatsApp");

      return;
    }

    setSelectedUserForAccountData(user);
    setShowAccountDataModal(true);
  };

  // Enhanced search function
  const enhancedSearch = (item, searchTerm) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search in username, email, name, and phone
    return (
      (item.username || "").toLowerCase().includes(searchLower) ||
      (item.email || "").toLowerCase().includes(searchLower) ||
      (item.noWhatsapp || "").toLowerCase().includes(searchLower) ||
      (item.jemaat?.nama || "").toLowerCase().includes(searchLower)
    );
  };

  // Create filter options based on available data
  const userFilters = [
    {
      key: "hasJemaat",
      label: "Status Profil",
      options: [
        { value: "true", label: "Profil Lengkap" },
        { value: "false", label: "Belum Lengkap" },
      ],
    },
    {
      key: "hasWhatsapp",
      label: "Status WhatsApp",
      options: [
        { value: "true", label: "Ada WhatsApp" },
        { value: "false", label: "Belum Ada WhatsApp" },
      ],
    },
  ];

  // Custom filter function
  const customFilterFunction = (item, filters) => {
    return Object.entries(filters).every(([filterKey, filterValue]) => {
      if (!filterValue || filterValue === "all") return true;

      switch (filterKey) {
        case "hasJemaat":
          const hasJemaat = !!item.idJemaat;

          return hasJemaat.toString() === filterValue;
        case "hasWhatsapp":
          const hasWhatsapp = !!item.noWhatsapp;

          return hasWhatsapp.toString() === filterValue;
        default:
          return item[filterKey] === filterValue;
      }
    });
  };

  // Check if user has permission to view
  if (!canView) {
    return (
      <ProtectedRoute allowedRoles={["MAJELIS"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda tidak memiliki permission untuk mengelola akun jemaat. Hubungi admin untuk mengatur permission Anda.
              </p>
              <Button onClick={() => window.location.href = '/majelis/dashboard'}>
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["MAJELIS"]}>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/majelis/dashboard" },
          { label: "Kelola Akun Jemaat" },
        ]}
        columns={columns}
        customFilterFunction={customFilterFunction}
        customSearchFunction={enhancedSearch}
        data={data?.data?.items || []}
        description={`Kelola akun jemaat untuk rayon ${rayonInfo?.namaRayon || "Anda"}`}
        emptyStateProps={{
          title: "Belum Ada Akun Jemaat",
          description: "Mulai dengan menambahkan akun jemaat pertama",
          actionLabel: "Tambah Akun",
          onAction: () => setShowCreate(true),
        }}
        error={error}
        exportColumns={[
          {
            key: "username",
            label: "Username",
            type: "text",
          },
          {
            key: "email",
            label: "Email",
            type: "text",
          },
          {
            key: "noWhatsapp",
            label: "No WhatsApp",
            type: "text",
          },
          {
            key: "jemaat",
            label: "Nama Jemaat",
            render: (value) => value?.nama || "-",
          },
          {
            key: "jenisKelamin",
            label: "Jenis Kelamin",
            render: (value, row) => {
              const gender = row.jemaat?.jenisKelamin;

              if (gender === null || gender === undefined) return "-";

              return gender ? "Laki-laki" : "Perempuan";
            },
          },
          {
            key: "createdAt",
            label: "Tgl Dibuat",
            type: "datetime",
          },
        ]}
        exportFilename={`akun-jemaat-rayon-${rayonInfo?.namaRayon || "data"}`}
        exportable={true}
        filters={userFilters}
        headerActions={[
          ...(canCreate ? [
            {
              label: "Download Template",
              icon: Download,
              onClick: handleDownloadTemplate,
              variant: "outline",
            },
            {
              label: "Import Akun",
              icon: Upload,
              onClick: () => setShowImportModal(true),
              variant: "default",
            },
          ] : []),
        ]}
        isLoading={isLoading}
        itemsPerPage={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        rowActionType="horizontal"
        rowActions={[
          {
            icon: Eye,
            onClick: (item) => setViewItem(item),
            variant: "outline",
            tooltip: "Lihat detail",
          },
          ...(canEdit ? [{
            icon: Edit,
            onClick: (item) => setEditItem(item),
            variant: "outline",
            tooltip: "Edit akun",
          }] : []),
          {
            label: "Kirim Self Onboarding",
            icon: MessageCircle,
            onClick: (item) => handleSendInvitation(item),
            variant: "outline",
            tooltip: "Kirim Link Self Onboarding",
            condition: (item) =>
              canEdit && item.role === "JEMAAT" && !item.idJemaat && item.noWhatsapp,
          },
          {
            label: "Kirim Info Akun WA",
            icon: Send,
            onClick: (item) => handleSendAccountData(item),
            variant: "outline",
            tooltip: "Kirim Info Akun via WhatsApp",
            condition: (item) => canEdit && item.noWhatsapp,
          },
          ...(canDelete ? [{
            label: "Hapus",
            icon: Trash2,
            onClick: (item) => setDeleteItem(item),
            variant: "outline",
            tooltip: "Hapus akun",
          }] : []),
        ]}
        searchPlaceholder="Cari username, email, nama jemaat..."
        searchable={true}
        showPageSizeSelector={true}
        title="Kelola Akun Jemaat"
        onAdd={canCreate ? () => setShowCreate(true) : undefined}
      />

      <ConfirmDialog
        isLoading={deleteMutation.isPending}
        isOpen={!!deleteItem}
        message={`Apakah Anda yakin ingin menghapus akun "${deleteItem?.username}" (${deleteItem?.email})? Data yang sudah dihapus tidak dapat dikembalikan.`}
        title="Hapus Akun Jemaat"
        variant="danger"
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
      />

      <ViewModal
        data={
          viewItem && Array.isArray(viewFields)
            ? viewFields.map((field) => ({
                label: field.label,
                value: field.getValue
                  ? field.getValue(viewItem)
                  : viewItem?.[field.key],
              }))
            : []
        }
        isOpen={!!viewItem}
        title="Detail Akun Jemaat"
        onClose={() => setViewItem(null)}
      />

      <EditModal
        fields={formFields.filter((field) => field.key !== "password")} // Don't show password field in edit
        initialData={editItem}
        isLoading={updateMutation.isPending}
        isOpen={!!editItem}
        title="Edit Akun Jemaat"
        onClose={() => setEditItem(null)}
        onSubmit={(formData) =>
          updateMutation.mutate({ id: editItem.id, data: formData })
        }
      />

      <CreateModal
        fields={formFields}
        isLoading={createMutation.isPending}
        isOpen={showCreate}
        title="Tambah Akun Jemaat"
        onClose={() => setShowCreate(false)}
        onSubmit={(formData) => createMutation.mutate(formData)}
      />

      {/* Import Modal */}
      <CreateModal
        description="Upload file Excel untuk import akun jemaat. Download template terlebih dahulu untuk format yang benar."
        fields={[
          {
            key: "fileInfo",
            label: "File Excel",
            type: "custom",
            component: ({ value, onChange }) => (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    className="hidden"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Pilih File Excel
                  </button>
                  {importFile && (
                    <span className="text-sm text-gray-600">
                      {importFile.name}
                    </span>
                  )}
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Format Excel yang diperlukan:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>username - Username unik untuk login (wajib)</li>
                    <li>email - Email unik untuk user (wajib)</li>
                    <li>password - Password untuk user (wajib)</li>
                    <li>noWhatsapp - Nomor WhatsApp (opsional)</li>
                  </ul>
                  <p className="mt-2 text-sm text-blue-800 font-medium">
                    Semua akun yang diimport otomatis menjadi role JEMAAT
                  </p>
                </div>
              </div>
            ),
          },
        ]}
        isLoading={importMutation.isPending}
        isOpen={showImportModal}
        submitLabel="Import Data"
        title="Import Akun Jemaat dari Excel"
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
        }}
        onSubmit={handleImportSubmit}
      />

      {/* Import Results Modal */}
      {importResults && (
        <CreateModal
          description={`Total: ${importResults.summary.total} | Berhasil: ${importResults.summary.success} | Gagal: ${importResults.summary.failed}`}
          fields={[
            {
              key: "results",
              label: "Hasil Import",
              type: "custom",
              component: () => (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {importResults.summary.success > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h4 className="font-medium text-green-800 mb-2">
                        ✓ Berhasil ({importResults.summary.success})
                      </h4>
                      <div className="space-y-2">
                        {importResults.successDetails.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-green-700 pl-4"
                          >
                            Baris {item.row}: {item.user.username} (
                            {item.user.email})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importResults.summary.failed > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="font-medium text-red-800 mb-2">
                        ✗ Gagal ({importResults.summary.failed})
                      </h4>
                      <div className="space-y-2">
                        {importResults.failedDetails.map((item, idx) => (
                          <div key={idx} className="text-sm text-red-700 pl-4">
                            <div className="font-medium">Baris {item.row}:</div>
                            <div className="pl-4">
                              Error: {item.error}
                              <br />
                              Data: {JSON.stringify(item.data)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          isOpen={!!importResults}
          submitLabel="Tutup"
          title="Hasil Import Akun Jemaat"
          onClose={() => setImportResults(null)}
          onSubmit={() => setImportResults(null)}
        />
      )}

      {/* Invitation Modal */}
      <CreateModal
        description="Link self onboarding akan dikirim melalui WhatsApp yang berlaku selama 7 hari."
        fields={[
          {
            key: "userInfo",
            label: "Informasi User",
            type: "display",
            value: selectedUserForInvitation
              ? `${selectedUserForInvitation.username} (${selectedUserForInvitation.email})`
              : "-",
          },
          {
            key: "whatsappNumber",
            label: "No. WhatsApp",
            type: "custom",
            component: PhoneInput,
            value: selectedUserForInvitation?.noWhatsapp || "",
            placeholder: "Masukkan nomor WhatsApp jika kosong",
          },
          {
            key: "keluargaId",
            label: "Pilih Keluarga",
            type: "select",
            required: false,
            options: keluargaOptions,
            placeholder: "Pilih keluarga untuk user ini (opsional)",
            description:
              "Kosongkan jika jemaat akan mencari sendiri dengan No. KK saat onboarding",
          },
          {
            key: "password",
            label: "Password",
            type: "password",
            required: true,
            placeholder: "Default: oepura78",
            defaultValue: "oepura78",
            description:
              "Password default: oepura78. Password akan ditampilkan di pesan WhatsApp agar jemaat bisa login setelah lengkapi data.",
          },
        ]}
        isLoading={invitationMutation.isPending}
        isOpen={showInvitationModal}
        submitLabel="Kirim Link"
        title="Kirim Self Onboarding via WhatsApp"
        onClose={() => {
          setShowInvitationModal(false);
          setSelectedUserForInvitation(null);
        }}
        onSubmit={(formData) =>
          invitationMutation.mutate({
            userId: selectedUserForInvitation?.id,
            keluargaId: formData.keluargaId,
            whatsappNumber:
              selectedUserForInvitation?.noWhatsapp || formData.whatsappNumber,
            password: formData.password,
          })
        }
      />

      {/* Account Data Modal */}
      <CreateModal
        description="Info akun (username, email) dan password default akan dikirim melalui WhatsApp. User dapat login dan segera mengganti password sesuai keinginan."
        fields={[
          {
            key: "userInfo",
            label: "Informasi User",
            type: "display",
            value: selectedUserForAccountData
              ? `${selectedUserForAccountData.username} (${selectedUserForAccountData.email}) - ${selectedUserForAccountData.role}`
              : "-",
          },
          {
            key: "whatsappNumber",
            label: "No. WhatsApp",
            type: "custom",
            component: PhoneInput,
            value: selectedUserForAccountData?.noWhatsapp || "",
            placeholder: "Masukkan nomor WhatsApp jika kosong",
            required: false,
          },
        ]}
        isLoading={accountDataMutation.isPending}
        isOpen={showAccountDataModal}
        submitLabel="Kirim Info Akun"
        title="Kirim Info Akun via WhatsApp"
        onClose={() => {
          setShowAccountDataModal(false);
          setSelectedUserForAccountData(null);
        }}
        onSubmit={(formData) =>
          accountDataMutation.mutate({
            userId: selectedUserForAccountData?.id,
            whatsappNumber:
              selectedUserForAccountData?.noWhatsapp || formData.whatsappNumber,
          })
        }
      />
    </ProtectedRoute>
  );
}

export default MajelisAkunJemaatPage;
