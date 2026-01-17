import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Download,
  Info,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUser } from "@/hooks/useUser";

export default function KeuanganSetupPage() {
  const queryClient = useQueryClient();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { user: authData } = useUser();

  // Query untuk cek status data
  const { data: statusData, isLoading } = useQuery({
    queryKey: ["keuangan-status"],
    queryFn: async () => {
      const [kategoriRes, itemRes, periodeRes] = await Promise.all([
        axios.get("/api/keuangan/kategori"),
        axios.get("/api/keuangan/item"),
        axios.get("/api/keuangan/periode"),
      ]);

      return {
        kategori: kategoriRes.data.data?.pagination?.total || 0,
        items: itemRes.data.data?.pagination?.total || 0,
        periode: periodeRes.data.data?.pagination?.total || 0,
      };
    },
  });

  // Mutation untuk seed data
  const seedMutation = useMutation({
    mutationFn: async (force = false) => {
      const response = await axios.post("/api/keuangan/seed", { force });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keuangan-status"] });
      queryClient.invalidateQueries({ queryKey: ["kategori-keuangan"] });
      queryClient.invalidateQueries({ queryKey: ["item-keuangan"] });
      toast.success("Data seed berhasil dibuat");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Gagal membuat seed data");
    },
  });

  // Mutation untuk clear data
  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.delete("/api/keuangan/seed");

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keuangan-status"] });
      queryClient.invalidateQueries({ queryKey: ["kategori-keuangan"] });
      queryClient.invalidateQueries({ queryKey: ["item-keuangan"] });
      toast.success("Semua data keuangan berhasil dihapus");
      setShowClearDialog(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus data");
      setShowClearDialog(false);
    },
  });

  const hasData =
    statusData && (statusData.kategori > 0 || statusData.items > 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Setup Sistem Keuangan</h1>
        <p className="text-gray-600">
          Kelola setup dan konfigurasi data master keuangan
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kategori Keuangan
            </CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusData?.kategori || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total kategori terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Keuangan</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData?.items || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total item dalam sistem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Periode Anggaran
            </CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData?.periode || 0}</div>
            <p className="text-xs text-muted-foreground">Total periode aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {hasData ? (
            <>
              <strong>Status:</strong>{" "}
              <Badge className="mr-2" variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Data Tersedia
              </Badge>
              Sistem keuangan sudah memiliki data master. Anda dapat menambah
              kategori dan item baru sesuai kebutuhan.
            </>
          ) : (
            <>
              <strong>Status:</strong>{" "}
              <Badge className="mr-2" variant="secondary">
                Data Kosong
              </Badge>
              Sistem belum memiliki data master keuangan. Silahkan buat data
              seed atau tambah manual.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seed Data Section */}
          {authData?.isAdmin && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Data Seed (Contoh)</h3>
              <p className="text-gray-600 text-sm mb-4">
                Buat data contoh untuk memulai. Akan membuat kategori PENERIMAAN &
                PENGELUARAN beserta beberapa item standar seperti Perpuluhan,
                Operasional, dll.
              </p>

              <div className="flex gap-3">
                <Button
                  className="flex items-center gap-2"
                  disabled={seedMutation.isPending}
                  onClick={() => seedMutation.mutate(false)}
                >
                  <Download className="w-4 h-4" />
                  {seedMutation.isPending ? "Membuat..." : "Buat Data Seed"}
                </Button>

                {hasData && (
                  <Button
                    className="flex items-center gap-2"
                    disabled={seedMutation.isPending}
                    variant="outline"
                    onClick={() => seedMutation.mutate(true)}
                  >
                    <Download className="w-4 h-4" />
                    Force Seed (Timpa)
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Manual Setup Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Setup Manual</h3>
            <p className="text-gray-600 text-sm mb-4">
              Buat kategori dan item keuangan sesuai kebutuhan gereja Anda
              secara manual.
            </p>

            <div className="flex gap-3">
              <Button
                className="flex items-center gap-2"
                variant="outline"
                onClick={() =>
                  window.open("/admin/data-master/keuangan/kategori", "_blank")
                }
              >
                <Database className="w-4 h-4" />
                Kelola Kategori
              </Button>

              <Button
                className="flex items-center gap-2"
                variant="outline"
                onClick={() =>
                  window.open("/admin/data-master/keuangan/item", "_blank")
                }
              >
                <Database className="w-4 h-4" />
                Kelola Item
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          {authData?.isAdmin && hasData && (
            <div className="border-red-200 border rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-lg mb-2 text-red-800">
                Danger Zone
              </h3>
              <p className="text-red-700 text-sm mb-4">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Aksi ini akan menghapus SEMUA data keuangan (kategori, item,
                transaksi, dll). Data yang sudah dihapus tidak dapat
                dikembalikan!
              </p>

              <Button
                className="flex items-center gap-2"
                disabled={clearMutation.isPending}
                variant="destructive"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        confirmText="Ya, Hapus Semua"
        isLoading={clearMutation.isPending}
        isOpen={showClearDialog}
        message={
          <>
            <p className="mb-2">
              Anda akan menghapus <strong>SEMUA</strong> data keuangan termasuk:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Semua kategori keuangan</li>
              <li>Semua item keuangan</li>
              <li>Semua periode anggaran</li>
              <li>Semua transaksi penerimaan & pengeluaran</li>
              <li>Semua data rekap dan anggaran</li>
            </ul>
            <p className="mt-2 font-semibold text-red-600">
              Data yang dihapus tidak dapat dikembalikan!
            </p>
          </>
        }
        title="Hapus Semua Data Keuangan"
        variant="danger"
        onClose={() => setShowClearDialog(false)}
        onConfirm={() => clearMutation.mutate()}
      />
    </div>
  );
}
