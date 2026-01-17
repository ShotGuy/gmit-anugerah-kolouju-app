import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Church } from "lucide-react";

import jenisIbadahService from "@/services/jenisIbadahService";
import { showToast } from "@/utils/showToast";
import FormPage from "@/components/ui/FormPage";

export default function EditJenisIbadah() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    namaIbadah: "",
  });

  // Fetch jenis ibadah data
  const { data: jenisIbadahData, isLoading: jenisIbadahLoading } = useQuery({
    queryKey: ["jenis-ibadah", id],
    queryFn: () => jenisIbadahService.getById(id),
    enabled: !!id,
  });

  // Update form when data loads
  useEffect(() => {
    if (jenisIbadahData?.data) {
      const jenisIbadah = jenisIbadahData.data;
      setFormData({
        namaIbadah: jenisIbadah.namaIbadah || "",
      });
    }
  }, [jenisIbadahData]);

  const updateMutation = useMutation({
    mutationFn: (data) => jenisIbadahService.update(id, data),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Jenis ibadah berhasil diupdate",
        color: "success",
      });
      queryClient.invalidateQueries(["jenis-ibadah", id]);
      queryClient.invalidateQueries(["jenis-ibadah"]);
      router.push("/admin/jenis-ibadah");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal mengupdate jenis ibadah",
        color: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fields = [
    {
      name: "namaIbadah",
      label: "Nama Ibadah",
      type: "text",
      required: true,
      icon: Church,
      placeholder: "Contoh: Ibadah Minggu Pagi, Ibadah Keluarga, dll.",
      description: "Masukkan nama jenis ibadah yang akan dikelola"
    },
  ];

  const actions = [
    {
      label: "Kembali",
      icon: ArrowLeft,
      variant: "outline",
      onClick: () => router.push("/admin/jenis-ibadah"),
    },
    {
      label: "Update",
      icon: Save,
      type: "submit",
      loading: updateMutation.isLoading,
    },
  ];

  if (jenisIbadahLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat data jenis ibadah...</p>
        </div>
      </div>
    );
  }

  return (
    <FormPage
      actions={actions}
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Jenis Ibadah", href: "/admin/jenis-ibadah" },
        { label: jenisIbadahData?.data?.namaIbadah || "Jenis Ibadah", href: `/admin/jenis-ibadah/${id}` },
        { label: "Edit" },
      ]}
      description="Update informasi jenis ibadah"
      fields={fields}
      formData={formData}
      isLoading={updateMutation.isLoading}
      title="Edit Jenis Ibadah"
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  );
}