import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Info,
  ListTree,
} from "lucide-react";
import { useRouter } from "next/router";

import AdminLayout from "@/components/layout/AdminLayout";
import RealisasiList from "@/components/keuangan/RealisasiList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageHeader from "@/components/ui/PageHeader";

export default function ItemKeuanganDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Query untuk get item detail
  const { data: itemData, isLoading } = useQuery({
    queryKey: ["item-keuangan-detail", id],
    queryFn: async () => {
      const response = await axios.get(`/api/keuangan/item/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Format rupiah
  const formatRupiah = (amount) => {
    if (!amount || amount === 0) return "Rp 0";
    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get level color
  const getLevelColor = (level) => {
    switch (level) {
      case 1:
        return "bg-blue-500";
      case 2:
        return "bg-green-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat detail item keuangan..." />;
  }

  if (!itemData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Item tidak ditemukan</p>
          <Button className="mt-4" onClick={() => router.push("/admin/keuangan/item")}>
            Kembali
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const item = itemData;

  return (
    <AdminLayout>
      <div className="space-y-6 p-4">
        <PageHeader
          action={
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={() => router.push("/admin/keuangan/item")}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          }
          breadcrumbs={[
            { label: "Keuangan", href: "/admin/keuangan" },
            { label: "Item Keuangan", href: "/admin/keuangan/item" },
            { label: item.kode },
          ]}
          description={`Detail informasi item keuangan ${item.kode}`}
          title={item.nama}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Informasi Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Kode */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Kode Item
                  </div>
                  <div className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                    {item.kode}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Level Hierarki
                  </div>
                  <Badge
                    className={`${getLevelColor(item.level)} text-white`}
                    variant="default"
                  >
                    Level {item.level}
                  </Badge>
                </div>

                {/* Kategori */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Kategori
                  </div>
                  <div className="font-medium">
                    {item.kategori?.nama || "-"}
                  </div>
                </div>

                {/* Periode */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Periode
                  </div>
                  <div className="font-medium">
                    {item.periode?.nama || "-"} ({item.periode?.tahun || "-"})
                  </div>
                </div>

                {/* Parent Item */}
                {item.parent && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Parent Item
                    </div>
                    <div className="font-medium text-sm">
                      {item.parent.kode} - {item.parent.nama}
                    </div>
                  </div>
                )}

                {/* Deskripsi */}
                {item.deskripsi && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Deskripsi
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {item.deskripsi}
                    </div>
                  </div>
                )}

                {/* Keterangan */}
                {item.keterangan && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Keterangan
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {item.keterangan}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Budget Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Target Anggaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Frekuensi */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Target Frekuensi
                  </div>
                  <div className="font-bold text-lg">
                    {item.targetFrekuensi || 0}x{" "}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      {item.satuanFrekuensi || ""}
                    </span>
                  </div>
                </div>

                {/* Nominal per Satuan */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Nominal per Satuan
                  </div>
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {formatRupiah(item.nominalSatuan)}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Target
                  </div>
                  <div className="font-bold text-2xl text-green-600 dark:text-green-400">
                    {formatRupiah(item.totalTarget)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ({item.targetFrekuensi || 0}x × {formatRupiah(item.nominalSatuan)})
                  </div>
                </div>

                {/* Children Count */}
                {item.children && item.children.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ListTree className="h-4 w-4" />
                      <span>{item.children.length} Sub Item</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Dibuat
                  </div>
                  <div>{formatDate(item.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Terakhir Diperbarui
                  </div>
                  <div>{formatDate(item.updatedAt)}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Status
                  </div>
                  <Badge variant={item.isActive ? "success" : "secondary"}>
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Realisasi Section */}
          <div className="lg:col-span-2">
            {/* Only show realisasi for level 4 items */}
            {item.level === 4 ? (
              <RealisasiList
                itemKeuangan={item}
                periodeId={item.periodeId}
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Realisasi Tidak Tersedia</p>
                    <p className="text-sm mt-2">
                      Realisasi hanya dapat diinput untuk item level 4
                    </p>
                    {item.children && item.children.length > 0 && (
                      <p className="text-sm mt-1">
                        Silakan pilih sub item di bawah ini untuk input
                        realisasi
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show children list if any */}
            {item.children && item.children.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListTree className="h-5 w-5" />
                    Sub Item ({item.children.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {item.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/keuangan/item/${child.id}`)
                        }
                      >
                        <div>
                          <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
                            {child.kode}
                          </div>
                          <div className="font-medium">{child.nama}</div>
                          {child.totalTarget && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Target: {formatRupiah(child.totalTarget)}
                            </div>
                          )}
                        </div>
                        <Badge
                          className={`${getLevelColor(child.level)} text-white`}
                        >
                          L{child.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
