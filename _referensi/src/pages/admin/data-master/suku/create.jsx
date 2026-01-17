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
  namaSuku: z.string().min(1, "Nama suku wajib diisi"),
});

export default function CreateSukuPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      namaSuku: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createSuku(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data suku berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/suku");
    } else {
      setError("namaSuku", {
        type: "manual",
        message: res.errors?.namaSuku || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
        description: res.errors?.namaSuku || res.message,
        color: "error",
      });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Data Suku", href: "/admin/data-master/suku" },
          { label: "Tambah Suku" },
        ]}
        title="Tambah Data Suku"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Nama Suku"
            name="namaSuku"
            placeholder="Contoh: Batak"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
