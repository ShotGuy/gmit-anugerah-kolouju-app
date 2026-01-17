import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
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
  statusKepemilikan: z.string().min(1, "Status kepemilikan wajib diisi"),
});

export default function CreateStatusKepemilikanRumahPage() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      statusKepemilikan: "",
    },
  });

  const { setError } = methods;

  const onSubmit = async (data) => {
    const res = await masterService.createStatusKepemilikanRumah(data);

    if (res.success) {
      showToast({
        title: "Berhasil",
        description: "Data status kepemilikan rumah berhasil ditambahkan",
        color: "success",
      });

      router.push("/admin/data-master/status-kepemilikan-rumah");
    } else {
      setError("statusKepemilikan", {
        type: "manual",
        message: res.errors?.statusKepemilikan || res.message,
      });

      showToast({
        title: "Gagal menambahkan",
        description: res.errors?.statusKepemilikan || res.message,
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
            label: "Status Kepemilikan Rumah",
            href: "/admin/data-master/status-kepemilikan-rumah",
          },
          { label: "Tambah Status Kepemilikan Rumah" },
        ]}
        title="Tambah Data Status Kepemilikan Rumah"
      />
      <CardWrapper>
        <HookForm methods={methods} onSubmit={onSubmit}>
          <TextInput
            label="Status Kepemilikan"
            name="statusKepemilikan"
            placeholder="Contoh: Milik Sendiri"
          />
          <CreateOrEditButton label="Simpan" />
        </HookForm>
      </CardWrapper>
    </>
  );
}
