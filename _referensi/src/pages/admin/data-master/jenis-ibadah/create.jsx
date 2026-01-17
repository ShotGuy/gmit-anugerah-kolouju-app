import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Church } from "lucide-react";

import jenisIbadahService from "@/services/jenisIbadahService";
import { showToast } from "@/utils/showToast";
import FormPage from "@/components/ui/FormPage";

export default function CreateJenisIbadah() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    namaIbadah: "",
  });

  const createMutation = useMutation({
    mutationFn: jenisIbadahService.create,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Jenis ibadah berhasil ditambahkan",
        color: "success",
      });
      router.push("/admin/jenis-ibadah");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menambahkan jenis ibadah",
        color: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
      label: "Simpan",
      icon: Save,
      type: "submit",
      loading: createMutation.isLoading,
    },
  ];

  return (
    <FormPage
      actions={actions}
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Jenis Ibadah", href: "/admin/jenis-ibadah" },
        { label: "Tambah Jenis Ibadah" },
      ]}
      description="Buat jenis ibadah baru untuk sistem penjadwalan"
      fields={fields}
      formData={formData}
      isLoading={createMutation.isLoading}
      title="Tambah Jenis Ibadah"
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  );
}