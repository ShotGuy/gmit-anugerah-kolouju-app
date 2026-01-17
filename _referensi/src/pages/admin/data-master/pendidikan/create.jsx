import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import masterService from "@/services/masterService";
import CardWrapper from "@/components/common/CardWrapper";
import CreateOrEditButton from "@/components/common/CreateOrEditButton";
import HookForm from "@/components/form/HookForm";
import TextInput from "@/components/ui/inputs/TextInput";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/utils/showToast"; // ✅ import toast

// ✅ Zod Schema
const schema = z.object({
  jenjang: z.string().min(1, "Jenjang pendidikan wajib diisi"),
});

export default function CreatePendidikanPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      jenjang: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createPendidikan(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data pendidikan berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/pendidikan");
    } else {
      setError("jenjang", {
        type: "manual",
        message: res.errors?.jenjang || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
        description: res.errors?.jenjang || res.message,
        color: "error",
      });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Data Pendidikan", href: "/admin/data-master/pendidikan" },
          { label: "Tambah Pendidikan" },
        ]}
        title={"Tambah Data Pendidikan "}
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Jenjang Pendidikan"
            name="jenjang"
            placeholder="Contoh: SMA"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
