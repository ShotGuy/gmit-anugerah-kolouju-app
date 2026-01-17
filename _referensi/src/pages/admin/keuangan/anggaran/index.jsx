import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  Plus,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";

export default function AnggaranIndexPage() {
  const router = useRouter();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Query untuk get periode list
  const { data, isLoading, error } = useQuery({
    queryKey: ["periode-anggaran-list", selectedYear],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/periode", {
        params: {
          limit: 50,
          tahun: selectedYear,
        },
      });
      return response.data.data;
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { text: "Draft", variant: "secondary" },
      ACTIVE: { text: "Aktif", variant: "success" },
      CLOSED: { text: "Tutup", variant: "destructive" },
    };
    return statusMap[status] || { text: status, variant: "secondary" };
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat data periode anggaran..." />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-sm text-gray-500">
                {error.response?.data?.message || "Gagal memuat data periode"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const periods = data?.items || [];

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Keuangan", href: "/admin/keuangan" },
          { label: "Kelola Anggaran" },
        ]}
        description="Pilih periode untuk mengatur anggaran keuangan gereja"
        title="Kelola Anggaran"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Filter */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Filter Periode
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push("/admin/data-master/keuangan/periode")
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Periode
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Periode List */}
        {periods.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum Ada Periode
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Belum ada periode anggaran untuk tahun {selectedYear}
                </p>
                <Button
                  onClick={() =>
                    router.push("/admin/data-master/keuangan/periode")
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Periode Baru
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {periods.map((periode) => (
              <Card
                key={periode.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{periode.nama}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Tahun {periode.tahun}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge variant={getStatusBadge(periode.status).variant}>
                        {getStatusBadge(periode.status).text}
                      </Badge>
                      <Badge
                        variant={periode.isActive ? "success" : "secondary"}
                      >
                        {periode.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Periode
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(periode.tanggalMulai)} -{" "}
                        {formatDate(periode.tanggalAkhir)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {periode._count?.anggaranItems || 0}
                        </div>
                        <div className="text-xs text-blue-700">
                          Item Anggaran
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {(periode._count?.transaksiPenerimaan || 0) +
                            (periode._count?.transaksiPengeluaran || 0)}
                        </div>
                        <div className="text-xs text-green-700">Transaksi</div>
                      </div>
                    </div>

                    {periode.keterangan && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Keterangan
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {periode.keterangan}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/keuangan/anggaran/${periode.id}`)
                        }
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Kelola Anggaran
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {periods.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total Periode ({selectedYear})
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {periods.filter((p) => p.status === "ACTIVE").length}
                </div>
                <div className="text-sm text-blue-700">Periode Aktif</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {periods.reduce(
                    (sum, p) => sum + (p._count?.anggaranItems || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-green-700">
                  Total Item Anggaran
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

AnggaranIndexPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
