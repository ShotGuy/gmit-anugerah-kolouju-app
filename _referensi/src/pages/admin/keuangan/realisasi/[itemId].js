import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/router";

import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";

export default function RealisasiDetailPage() {
  const router = useRouter();
  const { itemId } = router.query;

  // Query untuk get item keuangan detail
  const { data: itemData, isLoading: itemLoading } = useQuery({
    queryKey: ["item-detail", itemId],
    queryFn: async () => {
      const response = await axios.get(`/api/keuangan/item/${itemId}`);

      return response.data.data;
    },
    enabled: !!itemId,
  });

  // Query untuk get realisasi summary untuk item ini
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["realisasi-item-summary", itemId],
    queryFn: async () => {
      const params = {
        itemKeuanganId: itemId,
      };

      const response = await axios.get("/api/keuangan/realisasi/summary", {
        params,
      });

      return response.data.data;
    },
    enabled: !!itemId,
  });

  // Query untuk get realisasi detail list
  const { data: realisasiData, isLoading: realisasiLoading } = useQuery({
    queryKey: ["realisasi-item-list", itemId],
    queryFn: async () => {
      const params = {
        itemKeuanganId: itemId,
        limit: 100,
      };

      const response = await axios.get("/api/keuangan/realisasi", { params });

      return response.data.data;
    },
    enabled: !!itemId,
  });

  // Format rupiah
  const formatRupiah = (amount) => {
    if (!amount || amount === 0) return "Rp 0";

    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  // Format persentase
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (itemLoading) {
    return <LoadingScreen isLoading={true} message="Memuat detail item realisasi..." />;
  }

  if (!itemData) {
    return (
      <AdminLayout>
        <div className="space-y-6 p-4">
          <PageHeader
            breadcrumbs={[
              { label: "Keuangan", href: "/admin/keuangan" },
              { label: "Realisasi", href: "/admin/keuangan/realisasi" },
              { label: "Detail" },
            ]}
            title="Data Tidak Ditemukan"
          />

          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">
                Item keuangan tidak ditemukan
              </p>
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/keuangan/realisasi")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Get the specific item summary (should be the only item when itemKeuanganId is specified)
  const itemSummary =
    summaryData?.items?.find((item) => item.id === itemId) ||
    summaryData?.items?.[0];

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        breadcrumbs={[
          { label: "Keuangan", href: "/admin/keuangan" },
          { label: "Realisasi", href: "/admin/keuangan/realisasi" },
          { label: "Detail" },
        ]}
        description={`Detail realisasi untuk ${itemData.kode} - ${itemData.nama}`}
        title="Detail Realisasi Item"
      />
      <PageTitle
        title={`Detail Realisasi ${itemData.kode} - ${itemData.nama}`}
      />

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/keuangan/realisasi")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Button onClick={() => router.push("/admin/keuangan/realisasi/create")}>
          Tambah Realisasi
        </Button>
      </div>

      {/* Item Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Informasi Item Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <span className="text-sm text-gray-600">Kode Item:</span>
              <p className="font-mono font-bold text-lg">{itemData.kode}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Nama Item:</span>
              <p className="font-medium">{itemData.nama}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Kategori:</span>
              <p>{itemData.kategori?.nama}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Periode:</span>
              <p>
                {itemData.periode?.nama} ({itemData.periode?.tahun})
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Target Frekuensi:</span>
              <p>
                {itemData.targetFrekuensi || 0}x {itemData.satuanFrekuensi}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Nominal Satuan:</span>
              <p className="font-medium">
                {formatRupiah(itemData.nominalSatuan)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Target:</span>
              <p className="text-lg font-bold text-blue-600">
                {formatRupiah(itemData.totalTarget)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Level:</span>
              <Badge variant="secondary">Level {itemData.level}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {itemSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Target
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatRupiah(itemSummary.totalTarget || 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Realisasi
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatRupiah(itemSummary.totalRealisasiAmount || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selisih</p>
                  <p
                    className={`text-2xl font-bold ${
                      parseFloat(itemSummary.varianceAmount || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatRupiah(itemSummary.varianceAmount || 0)}
                  </p>
                </div>
                {parseFloat(itemSummary.varianceAmount || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Frekuensi Actual
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {itemSummary.totalFrekuensiActual || 0}x
                  </p>
                  <p className="text-sm text-gray-500">
                    Target: {itemData.targetFrekuensi || 0}x
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievement Status */}
      {itemSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Status Pencapaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Pencapaian Target:
                  </span>
                  <Badge
                    variant={
                      itemSummary.isTargetAchieved ? "success" : "secondary"
                    }
                  >
                    {itemSummary.isTargetAchieved
                      ? "Tercapai"
                      : "Belum Tercapai"}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      itemSummary.achievementPercentage >= 100
                        ? "bg-green-600"
                        : itemSummary.achievementPercentage >= 75
                          ? "bg-blue-600"
                          : itemSummary.achievementPercentage >= 50
                            ? "bg-yellow-600"
                            : "bg-red-600"
                    }`}
                    style={{
                      width: `${Math.min(Math.max(itemSummary.achievementPercentage || 0, 0), 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600">
                    {formatPercentage(itemSummary.achievementPercentage || 0)}{" "}
                    dari target
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(itemSummary.totalRealisasiAmount)} /{" "}
                    {formatRupiah(itemSummary.totalTarget)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Frekuensi:</span>
                  <span className="text-sm">
                    {itemSummary.totalFrekuensiActual || 0} /{" "}
                    {itemData.targetFrekuensi || 0} kali
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      (itemSummary.totalFrekuensiActual /
                        (itemData.targetFrekuensi || 1)) *
                        100 >=
                      100
                        ? "bg-green-600"
                        : (itemSummary.totalFrekuensiActual /
                              (itemData.targetFrekuensi || 1)) *
                              100 >=
                            75
                          ? "bg-blue-600"
                          : (itemSummary.totalFrekuensiActual /
                                (itemData.targetFrekuensi || 1)) *
                                100 >=
                              50
                            ? "bg-yellow-600"
                            : "bg-red-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max(
                          ((itemSummary.totalFrekuensiActual || 0) /
                            (itemData.targetFrekuensi || 1)) *
                            100,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600">
                    {Math.round(
                      ((itemSummary.totalFrekuensiActual || 0) /
                        (itemData.targetFrekuensi || 1)) *
                        100
                    )}
                    % dari target frekuensi
                  </p>
                  <p className="text-xs text-gray-500">
                    {itemSummary.totalFrekuensiActual || 0} transaksi
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Realisasi List */}
      <Card>
        <CardHeader>
          <CardTitle>History Realisasi</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading || realisasiLoading ? (
            <LoadingScreen isLoading={true} message="Memuat history realisasi..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Tanggal
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Total Realisasi
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Keterangan
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {realisasiData?.realisasi?.length > 0 ? (
                    realisasiData.realisasi.map((realisasi, index) => (
                      <tr key={realisasi.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                          {new Date(
                            realisasi.tanggalRealisasi
                          ).toLocaleDateString("id-ID")}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                          {formatRupiah(realisasi.totalRealisasi)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {realisasi.keterangan || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/admin/keuangan/realisasi/edit/${realisasi.id}`
                              )
                            }
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                        colSpan={5}
                      >
                        Belum ada data realisasi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// RealisasiDetailPage.getLayout = function getLayout(page) {
//   return <AdminLayout>{page}</AdminLayout>;
// };
