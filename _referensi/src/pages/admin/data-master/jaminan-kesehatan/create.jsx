import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import masterService from "@/services/masterService";
import { showToast } from "@/utils/showToast";
import PageHeader from "@/components/ui/PageHeader";
import CardWrapper from "@/components/common/CardWrapper";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";

// Schema validasi
const schema = z.object({
  jenisJaminan: z.string().min(1, "Jenis jaminan wajib diisi"),
});

export default function CreateJaminanKesehatanPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      jenisJaminan: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createJaminanKesehatan(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data jaminan kesehatan berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/jaminan-kesehatan");
    } else {
      setError("jenisJaminan", {
        type: "manual",
        message: res.errors?.jenisJaminan || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
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
          { label: "Tambah Jaminan Kesehatan" },
        ]}
        title="Tambah Data Jaminan Kesehatan"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Jenis Jaminan"
            name="jenisJaminan"
            placeholder="Contoh: BPJS"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
