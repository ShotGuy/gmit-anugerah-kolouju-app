import axios from "axios";

import MasterDataPage from "@/components/ui/MasterDataPage";

const periodeAnggaranService = {
  get: async (params) => {
    const response = await axios.get("/api/keuangan/periode", { params });

    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/api/keuangan/periode", data);

    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.patch(`/api/keuangan/periode/${id}`, data);

    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/api/keuangan/periode/${id}`);

    return response.data;
  },
};

export default function PeriodeAnggaranPage() {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { text: "Draft", variant: "secondary" },
      ACTIVE: { text: "Aktif", variant: "success" },
      CLOSED: { text: "Tutup", variant: "destructive" },
    };

    return statusMap[status] || { text: status, variant: "secondary" };
  };

  const columns = [
    {
      key: "nama",
      label: "Nama Periode",
      type: "text",
    },
    {
      key: "tahun",
      label: "Tahun",
      type: "text",
      width: "100px",
    },
    {
      key: "tanggalMulai",
      label: "Periode",
      type: "custom",
      render: (value, item) =>
        `${formatDate(item.tanggalMulai)} - ${formatDate(item.tanggalAkhir)}`,
    },
    {
      key: "status",
      label: "Status",
      type: "custom",
      render: (value, item) => getStatusBadge(item.status).text,
    },
    {
      key: "_count.itemKeuangan",
      label: "Item Keuangan",
      type: "custom",
      render: (value, item) =>
        item && item._count && typeof item._count.itemKeuangan === "number"
          ? `${item._count.itemKeuangan} item`
          : "0 item",
    },
    {
      key: "isActive",
      label: "Aktif",
      type: "custom",
      render: (value, item) => (item.isActive ? "Aktif" : "Tidak Aktif"),
    },
  ];

  const viewFields = [
    { key: "nama", label: "Nama Periode" },
    { key: "tahun", label: "Tahun Anggaran" },
    {
      key: "tanggalMulai",
      label: "Tanggal Mulai",
      render: (item) => formatDate(item.tanggalMulai),
    },
    {
      key: "tanggalAkhir",
      label: "Tanggal Akhir",
      render: (item) => formatDate(item.tanggalAkhir),
    },
    {
      key: "status",
      label: "Status Periode",
      render: (item) => getStatusBadge(item.status).text,
    },
    { key: "keterangan", label: "Keterangan" },
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
      label: "Status Aktif",
      type: "boolean",
      render: (item) => (item.isActive ? "Aktif" : "Tidak Aktif"),
    },
    { key: "createdAt", label: "Dibuat Pada", type: "datetime" },
    { key: "updatedAt", label: "Diperbarui Pada", type: "datetime" },
  ];

  const currentYear = new Date().getFullYear();

  const formFields = [
    {
      key: "nama",
      label: "Nama Periode",
      type: "text",
      required: true,
      placeholder: "Contoh: Anggaran 2025",
      validation: {
        maxLength: {
          value: 100,
          message: "Nama periode maksimal 100 karakter",
        },
        minLength: {
          value: 2,
          message: "Nama periode minimal 2 karakter",
        },
      },
    },
    {
      key: "tahun",
      label: "Tahun Anggaran",
      type: "number",
      required: true,
      defaultValue: currentYear,
      validation: {
        min: {
          value: 2020,
          message: "Tahun tidak boleh kurang dari 2020",
        },
        max: {
          value: currentYear + 10,
          message: `Tahun tidak boleh lebih dari ${currentYear + 10}`,
        },
      },
    },
    {
      key: "tanggalMulai",
      label: "Tanggal Mulai",
      type: "date",
      required: true,
    },
    {
      key: "tanggalAkhir",
      label: "Tanggal Akhir",
      type: "date",
      required: true,
    },
    {
      key: "status",
      label: "Status Periode",
      type: "select",
      defaultValue: "DRAFT",
      options: [
        { value: "DRAFT", label: "Draft" },
        { value: "ACTIVE", label: "Aktif" },
        { value: "CLOSED", label: "Tutup" },
      ],
      description: "Status periode anggaran untuk menentukan penggunaan",
    },
    {
      key: "keterangan",
      label: "Keterangan",
      type: "textarea",
      placeholder: "Keterangan tambahan untuk periode anggaran",
      rows: 3,
    },
    {
      key: "isActive",
      label: "Status Aktif",
      type: "boolean",
      defaultValue: true,
      description: "Periode aktif dapat digunakan untuk transaksi keuangan",
    },
    {
      key: "autoPopulateItems",
      label: "Auto Populate Item Anggaran",
      type: "boolean",
      defaultValue: true,
      description:
        "Otomatis copy semua item keuangan sebagai template anggaran untuk periode ini",
    },
  ];

  return (
    <MasterDataPage
      allowBulkDelete={false}
      breadcrumb={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Data Master" },
        { label: "Periode Anggaran" },
      ]}
      columns={columns}
      description="Kelola periode anggaran untuk sistem keuangan gereja"
      exportable={true}
      filters={[
        {
          key: "tahun",
          label: "Tahun",
          type: "select",
          options: Array.from({ length: 11 }, (_, i) => {
            const year = currentYear - 5 + i;

            return { value: year.toString(), label: year.toString() };
          }),
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "DRAFT", label: "Draft" },
            { value: "ACTIVE", label: "Aktif" },
            { value: "CLOSED", label: "Tutup" },
          ],
        },
      ]}
      formFields={formFields}
      itemNameField="nama"
      queryKey="periode-anggaran"
      searchFields={["nama", "keterangan"]}
      service={periodeAnggaranService}
      title="Kelola Periode Anggaran"
      viewFields={viewFields}
    />
  );
}
