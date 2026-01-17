import MasterDataPage from "@/components/ui/MasterDataPage";
import masterService from "@/services/masterService";

export default function RayonPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "namaRayon",
      label: "Nama Rayon",
      type: "text",
      sortable: false, // Disable frontend sorting, rely on backend
    },
    {
      key: "totalKeluarga",
      label: "Jumlah Keluarga",
      type: "text",
      sortable: false, // Disable frontend sorting
    },
  ];

  const viewFields = [
    { key: "id", label: "ID" },
    { key: "namaRayon", label: "Nama Rayon" },
    {
      key: "totalKeluarga",
      label: "Jumlah Keluarga",
      render: (item) =>
        typeof item?.totalKeluarga === "number"
          ? `${item.totalKeluarga} keluarga`
          : "0 keluarga",
    },
  ];

  const formFields = [
    {
      key: "namaRayon",
      label: "Nama Rayon",
      type: "text",
      required: true,
      placeholder: "Contoh: Rayon I, Rayon II, Rayon III",
      validation: {
        maxLength: {
          value: 50,
          message: "Nama rayon maksimal 50 karakter",
        },
        minLength: {
          value: 1,
          message: "Nama rayon minimal 1 karakter",
        },
      },
    },
  ];

  return (
    <MasterDataPage
      allowBulkDelete={true}
      breadcrumb={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Rayon" },
      ]}
      columns={columns}
      defaultSort={{ sortBy: "namaRayon", sortOrder: "asc" }} // Set default sort
      description="Kelola data rayon untuk pembagian wilayah jemaat"
      disableSorting={true}
      exportable={true}
      formFields={formFields}
      itemNameField="namaRayon"
      queryKey="rayon"
      searchFields={["namaRayon"]}
      service={{
        get: (params) => masterService.getRayon(params), // Pass params to enable sorting
        create: (data) => masterService.createRayon(data),
        update: (id, data) => masterService.updateRayon(id, data),
        delete: (id) => masterService.deleteRayon(id),
      }}
      title="Kelola Rayon"
      viewFields={viewFields}
    />
  );
}
