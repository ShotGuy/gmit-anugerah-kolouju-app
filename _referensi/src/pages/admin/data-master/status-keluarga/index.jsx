import masterService from "@/services/masterService";
import MasterDataPage from "@/components/ui/MasterDataPage";

export default function StatusKeluargaPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "status",
      label: "Status Keluarga",
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
    { key: "status", label: "Status Keluarga" },
    { 
      key: "isActive", 
      label: "Status Aktif", 
      getValue: (item) => item?.isActive ? "Aktif" : "Tidak Aktif" 
    },
  ];

  const formFields = [
    {
      key: "status",
      label: "Status Keluarga",
      type: "text",
      required: true,
      placeholder: "Masukkan status keluarga"
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
        { label: "Status Keluarga" },
      ]}
      columns={columns}
      description="Kelola data status keluarga"
      exportable={true}
      formFields={formFields}
      itemNameField="status"
      queryKey="status-keluarga"
      searchFields={["status"]}
      service={{
        get: () => masterService.getStatusKeluarga(),
        create: (data) => masterService.createStatusKeluarga(data),
        update: (id, data) => masterService.updateStatusKeluarga(id, data),
        delete: (id) => masterService.deleteStatusKeluarga(id)
      }}
      title="Data Status Keluarga"
      viewFields={viewFields}
    />
  );
}