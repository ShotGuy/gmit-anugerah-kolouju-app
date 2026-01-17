import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import PageHeader from "@/components/ui/PageHeader";
import CardWrapper from "@/components/common/CardWrapper";
import TextInput from "@/components/ui/inputs/TextInput";
import HookForm from "@/components/form/HookForm";
import ToggleInput from "@/components/ui/inputs/ToggleInput";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";

// Schema Zod
const schema = z.object({
  namaPekerjaan: z
    .string()
    .min(1, "Nama pekerjaan wajib diisi")
    .max(50, "Maksimal 50 karakter"),
  isActive: z.boolean().optional(),
});

export default function EditPekerjaanPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      namaPekerjaan: "",
      isActive: true,
    },
  });

  const { reset, setError } = methods;

  // Fetch data pekerjaan by ID
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pekerjaan", id],
    enabled: !!id,
    queryFn: () => masterService.getPekerjaanById(id),
  });

  // Effect untuk reset form ketika data berhasil di-load
  useEffect(() => {
    if (data?.success && data?.data) {
      reset({
        namaPekerjaan: data.data.namaPekerjaan,
        isActive: data.data.isActive,
      });
    } else if (data && !data.success) {
      showToast({
        title: "Gagal memuat data",
        description: data.message,
        color: "error",
      });
      router.push("/admin/data-master/pekerjaan");
    }
  }, [data, reset, router]);

  // Error handling untuk query
  useEffect(() => {
    if (isError) {
      showToast({
        title: "Error",
        description: "Gagal mengambil data dari server",
        color: "error",
      });
      router.push("/admin/data-master/pekerjaan");
    }
  }, [isError, router]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (payload) => masterService.updatePekerjaan(id, payload),
    onSuccess: (res) => {
      if (res.success) {
        showToast({
          title: "Berhasil",
          description: "Data pekerjaan berhasil diperbarui",
          color: "success",
        });
        queryClient.invalidateQueries(["pekerjaan"]);
        router.push("/admin/data-master/pekerjaan");
      } else {
        setError("namaPekerjaan", {
          type: "manual",
          message: res.errors?.namaPekerjaan || res.message,
        });
        showToast({
          title: "Gagal memperbarui",
          description: res.errors?.namaPekerjaan || res.message,
          color: "error",
        });
      }
    },
    onError: () => {
      showToast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        color: "error",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) return <p>Memuat data...</p>;
  if (isError) return <p>Terjadi kesalahan saat memuat halaman</p>;
  if (!data) return <p>Data tidak ditemukan</p>;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Data Pekerjaan", href: "/admin/data-master/pekerjaan" },
          { label: "Edit Pekerjaan" },
        ]}
        title="Edit Data Pekerjaan"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Nama Pekerjaan"
            name="namaPekerjaan"
            placeholder="Contoh: Guru"
          />
          <ToggleInput label="Aktif?" name="isActive" />
          <CreateOrEditButton isLoading={mutation.isLoading} label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
