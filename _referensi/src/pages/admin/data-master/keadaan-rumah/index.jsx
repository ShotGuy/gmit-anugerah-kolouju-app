import masterService from "@/services/masterService";
import MasterDataPage from "@/components/ui/MasterDataPage";

export default function KeadaanRumahPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "keadaan",
      label: "Keadaan Rumah",
      type: "text",
    },
    {
      key: "isActive",
      label: "Status",
      type: "boolean",
      badgeVariant: (value) => (value === true ? "success" : "danger"),
    },
  ];

  const viewFields = [
    { key: "id", label: "ID" },
    { key: "keadaan", label: "Keadaan Rumah" },
    { 
      key: "isActive", 
      label: "Status Aktif", 
      getValue: (item) => item?.isActive ? "Aktif" : "Tidak Aktif" 
    },
  ];

  const formFields = [
    {
      key: "keadaan",
      label: "Keadaan Rumah",
      type: "text",
      required: true,
      placeholder: "Masukkan keadaan rumah"
    },
    {
      key: "isActive",
      label: "Status Aktif",
      type: "boolean",
      defaultValue: true
    }
  ];

  return (
    <MasterDataPage
      allowBulkDelete={true}
      breadcrumb={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Keadaan Rumah" },
      ]}
      columns={columns}
      description="Kelola data keadaan rumah"
      exportable={true}
      formFields={formFields}
      itemNameField="keadaan"
      queryKey="keadaan-rumah"
      searchFields={["keadaan"]}
      service={{
        get: () => masterService.getKeadaanRumah(),
        create: (data) => masterService.createKeadaanRumah(data),
        update: (id, data) => masterService.updateKeadaanRumah(id, data),
        delete: (id) => masterService.deleteKeadaanRumah(id)
      }}
      title="Data Keadaan Rumah"
      viewFields={viewFields}
    />
  );
}