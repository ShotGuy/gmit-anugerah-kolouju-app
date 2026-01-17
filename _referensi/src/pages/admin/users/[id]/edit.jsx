import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Save, User, UserCog } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import FormPage from "@/components/ui/FormPage";
import jemaatService from "@/services/jemaatService";
import userService from "@/services/userService";
import { showToast } from "@/utils/showToast";

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    role: "JEMAAT",
    idJemaat: "",
  });

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });

  // Fetch jemaat for dropdown
  const { data: jemaatData } = useQuery({
    queryKey: ["jemaat-all"],
    queryFn: () => jemaatService.getAll({ limit: 1000 }),
  });

  // Update form when data loads
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;

      setFormData({
        email: user.email || "",
        role: user.role || "JEMAAT",
        idJemaat: user.idJemaat || "",
      });
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: (data) => userService.update(id, data),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "User berhasil diupdate",
        color: "success",
      });
      queryClient.invalidateQueries(["user", id]);
      queryClient.invalidateQueries(["users"]);
      router.push("/admin/users");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal mengupdate user",
        color: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      email: formData.email,
      role: formData.role,
      idJemaat: formData.role === "JEMAAT" ? formData.idJemaat : null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "JEMAAT" && { idJemaat: "" }),
    }));
  };

  // Get available jemaat (exclude current user's jemaat from filtering)
  const availableJemaat =
    jemaatData?.data?.items?.filter((j) => !j.User || j.User.id === id) || [];

  const fields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      icon: Mail,
      placeholder: "user@example.com",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      icon: UserCog,
      options: [
        { value: "ADMIN", label: "Admin" },
        { value: "PENDETA", label: "Pendeta" },
        { value: "JEMAAT", label: "Jemaat" },
      ],
    },
    ...(formData.role === "JEMAAT"
      ? [
          {
            name: "idJemaat",
            label: "Pilih Jemaat",
            type: "select",
            required: true,
            icon: User,
            options: availableJemaat.map((jemaat) => ({
              value: jemaat.id,
              label: `${jemaat.nama} - ${jemaat.keluarga?.noBagungan || "No Bagungan N/A"}`,
            })),
            placeholder: "Pilih jemaat",
          },
        ]
      : []),
  ];

  const actions = [
    {
      label: "Kembali",
      icon: ArrowLeft,
      variant: "outline",
      onClick: () => router.push("/admin/users"),
    },
    {
      label: "Update",
      icon: Save,
      type: "submit",
      loading: updateMutation.isLoading,
    },
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data user...</p>
        </div>
      </div>
    );
  }

  return (
    <FormPage
      actions={actions}
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Users", href: "/admin/users" },
        { label: userData?.data?.email || "User", href: `/admin/users/${id}` },
        { label: "Edit" },
      ]}
      description="Update informasi pengguna sistem"
      fields={fields}
      formData={formData}
      isLoading={updateMutation.isLoading}
      title="Edit User"
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  );
}
