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
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CreateModal from "@/components/ui/CreateModal";
import EditModal from "@/components/ui/EditModal";
import ListGrid from "@/components/ui/ListGrid";
import PhoneInput from "@/components/ui/PhoneInput";
import ViewModal from "@/components/ui/ViewModal";
import { useUser } from "@/hooks/useUser";
import axios from "@/lib/axios";
import jemaatService from "@/services/jemaatService";
import keluargaService from "@/services/keluargaService";
import rayonService from "@/services/rayonService";
import userService from "@/services/userService";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [jemaatOptions, setJemaatOptions] = useState([]);
  const [keluargaOptions, setKeluargaOptions] = useState([]);
  const [rayonOptions, setRayonOptions] = useState([]);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedUserForInvitation, setSelectedUserForInvitation] =
    useState(null);
  const [showAccountDataModal, setShowAccountDataModal] = useState(false);
  const [selectedUserForAccountData, setSelectedUserForAccountData] =
    useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const { user: authData } = useUser();

  // const [showAssignRayonModal, setShowAssignRayonModal] = useState(false);
  // const [selectedUserForRayon, setSelectedUserForRayon] = useState(null);

  // Fetch users data
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // Fetch jemaat options with React Query (auto-cached)
  const {
    data: jemaatQueryData,
    isLoading: jemaatLoading,
    refetch: refetchJemaat,
  } = useQuery({
    queryKey: ["jemaat-options"],
    queryFn: async () => {
      const response = await jemaatService.getAll({ limit: 1000 });
      const options =
        response.data?.items?.map((jemaat) => ({
          value: jemaat.id,
          label: `${jemaat.nama} (${jemaat.keluarga?.noBagungan || "No Bangunan"})`,
        })) || [];

      return options;
    },
    enabled: false, // Tidak auto-fetch saat mount
    staleTime: 5 * 60 * 1000, // Cache 5 menit
    cacheTime: 10 * 60 * 1000, // Keep in cache 10 menit
  });

  // Set jemaatOptions dari query data
  useEffect(() => {
    if (jemaatQueryData) {
      setJemaatOptions(jemaatQueryData);
    }
  }, [jemaatQueryData]);

  // Function untuk load jemaat (hanya trigger refetch jika belum ada data)
  const loadJemaatOptions = () => {
    if (jemaatOptions.length > 0) return; // Already cached
    refetchJemaat();
  };

  // Fetch keluarga options with React Query (auto-cached)
  const {
    data: keluargaQueryData,
    isLoading: keluargaLoading,
    refetch: refetchKeluarga,
  } = useQuery({
    queryKey: ["keluarga-options"],
    queryFn: async () => {
      const response = await keluargaService.getAll({ limit: 1000 });
      const options =
        response.data?.items?.map((keluarga) => {
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

      return options;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (keluargaQueryData) {
      setKeluargaOptions(keluargaQueryData);
    }
  }, [keluargaQueryData]);

  const loadKeluargaOptions = () => {
    if (keluargaOptions.length > 0) return;
    refetchKeluarga();
  };

  // Fetch rayon options with React Query (auto-cached)
  const {
    data: rayonQueryData,
    isLoading: rayonLoading,
    refetch: refetchRayon,
  } = useQuery({
    queryKey: ["rayon-options"],
    queryFn: async () => {
      const response = await rayonService.getRayon({ limit: 1000 });
      const options =
        response.data?.items?.map((rayon) => ({
          value: rayon.id,
          label: rayon.namaRayon,
        })) || [];

      return options;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (rayonQueryData) {
      setRayonOptions(rayonQueryData);
    }
  }, [rayonQueryData]);

  const loadRayonOptions = () => {
    if (rayonOptions.length > 0) return;
    refetchRayon();
  };

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
      key: "role",
      label: "Role",
      type: "badge",
      render: (value) => {
        const badgeClass =
          value === "ADMIN"
            ? "bg-purple-100 text-purple-800"
            : value === "JEMAAT"
              ? "bg-green-100 text-green-800"
              : value === "PENDETA"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
          >
            {value || "-"}
          </span>
        );
      },
    },
    {
      key: "jemaat",
      label: "Nama Jemaat",
      type: "text",
      render: (value) => value?.nama || "-",
    },
    {
      key: "rayon",
      label: "Rayon",
      type: "text",
      render: (value, row) => {
        const rayonName = row.rayon?.namaRayon;

        // Hanya tampilkan badge "Belum di-assign" untuk role JEMAAT
        if (!rayonName) {
          if (row.role === "JEMAAT") {
            return (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Belum di-assign
              </span>
            );
          }

          return <span className="text-sm text-gray-500">-</span>;
        }

        return (
          <span className="text-sm text-gray-700 dark:text-gray-100">
            {rayonName}
          </span>
        );
      },
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
      key: "rayon",
      label: "Rayon",
      getValue: (item) => item?.jemaat?.keluarga?.rayon?.namaRayon || "-",
    },
    {
      key: "createdAt",
      label: "Tanggal Dibuat",
      getValue: (item) => formatDate(item?.createdAt),
    },
  ];

  const formFields = useMemo(
    () => [
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
        placeholder: "Default: oepura78",
        defaultValue: "oepura78",
        description:
          "Default password: oepura78. User dapat mengubahnya setelah login.",
      },
      {
        key: "role",
        label: "Role",
        type: "select",
        required: true,
        options: [
          { value: "ADMIN", label: "Admin" },
          { value: "JEMAAT", label: "Jemaat" },
          { value: "MAJELIS", label: "Majelis" },
          { value: "PENDETA", label: "Pendeta" },
          { value: "EMPLOYEE", label: "Pegawai" },
        ],
      },
      {
        key: "idJemaat",
        label: "Pilih Jemaat (Opsional)",
        type: "select",
        options: jemaatOptions,
        placeholder: "Pilih jemaat jika role = JEMAAT",
        loading: jemaatLoading,
        onMenuOpen: loadJemaatOptions,
      },
      {
        key: "idRayon",
        label: "Pilih Rayon",
        type: "select",
        required: false,
        options: rayonOptions,
        placeholder: "Pilih rayon untuk user ini (opsional)",
        loading: rayonLoading,
        onMenuOpen: loadRayonOptions,
        condition: (formData) =>
          formData.role === "JEMAAT" || formData.role === "MAJELIS",
      },
    ],
    [
      jemaatOptions,
      rayonOptions,
      jemaatLoading,
      rayonLoading,
      loadJemaatOptions,
      loadRayonOptions,
    ]
  );

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
    mutationFn: (id) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus");
      setDeleteItem(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus user");
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

      return userService.update(id, cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil diperbarui");
      setEditItem(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui user");
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

      return userService.create(cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil ditambahkan");
      setShowCreate(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Gagal menambahkan user");
    },
  });

  const invitationMutation = useMutation({
    mutationFn: async ({ userId, keluargaId, whatsappNumber }) => {
      const response = await axios.post("/auth/generate-invitation", {
        userId,
        keluargaId,
        whatsappNumber,
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

  const [showAssignRayonModal, setShowAssignRayonModal] = useState(false);
  const [selectedUserForRayon, setSelectedUserForRayon] = useState(null);

  // Handler untuk buka edit modal dengan pre-load options
  const handleEditClick = (item) => {
    // Load options sebelum buka modal
    loadJemaatOptions();
    loadRayonOptions();
    setEditItem(item);
  };

  // Assign rayon mutation
  const assignRayonMutation = useMutation({
    mutationFn: async ({ userId, idRayon }) => {
      const response = await axios.post("/users/assign-rayon", {
        userId,
        idRayon,
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message || "Berhasil assign rayon ke user");
      setShowAssignRayonModal(false);
      setSelectedUserForRayon(null);
    },
    onError: (error) => {
      console.error("Assign rayon error:", error);
      toast.error(error?.response?.data?.message || "Gagal assign rayon");
    },
  });

  const handleAssignRayon = (user) => {
    // Load rayon options sebelum buka modal (pakai cache jika sudah ada)
    loadRayonOptions();
    setSelectedUserForRayon(user);
    setShowAssignRayonModal(true);
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get("/users/template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "template_import_users.xlsx");
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

      const response = await axios.post("/users/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setImportResults(data.data);
      setShowImportModal(false);
      setImportFile(null);

      if (data.data.summary.failed === 0) {
        toast.success(`Berhasil import ${data.data.summary.success} user`);
      } else {
        toast.warning(
          `Import selesai: ${data.data.summary.success} berhasil, ${data.data.summary.failed} gagal`
        );
      }
    },
    onError: (error) => {
      console.error("Import error:", error);
      toast.error(error?.response?.data?.message || "Gagal import data user");
    },
  });

  const handleImportSubmit = () => {
    if (!importFile) {
      toast.error("Pilih file Excel terlebih dahulu");

      return;
    }

    importMutation.mutate(importFile);
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
      (item.jemaat?.nama || "").toLowerCase().includes(searchLower) ||
      (item.role || "").toLowerCase().includes(searchLower) ||
      (item.rayon?.namaRayon || "").toLowerCase().includes(searchLower)
    );
  };

  // Create filter options based on available data
  const userFilters = useMemo(() => {
    const filters = [
      {
        key: "role",
        label: "Semua Role",
        options: [
          { value: "ADMIN", label: "Admin" },
          { value: "JEMAAT", label: "Jemaat" },
          { value: "MAJELIS", label: "Majelis" },
          { value: "PENDETA", label: "Pendeta" },
          { value: "EMPLOYEE", label: "Pegawai" },
        ],
      },
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

    // Add rayon filter if rayon options are available
    if (rayonOptions.length > 0) {
      filters.push({
        key: "rayonId",
        label: "Semua Rayon",
        options: rayonOptions,
        loading: rayonLoading,
        onMenuOpen: loadRayonOptions,
      });
    }

    return filters;
  }, [rayonOptions, rayonLoading, loadRayonOptions]);

  // Custom filter function
  const customFilterFunction = (item, filters) => {
    return Object.entries(filters).every(([filterKey, filterValue]) => {
      if (!filterValue || filterValue === "all") return true;

      switch (filterKey) {
        case "role":
          return item.role === filterValue;
        case "hasJemaat":
          const hasJemaat = !!item.idJemaat;

          return hasJemaat.toString() === filterValue;
        case "hasWhatsapp":
          const hasWhatsapp = !!item.noWhatsapp;

          return hasWhatsapp.toString() === filterValue;
        case "rayonId":
          return item.idRayon === filterValue;
        default:
          return item[filterKey] === filterValue;
      }
    });
  };

  return (
    <>
      <ListGrid
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
        columns={columns}
        customFilterFunction={customFilterFunction}
        customSearchFunction={enhancedSearch}
        data={data?.data?.items || []}
        description="Kelola data pengguna sistem"
        emptyStateProps={{
          title: "Belum Ada Data User",
          description: "Mulai dengan menambahkan user pertama",
          actionLabel: "Tambah User",
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
            key: "role",
            label: "Role",
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
        exportFilename="users"
        exportable={true}
        filters={userFilters}
        headerActions={[
          ...(authData?.isAdmin
            ? [
                {
                  label: "Download Template",
                  icon: Download,
                  onClick: handleDownloadTemplate,
                  variant: "outline",
                },
              ]
            : []),
          ...(authData?.isAdmin
            ? [
                {
                  label: "Import Users",
                  icon: Upload,
                  onClick: () => setShowImportModal(true),
                  variant: "default",
                },
              ]
            : []),
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

          ...(authData?.isAdmin
            ? [
                {
                  icon: Edit,
                  onClick: handleEditClick,
                  variant: "outline",
                  tooltip: "Edit user",
                },
              ]
            : []),

          ...(authData?.isAdmin
            ? [
                {
                  label: "Kirim Self Onboarding",
                  icon: MessageCircle,
                  onClick: (item) => handleSendInvitation(item),
                  variant: "outline",
                  tooltip: "Kirim Link Self Onboarding",
                  condition: (item) =>
                    item.role === "JEMAAT" && !item.idJemaat && item.noWhatsapp,
                },
              ]
            : []),

          ...(authData?.isAdmin
            ? [
                {
                  label: "Kirim Info Akun WA",
                  icon: Send,
                  onClick: (item) => handleSendAccountData(item),
                  variant: "outline",
                  tooltip: "Kirim Info Akun via WhatsApp",
                  condition: (item) => item.noWhatsapp,
                },
              ]
            : []),

          ...(authData?.isAdmin
            ? [
                {
                  label: "Atur Rayon",
                  icon: User,
                  onClick: (item) => handleAssignRayon(item),
                  variant: "outline",
                  tooltip: "Atur Rayon untuk User",
                  condition: (item) => item.role === "JEMAAT",
                },
              ]
            : []),

          ...(authData?.isAdmin
            ? [
                {
                  label: "Hapus",
                  icon: Trash2,
                  onClick: (item) => setDeleteItem(item),
                  variant: "outline",
                  tooltip: "Hapus user",
                },
              ]
            : []),
        ]}
        searchPlaceholder="Cari username, email, nama jemaat, role, rayon..."
        searchable={true}
        showPageSizeSelector={true}
        title="Manajemen Users"
        //Conditional Prop Spread for Add Button
        {...(authData?.isAdmin && { onAdd: () => setShowCreate(true) })}
      />

      <ConfirmDialog
        isLoading={deleteMutation.isPending}
        isOpen={!!deleteItem}
        message={`Apakah Anda yakin ingin menghapus user "${deleteItem?.username}" (${deleteItem?.email})? Data yang sudah dihapus tidak dapat dikembalikan.`}
        title="Hapus User"
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
        title="Detail User"
        onClose={() => setViewItem(null)}
      />

      <EditModal
        fields={formFields.filter((field) => field.key !== "password")} // Don't show password field in edit
        initialData={editItem}
        isLoading={updateMutation.isPending}
        isOpen={!!editItem}
        title="Edit User"
        onClose={() => setEditItem(null)}
        onSubmit={(formData) =>
          updateMutation.mutate({ id: editItem.id, data: formData })
        }
      />

      <CreateModal
        fields={formFields}
        isLoading={createMutation.isPending}
        isOpen={showCreate}
        title="Tambah User"
        onClose={() => setShowCreate(false)}
        onSubmit={(formData) => createMutation.mutate(formData)}
      />

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
            loading: keluargaLoading,
            onMenuOpen: loadKeluargaOptions,
            placeholder: "Pilih keluarga untuk user ini (opsional)",
            description:
              "Kosongkan jika jemaat akan mencari sendiri dengan No. KK saat onboarding",
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

      {/* Import Modal */}
      <CreateModal
        description="Upload file Excel untuk import data user. Download template terlebih dahulu untuk format yang benar."
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
                    <li>
                      role - Role user: ADMIN, JEMAAT, MAJELIS, EMPLOYEE,
                      PENDETA (wajib)
                    </li>
                  </ul>
                </div>
              </div>
            ),
          },
        ]}
        isLoading={importMutation.isPending}
        isOpen={showImportModal}
        submitLabel="Import Data"
        title="Import Users dari Excel"
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
          title="Hasil Import Users"
          onClose={() => setImportResults(null)}
          onSubmit={() => setImportResults(null)}
        />
      )}

      {/* Assign Rayon Modal */}
      <CreateModal
        description="Pilih rayon untuk mengaitkan user dengan rayon tertentu. Ini akan memudahkan dalam pengelolaan data berdasarkan wilayah."
        fields={[
          {
            key: "userInfo",
            label: "Informasi User",
            type: "display",
            value: selectedUserForRayon
              ? `${selectedUserForRayon.username} (${selectedUserForRayon.email}) - ${selectedUserForRayon.role}`
              : "-",
          },
          {
            key: "idRayon",
            label: "Pilih Rayon",
            type: "select",
            options: rayonOptions,
            loading: rayonLoading,
            onMenuOpen: loadRayonOptions,
            required: true,
            placeholder: "Pilih rayon...",
          },
        ]}
        isLoading={assignRayonMutation.isPending}
        isOpen={!!showAssignRayonModal}
        submitLabel="Atur Rayon"
        title="Atur Rayon untuk User"
        onClose={() => {
          setShowAssignRayonModal(false);
          setSelectedUserForRayon(null);
        }}
        onSubmit={(formData) =>
          assignRayonMutation.mutate({
            userId: selectedUserForRayon?.id,
            idRayon: formData.idRayon,
          })
        }
      />
    </>
  );
}
