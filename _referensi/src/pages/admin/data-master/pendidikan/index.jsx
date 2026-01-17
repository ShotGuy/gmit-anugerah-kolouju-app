import MasterDataPage from "@/components/ui/MasterDataPage";
import masterService from "@/services/masterService";

export default function PendidikanPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "jenjang",
      label: "Jenjang Pendidikan",
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
    { key: "jenjang", label: "Jenjang Pendidikan" },
    {
      key: "isActive",
      label: "Status Aktif",
      getValue: (item) => (item?.isActive ? "Aktif" : "Tidak Aktif"),
    },
  ];

  const formFields = [
    {
      key: "jenjang",
      label: "Jenjang Pendidikan",
      type: "text",
      required: true,
      placeholder: "Masukkan jenjang pendidikan",
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
        { label: "Pendidikan" },
      ]}
      columns={columns}
      description="Kelola data pendidikan"
      exportable={true}
      formFields={formFields}
      itemNameField="jenjang"
      queryKey="pendidikan"
      searchFields={["jenjang"]}
      service={{
        get: () => masterService.getPendidikan(),
        create: (data) => masterService.createPendidikan(data),
        update: (id, data) => masterService.updatePendidikan(id, data),
        delete: (id) => masterService.deletePendidikan(id),
      }}
      title="Data Pendidikan"
      viewFields={viewFields}
    />
  );
}
