import masterService from "@/services/masterService";
import MasterDataPage from "@/components/ui/MasterDataPage";

export default function JaminanKesehatanPage() {
  const columns = [
    {
      key: "id",
      label: "ID",
      type: "text",
    },
    {
      key: "jenisJaminan",
      label: "Jenis Jaminan",
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
    { key: "jenisJaminan", label: "Jenis Jaminan" },
    { 
      key: "isActive", 
      label: "Status Aktif", 
      getValue: (item) => item?.isActive ? "Aktif" : "Tidak Aktif" 
    },
  ];

  const formFields = [
    {
      key: "jenisJaminan",
      label: "Jenis Jaminan",
      type: "text",
      required: true,
      placeholder: "Masukkan jenis jaminan kesehatan"
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
        { label: "Jaminan Kesehatan" },
      ]}
      columns={columns}
      description="Kelola data jaminan kesehatan"
      exportable={true}
      formFields={formFields}
      itemNameField="jenisJaminan"
      queryKey="jaminan-kesehatan"
      searchFields={["jenisJaminan"]}
      service={{
        get: () => masterService.getJaminanKesehatan(),
        create: (data) => masterService.createJaminanKesehatan(data),
        update: (id, data) => masterService.updateJaminanKesehatan(id, data),
        delete: (id) => masterService.deleteJaminanKesehatan(id)
      }}
      title="Data Jaminan Kesehatan"
      viewFields={viewFields}
    />
  );
}