import masterService from "@/services/masterService";
import MasterDataPage from "@/components/ui/MasterDataPage";

export default function SukuPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "namaSuku",
      label: "Nama Suku",
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
    { key: "namaSuku", label: "Nama Suku" },
    {
      key: "isActive",
      label: "Status Aktif",
      getValue: (item) => (item?.isActive ? "Aktif" : "Tidak Aktif"),
    },
  ];

  const formFields = [
    {
      key: "namaSuku",
      label: "Nama Suku",
      type: "text",
      required: true,
      placeholder: "Masukkan nama suku",
    },
    {
      key: "isActive",
      label: "Status Aktif",
      type: "boolean",
      defaultValue: true,
    },
  ];

  return (
    <MasterDataPage
      allowBulkDelete={true}
      breadcrumb={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Suku" },
      ]}
      columns={columns}
      description="Kelola data suku"
      exportable={true}
      formFields={formFields}
      itemNameField="namaSuku"
      queryKey="suku"
      searchFields={["namaSuku"]}
      service={{
        get: () => masterService.getSuku(),
        create: (data) => masterService.createSuku(data),
        update: (id, data) => masterService.updateSuku(id, data),
        delete: (id) => masterService.deleteSuku(id),
      }}
      title="Data Suku"
      viewFields={viewFields}
    />
  );
}
