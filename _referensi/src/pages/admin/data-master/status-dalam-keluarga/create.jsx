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
  namaStatus: z.string().min(1, "Nama status wajib diisi"),
});

export default function CreateStatusDalamKeluargaPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      namaStatus: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createStatusDalamKeluarga(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data status dalam keluarga berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/status-dalam-keluarga");
    } else {
      setError("namaStatus", {
        type: "manual",
        message: res.errors?.namaStatus || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
        description: res.errors?.namaStatus || res.message,
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
            label: "Status Dalam Keluarga",
            href: "/admin/data-master/status-dalam-keluarga",
          },
          { label: "Tambah Status Dalam Keluarga" },
        ]}
        title="Tambah Data Status Dalam Keluarga"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Nama Status"
            name="namaStatus"
            placeholder="Contoh: Kepala Keluarga"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
