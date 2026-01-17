import masterService from "@/services/masterService";
import MasterDataPage from "@/components/ui/MasterDataPage";

export default function PendapatanPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "label",
      label: "Range Pendapatan",
      type: "text",
    },
    {
      key: "min",
      label: "Minimum (Rp)",
      type: "currency",
    },
    {
      key: "max",
      label: "Maksimum (Rp)",
      type: "currency",
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
    { key: "label", label: "Range Pendapatan" },
    { key: "min", label: "Minimum", getValue: (item) => `Rp ${item?.min?.toLocaleString('id-ID') || 0}` },
    { key: "max", label: "Maksimum", getValue: (item) => `Rp ${item?.max?.toLocaleString('id-ID') || 0}` },
    { 
      key: "isActive", 
      label: "Status Aktif", 
      getValue: (item) => item?.isActive ? "Aktif" : "Tidak Aktif" 
    },
  ];

  const formFields = [
    {
      key: "label",
      label: "Label Range Pendapatan",
      type: "text",
      required: true,
      placeholder: "Contoh: Rp 1.000.000 - Rp 2.500.000"
    },
    {
      key: "min",
      label: "Pendapatan Minimum",
      type: "number",
      required: true,
      min: 0,
      placeholder: "0"
    },
    {
      key: "max",
      label: "Pendapatan Maksimum",
      type: "number",
      required: true,
      min: 0,
      placeholder: "5000000"
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
        { label: "Pendapatan" },
      ]}
      columns={columns}
      description="Kelola data pendapatan"
      exportable={true}
      formFields={formFields}
      itemNameField="label"
      queryKey="pendapatan"
      searchFields={["rentangPendapatan"]}
      service={{
        get: () => masterService.getPendapatan(),
        create: (data) => masterService.createPendapatan(data),
        update: (id, data) => masterService.updatePendapatan(id, data),
        delete: (id) => masterService.deletePendapatan(id)
      }}
      title="Data Pendapatan"
      viewFields={viewFields}
    />
  );
}