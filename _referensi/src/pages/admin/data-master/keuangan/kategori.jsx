import axios from "axios";

import MasterDataPage from "@/components/ui/MasterDataPage";

const kategoriKeuanganService = {
  get: async (params) => {
    const response = await axios.get("/api/keuangan/kategori", {
      params: { ...params, includeCount: true },
    });

    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/api/keuangan/kategori", data);

    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.patch(`/api/keuangan/kategori/${id}`, data);

    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/api/keuangan/kategori/${id}`);

    return response.data;
  },
};

export default function KategoriKeuanganPage() {
  const columns = [
    {
      key: "kode",
      label: "Kode",
      type: "text",
      width: "80px",
    },
    {
      key: "nama",
      label: "Nama Kategori",
      type: "text",
    },
    // {
    //   key: "_count.itemKeuangan",
    //   label: "Jumlah Item",
    //   type: "custom",
    //   render: (item) =>
    //     item && item._count && typeof item._count.itemKeuangan === "number"
    //       ? `${item._count.itemKeuangan} item`
    //       : "0 item",
    // },
    {
      key: "isActive",
      label: "Status",
      type: "boolean",
      // render: (item) => (item.isActive ? "Aktif" : "Tidak Aktif"),
      variant: (item) => (item.isActive ? "success" : "secondary"),
    },
  ];

  const viewFields = [
    { key: "kode", label: "Kode Kategori" },
    { key: "nama", label: "Nama Kategori" },
    {
      key: "_count.itemKeuangan",
      label: "Jumlah Item Keuangan",
      render: (item) =>
        item && item._count && typeof item._count.itemKeuangan === "number"
          ? `${item._count.itemKeuangan} item`
          : "0 item",
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (item.isActive ? "Aktif" : "Tidak Aktif"),
    },
    { key: "createdAt", label: "Dibuat Pada", type: "datetime" },
    { key: "updatedAt", label: "Diperbarui Pada", type: "datetime" },
  ];

  const formFields = [
    {
      key: "kode",
      label: "Kode Kategori",
      type: "text",
      required: true,
      placeholder: "Contoh: A, B, C",
      validation: {
        maxLength: {
          value: 10,
          message: "Kode kategori maksimal 10 karakter",
        },
        minLength: {
          value: 1,
          message: "Kode kategori minimal 1 karakter",
        },
        pattern: {
          value: /^[A-Z0-9]+$/,
          message: "Kode hanya boleh huruf kapital dan angka",
        },
      },
    },
    {
      key: "nama",
      label: "Nama Kategori",
      type: "text",
      required: true,
      placeholder: "Contoh: PENERIMAAN, PENGELUARAN",
      validation: {
        maxLength: {
          value: 100,
          message: "Nama kategori maksimal 100 karakter",
        },
        minLength: {
          value: 2,
          message: "Nama kategori minimal 2 karakter",
        },
      },
    },
    {
      key: "isActive",
      label: "Status Aktif",
      type: "boolean",
      defaultValue: true,
      description: "Kategori aktif dapat digunakan untuk membuat item keuangan",
    },
  ];

  return (
    <MasterDataPage
      allowBulkDelete={false}
      breadcrumb={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Data Master" },
        { label: "Kategori Keuangan" },
      ]}
      columns={columns}
      description="Kelola kategori keuangan sesuai kebutuhan gereja Anda. Contoh: PENERIMAAN, PENGELUARAN, DANA PEMBANGUNAN, dll."
      exportable={true}
      formFields={formFields}
      itemNameField="nama"
      queryKey="kategori-keuangan"
      searchFields={["nama", "kode"]}
      service={kategoriKeuanganService}
      title="Kelola Kategori Keuangan"
      viewFields={viewFields}
    />
  );
}
