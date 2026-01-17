import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  RefreshCw, 
  Calculator, 
  FileText, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Trash2,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AnggaranPeriodePage() {
  const router = useRouter();
  const { periodeId } = router.query;
  const queryClient = useQueryClient();

  const [showPopulateDialog, setShowPopulateDialog] = useState(false);

  // Query untuk get periode dan anggaran
  const { data: periode, isLoading, error } = useQuery({
    queryKey: ["periode-anggaran", periodeId],
    queryFn: async () => {
      if (!periodeId) return null;
      const response = await axios.get(`/api/keuangan/periode/${periodeId}`);
      return response.data.data;
    },
    enabled: !!periodeId,
  });

  // Mutation untuk populate anggaran
  const populateMutation = useMutation({
    mutationFn: async ({ overwrite = false }) => {
      const response = await axios.post(`/api/keuangan/periode/${periodeId}/populate`, {
        overwrite
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["periode-anggaran", periodeId] });
      toast.success(data.message || "Berhasil populate anggaran dari template");
      setShowPopulateDialog(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal populate anggaran");
    },
  });

  // Format rupiah helper
  const formatRupiah = (amount) => {
    if (!amount || amount === null || amount === "0" || amount === 0) return "Rp 0";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) return "Rp 0";
    return `Rp ${numAmount.toLocaleString("id-ID")}`;
  };

  // Group items by category and level for tree display
  const groupItemsByCategory = (items) => {
    if (!items || items.length === 0) return {};
    
    return items.reduce((acc, item) => {
      const categoryName = item.itemKeuangan.kategori.nama;
      if (!acc[categoryName]) {
        acc[categoryName] = {};
      }
      
      const level = item.itemKeuangan.level;
      if (!acc[categoryName][level]) {
        acc[categoryName][level] = [];
      }
      
      acc[categoryName][level].push(item);
      return acc;
    }, {});
  };

  const handlePopulate = (overwrite = false) => {
    populateMutation.mutate({ overwrite });
  };

  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat detail periode anggaran..." />;
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
              <Button 
                className="mt-4" 
                onClick={() => router.push("/admin/data-master/keuangan/periode")}
              >
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!periode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Periode Tidak Ditemukan
              </h3>
              <p className="text-sm text-gray-500">
                Periode anggaran yang diminta tidak ditemukan
              </p>
              <Button 
                className="mt-4" 
                onClick={() => router.push("/admin/data-master/keuangan/periode")}
              >
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedItems = groupItemsByCategory(periode.anggaranItems || []);
  const hasItems = periode.anggaranItems && periode.anggaranItems.length > 0;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Keuangan", href: "/admin/keuangan" },
          { label: "Periode", href: "/admin/data-master/keuangan/periode" },
          { label: periode.nama },
        ]}
        description={`Kelola anggaran untuk periode ${periode.nama} (${periode.tahun})`}
        title={`Anggaran: ${periode.nama}`}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Periode Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Informasi Periode
                </CardTitle>
              </div>
              <div className="flex space-x-2">
                <Badge variant={periode.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {periode.status}
                </Badge>
                <Badge variant={periode.isActive ? 'success' : 'secondary'}>
                  {periode.isActive ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Tahun</h4>
                <p className="text-gray-600">{periode.tahun}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Periode</h4>
                <p className="text-gray-600">
                  {new Date(periode.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(periode.tanggalAkhir).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Total Item</h4>
                <p className="text-gray-600">{periode._count?.anggaranItems || 0} item</p>
              </div>
            </div>
            {periode.keterangan && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">Keterangan</h4>
                <p className="text-gray-600">{periode.keterangan}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Kelola Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {!hasItems && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={populateMutation.isPending}
                  onClick={() => handlePopulate(false)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {populateMutation.isPending ? "Memproses..." : "Populate dari Template"}
                </Button>
              )}
              
              {hasItems && (
                <Button 
                  disabled={populateMutation.isPending}
                  variant="outline"
                  onClick={() => setShowPopulateDialog(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-populate Template
                </Button>
              )}
            </div>
            
            {!hasItems && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Belum Ada Item Anggaran
                </h4>
                <p className="text-blue-700 text-sm mt-1">
                  Periode ini belum memiliki item anggaran. Klik "Populate dari Template" untuk mengcopy semua item keuangan sebagai template anggaran.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anggaran Items */}
        {hasItems && (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([categoryName, levels]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    {categoryName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(levels).map(([level, items]) => (
                      <div key={level} className="space-y-2">
                        <h4 className="font-medium text-gray-700">
                          Level {level}
                        </h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                                item.itemKeuangan.level === 1 ? 'border-l-4 border-l-blue-500' :
                                item.itemKeuangan.level === 2 ? 'border-l-4 border-l-green-500 ml-4' :
                                'border-l-4 border-l-gray-400 ml-8'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-mono text-sm text-gray-500 mr-2">
                                    {item.itemKeuangan.kode}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {item.itemKeuangan.nama}
                                  </span>
                                </div>
                                <div className="mt-1 space-x-4 text-sm text-gray-600">
                                  {item.targetFrekuensi && item.satuanFrekuensi && (
                                    <span>
                                      Target: {item.targetFrekuensi}x/{item.satuanFrekuensi}
                                    </span>
                                  )}
                                  {item.nominalSatuan && (
                                    <span>
                                      {formatRupiah(item.nominalSatuan)}/satuan
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="font-medium text-gray-900">
                                    {formatRupiah(item.totalAnggaran)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Total Anggaran
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Populate Dialog */}
      <ConfirmDialog
        confirmText="Ya, Re-populate"
        description="Tindakan ini akan menimpa semua item anggaran yang sudah ada dengan template terbaru dari item keuangan. Apakah Anda yakin?"
        isLoading={populateMutation.isPending}
        open={showPopulateDialog}
        title="Re-populate Template Anggaran"
        variant="destructive"
        onConfirm={() => handlePopulate(true)}
        onOpenChange={setShowPopulateDialog}
      />
    </>
  );
}

AnggaranPeriodePage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};