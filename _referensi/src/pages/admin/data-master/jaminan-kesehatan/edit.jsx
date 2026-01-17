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
  jenisJaminan: z.string().min(1, "Jenis jaminan wajib diisi"),
});

export default function EditJaminanKesehatanPage() {
  const router = useRouter();
  const { id } = router.query;

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      jenisJaminan: "",
    },
  });

  const { setError, setValue } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const res = await masterService.getJaminanKesehatanById(id);

        if (res.success) {
          setValue("jenisJaminan", res.data.jenisJaminan);
        }
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const res = await masterService.updateJaminanKesehatan(id, data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data jaminan kesehatan berhasil diperbarui",
        color: "success",
      });

      router.push("/admin/data-master/jaminan-kesehatan");
    } else {
      setError("jenisJaminan", {
        type: "manual",
        message: res.errors?.jenisJaminan || res.message,
      });

      showToast({
        title: "Gagal memperbarui",
        description: res.errors?.jenisJaminan || res.message,
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
            label: "Jaminan Kesehatan",
            href: "/admin/data-master/jaminan-kesehatan",
          },
          { label: "Edit Jaminan Kesehatan" },
        ]}
        title="Edit Data Jaminan Kesehatan"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Jenis Jaminan"
            name="jenisJaminan"
            placeholder="Contoh: BPJS"
          />
          <CreateOrEditButton isEdit label="Perbarui" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
