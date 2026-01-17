import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import CardWrapper from "@/components/common/CardWrapper";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";
import PageHeader from "@/components/ui/PageHeader";

// Schema validasi
const schema = z.object({
  statusKeluarga: z.string().min(1, "Status keluarga wajib diisi"),
});

export default function EditStatusKeluargaPage() {
  const router = useRouter();
  const { id } = router.query;

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      statusKeluarga: "",
    },
  });

  const { setError, setValue } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const res = await masterService.getStatusKeluargaById(id);

        if (res.success) {
          setValue("statusKeluarga", res.data.statusKeluarga);
        }
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const res = await masterService.updateStatusKeluarga(id, data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data status keluarga berhasil diperbarui",
        color: "success",
      });

      router.push("/admin/data-master/status-keluarga");
    } else {
      setError("statusKeluarga", {
        type: "manual",
        message: res.errors?.statusKeluarga || res.message,
      });

      showToast({
        title: "Gagal memperbarui",
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
          { label: "Edit Status Keluarga" },
        ]}
        title="Edit Data Status Keluarga"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Status Keluarga"
            name="statusKeluarga"
            placeholder="Contoh: Menikah"
          />
          <CreateOrEditButton isEdit label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
