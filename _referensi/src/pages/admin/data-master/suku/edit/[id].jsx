import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import CardWrapper from "@/components/common/CardWrapper";
import PageHeader from "@/components/ui/PageHeader";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import ToggleInput from "@/components/ui/inputs/ToggleInput";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";

// Schema Zod
const schema = z.object({
  namaSuku: z
    .string()
    .min(1, "Nama suku wajib diisi")
    .max(50, "Maksimal 50 karakter"),
  isActive: z.boolean().optional(),
});

export default function EditSukuPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      namaSuku: "",
      isActive: true,
    },
  });
  const { reset, setError } = methods;

  // Fetch data suku by ID
  const { data, isLoading, isError } = useQuery({
    queryKey: ["suku", id],
    enabled: !!id,
    queryFn: () => masterService.getSukuById(id),
  });

  // Effect untuk reset form ketika data berhasil di-load
  useEffect(() => {
    if (data?.success && data?.data) {
      reset({
        namaSuku: data.data.namaSuku,
        isActive: data.data.isActive,
      });
    } else if (data && !data.success) {
      showToast({
        title: "Gagal memuat data",
        description: data.message,
        color: "error",
      });
      router.push("/admin/data-master/suku");
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
      router.push("/admin/data-master/suku");
    }
  }, [isError, router]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (payload) => masterService.updateSuku(id, payload),
    onSuccess: (res) => {
      if (res.success) {
        showToast({
          title: "Berhasil",
          description: "Data suku berhasil diperbarui",
          color: "success",
        });
        queryClient.invalidateQueries(["suku"]);
        router.push("/admin/data-master/suku");
      } else {
        setError("namaSuku", {
          type: "manual",
          message: res.errors?.namaSuku || res.message,
        });
        showToast({
          title: "Gagal memperbarui",
          description: res.errors?.namaSuku || res.message,
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
          { label: "Data Suku", href: "/admin/data-master/suku" },
          { label: "Edit Suku" },
        ]}
        title="Edit Data Suku"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Nama Suku"
            name="namaSuku"
            placeholder="Contoh: Batak"
          />
          <ToggleInput label="Aktif?" name="isActive" />
          <CreateOrEditButton isLoading={mutation.isLoading} label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
