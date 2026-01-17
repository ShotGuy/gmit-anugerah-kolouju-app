import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";
import TextInput from "@/components/ui/inputs/TextInput";
import HookForm from "@/components/form/HookForm";
import CardWrapper from "@/components/common/CardWrapper";
import PageHeader from "@/components/ui/PageHeader";

// Schema validasi
const schema = z
  .object({
    label: z.string().min(1, "Label pendapatan wajib diisi"),
    min: z.number().min(0, "Pendapatan minimum tidak boleh negatif"),
    max: z.number().min(0, "Pendapatan maksimum tidak boleh negatif"),
  })
  .refine((data) => data.max > data.min, {
    message: "Pendapatan maksimum harus lebih besar dari minimum",
    path: ["max"],
  });

export default function EditPendapatanPage() {
  const router = useRouter();
  const { id } = router.query;

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      min: 0,
      max: 0,
    },
  });

  const { setError, setValue } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const res = await masterService.getPendapatanById(id);

        if (res.success) {
          setValue("label", res.data.label);
          setValue("min", res.data.min);
          setValue("max", res.data.max);
        }
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const res = await masterService.updatePendapatan(id, data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data pendapatan berhasil diperbarui",
        color: "success",
      });

      router.push("/admin/data-master/pendapatan");
    } else {
      // Set error untuk setiap field yang gagal validasi
      Object.keys(res.errors || {}).forEach((field) => {
        setError(field, {
          type: "manual",
          message: res.errors[field],
        });
      });

      showToast({
        title: "Gagal memperbarui",
        description: res.message || "Terjadi kesalahan saat memperbarui data",
        color: "error",
      });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          {
            label: "Pendapatan",
            href: "/admin/data-master/pendapatan",
          },
          { label: "Edit Pendapatan" },
        ]}
        title="Edit Data Pendapatan"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Label Pendapatan"
            name="label"
            placeholder="Contoh: 1 - 3 juta"
          />
          <TextInput
            label="Pendapatan Minimum (Rp)"
            name="min"
            placeholder="1000000"
            type="number"
          />
          <TextInput
            label="Pendapatan Maksimum (Rp)"
            name="max"
            placeholder="3000000"
            type="number"
          />
          <CreateOrEditButton isEdit label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
