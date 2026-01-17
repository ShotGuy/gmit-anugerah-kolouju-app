import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react"; // Tambahkan import useEffect
import { useForm } from "react-hook-form";
import { z } from "zod";

import CardWrapper from "@/components/common/CardWrapper";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import ToggleInput from "@/components/ui/inputs/ToggleInput";
import PageHeader from "@/components/ui/PageHeader";
import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";

// ✅ Schema Zod
const schema = z.object({
  jenjang: z
    .string()
    .min(1, "Jenjang pendidikan wajib diisi")
    .max(50, "Maksimal 50 karakter"),

  isActive: z.boolean().optional(),
});

export default function EditPendidikanPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      jenjang: "",
      isActive: true,
    },
  });

  const { reset, setError } = methods;

  // ✅ Fetch data pendidikan by ID
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pendidikan", id],
    enabled: !!id,
    queryFn: () => masterService.getPendidikanById(id),
  });

  // ✅ Effect untuk reset form ketika data berhasil di-load
  useEffect(() => {
    if (data?.success && data?.data) {
      reset({
        jenjang: data.data.jenjang,
        isActive: data.data.isActive,
      });
    } else if (data && !data.success) {
      showToast({
        title: "Gagal memuat data",
        description: data.message,
        color: "error",
      });
      router.push("/admin/data-master/pendidikan");
    }
  }, [data, reset, router]);

  // ✅ Error handling untuk query
  useEffect(() => {
    if (isError) {
      showToast({
        title: "Error",
        description: "Gagal mengambil data dari server",
        color: "error",
      });
      router.push("/admin/data-master/pendidikan");
    }
  }, [isError, router]);

  // ✅ Update mutation
  const mutation = useMutation({
    mutationFn: (payload) => masterService.updatePendidikan(id, payload),
    onSuccess: (res) => {
      if (res.success) {
        showToast({
          title: "Berhasil",
          description: "Data pendidikan berhasil diperbarui",
          color: "success",
        });
        queryClient.invalidateQueries(["pendidikan"]);
        router.push("/admin/data-master/pendidikan");
      } else {
        setError("jenjang", {
          type: "manual",
          message: res.errors?.jenjang || res.message,
        });
        showToast({
          title: "Gagal memperbarui",
          description: res.errors?.jenjang || res.message,
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
          { label: "Data Pendidikan", href: "/admin/data-master/pendidikan" },
          { label: "Edit Pendidikan" },
        ]}
        title={"Edit Data Pendidikan"}
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Jenjang Pendidikan"
            name="jenjang"
            placeholder="Contoh: SMA"
          />

          <ToggleInput label="Aktif?" name="isActive" />
          <CreateOrEditButton isLoading={mutation.isLoading} label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
