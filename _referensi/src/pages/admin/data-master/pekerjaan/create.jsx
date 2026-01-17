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
  namaPekerjaan: z.string().min(1, "Nama pekerjaan wajib diisi"),
});

export default function CreatePekerjaanPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      namaPekerjaan: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createPekerjaan(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data pekerjaan berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/pekerjaan");
    } else {
      setError("namaPekerjaan", {
        type: "manual",
        message: res.errors?.namaPekerjaan || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
        description: res.errors?.namaPekerjaan || res.message,
        color: "error",
      });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Data Pekerjaan", href: "/admin/data-master/pekerjaan" },
          { label: "Tambah Pekerjaan" },
        ]}
        title="Tambah Data Pekerjaan"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Nama Pekerjaan"
            name="namaPekerjaan"
            placeholder="Contoh: Guru"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
