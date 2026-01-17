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
  keadaanRumah: z.string().min(1, "Keadaan rumah wajib diisi"),
});

export default function EditKeadaanRumahPage() {
  const router = useRouter();
  const { id } = router.query;

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      keadaanRumah: "",
    },
  });

  const { setError, setValue } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const res = await masterService.getKeadaanRumahById(id);

        if (res.success) {
          setValue("keadaanRumah", res.data.keadaanRumah);
        }
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const res = await masterService.updateKeadaanRumah(id, data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data keadaan rumah berhasil diperbarui",
        color: "success",
      });

      router.push("/admin/data-master/keadaan-rumah");
    } else {
      setError("keadaanRumah", {
        type: "manual",
        message: res.errors?.keadaanRumah || res.message,
      });

      showToast({
        title: "Gagal memperbarui",
        description: res.errors?.keadaanRumah || res.message,
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
            label: "Keadaan Rumah",
            href: "/admin/data-master/keadaan-rumah",
          },
          { label: "Edit Keadaan Rumah" },
        ]}
        title="Edit Data Keadaan Rumah"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Keadaan Rumah"
            name="keadaanRumah"
            placeholder="Contoh: Layak Huni"
          />
          <CreateOrEditButton isEdit label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
