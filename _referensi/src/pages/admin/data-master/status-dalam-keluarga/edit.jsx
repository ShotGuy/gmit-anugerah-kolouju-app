import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";
import CardWrapper from "@/components/common/CardWrapper";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";

// Schema validasi
const schema = z.object({
  namaStatus: z.string().min(1, "Nama status wajib diisi"),
});

export default function EditStatusDalamKeluargaPage() {
  const router = useRouter();
  const { id } = router.query;

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      namaStatus: "",
    },
  });

  const { setError, setValue } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const res = await masterService.getStatusDalamKeluargaById(id);

        if (res.success) {
          setValue("namaStatus", res.data.namaStatus);
        }
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const res = await masterService.updateStatusDalamKeluarga(id, data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data status dalam keluarga berhasil diperbarui",
        color: "success",
      });

      router.push("/admin/data-master/status-dalam-keluarga");
    } else {
      setError("namaStatus", {
        type: "manual",
        message: res.errors?.namaStatus || res.message,
      });

      showToast({
        title: "Gagal memperbarui",
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
          { label: "Edit Status Dalam Keluarga" },
        ]}
        title="Edit Data Status Dalam Keluarga"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Nama Status"
            name="namaStatus"
            placeholder="Contoh: Kepala Keluarga"
          />
          <CreateOrEditButton isEdit label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
