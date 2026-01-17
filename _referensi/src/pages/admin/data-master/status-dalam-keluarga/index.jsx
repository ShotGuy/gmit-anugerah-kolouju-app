import masterService from "@/services/masterService";
import MasterDataPage from "@/components/ui/MasterDataPage";

export default function StatusDalamKeluargaPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "status",
      label: "Nama Status",
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
    { key: "status", label: "Status" },
    {
      key: "isActive",
      label: "Status Aktif",
      getValue: (item) => (item?.isActive ? "Aktif" : "Tidak Aktif"),
    },
  ];

  const formFields = [
    {
      key: "status",
      label: "Status Dalam Keluarga",
      type: "text",
      required: true,
      placeholder: "Masukkan status dalam keluarga",
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
        { label: "Status Dalam Keluarga" },
      ]}
      columns={columns}
      description="Kelola data status dalam keluarga"
      exportable={true}
      formFields={formFields}
      itemNameField="status"
      queryKey="status-dalam-keluarga"
      searchFields={["status"]}
      service={{
        get: () => masterService.getStatusDalamKeluarga(),
        create: (data) => masterService.createStatusDalamKeluarga(data),
        update: (id, data) => masterService.updateStatusDalamKeluarga(id, data),
        delete: (id) => masterService.deleteStatusDalamKeluarga(id),
      }}
      title="Data Status Dalam Keluarga"
      viewFields={viewFields}
    />
  );
}
