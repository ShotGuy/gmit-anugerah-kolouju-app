import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Church, Calendar, Hash } from "lucide-react";

import jenisIbadahService from "@/services/jenisIbadahService";
import DetailPage from "@/components/ui/DetailPage";

export default function JenisIbadahDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, error } = useQuery({
    queryKey: ["jenis-ibadah", id],
    queryFn: () => jenisIbadahService.getById(id),
    enabled: !!id,
  });

  const jenisIbadah = data?.data;

  const sections = [
    {
      title: "Informasi Jenis Ibadah",
      icon: Church,
      fields: [
        {
          label: "ID",
          value: jenisIbadah?.id,
          icon: Hash,
          render: (value) => (
            <span className="font-mono text-sm text-gray-600">{value}</span>
          ),
        },
        {
          label: "Nama Ibadah",
          value: jenisIbadah?.namaIbadah,
          icon: Church,
        },
        {
          label: "Jumlah Penggunaan",
          value: `${jenisIbadah?._count?.ibadahKeluargaJemaats || 0} kali`,
          icon: Calendar,
          render: (value) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              parseInt(value) > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {value}
            </span>
          ),
        },
      ],
    },
  ];

  const actions = [
    {
      label: "Kembali",
      icon: ArrowLeft,
      variant: "outline",
      onClick: () => router.push("/admin/jenis-ibadah"),
    },
    {
      label: "Edit Jenis Ibadah",
      icon: Edit,
      onClick: () => router.push(`/admin/jenis-ibadah/${id}/edit`),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Gagal memuat data jenis ibadah</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => router.push("/admin/jenis-ibadah")}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <DetailPage
      actions={actions}
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Jenis Ibadah", href: "/admin/jenis-ibadah" },
        { label: jenisIbadah?.namaIbadah || "Detail" },
      ]}
      description="Informasi lengkap jenis ibadah"
      isLoading={isLoading}
      sections={sections}
      title={`Detail Jenis Ibadah - ${jenisIbadah?.namaIbadah || 'Loading...'}`}
    />
  );
}