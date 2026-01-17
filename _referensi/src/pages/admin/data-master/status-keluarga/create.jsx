import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import CardWrapper from "@/components/common/CardWrapper";
import PageHeader from "@/components/ui/PageHeader";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";

// Schema validasi
const schema = z.object({
  statusKeluarga: z.string().min(1, "Status keluarga wajib diisi"),
});

export default function CreateStatusKeluargaPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      statusKeluarga: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createStatusKeluarga(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data status keluarga berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/status-keluarga");
    } else {
      setError("statusKeluarga", {
        type: "manual",
        message: res.errors?.statusKeluarga || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
        description: res.errors?.statusKeluarga || res.message,
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
            label: "Status Keluarga",
            href: "/admin/data-master/status-keluarga",
          },
          { label: "Tambah Status Keluarga" },
        ]}
        title="Tambah Data Status Keluarga"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Status Keluarga"
            name="statusKeluarga"
            placeholder="Contoh: Menikah"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
