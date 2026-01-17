import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Calendar,
  List,
  Trash2,
  Edit,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye
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

export default function ItemKeuanganPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [itemToDelete, setItemToDelete] = useState(null);

  // Check for periodeId query parameter on component mount
  useEffect(() => {
    if (router.query.periodeId) {
      setSelectedPeriode(router.query.periodeId);
    }
  }, [router.query.periodeId]);

  // Query untuk get periode list
  const { data: periodeList } = useQuery({
    queryKey: ["periode-list"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/periode", {
        params: { limit: 50, isActive: true }
      });
      return response.data.data.items;
    },
  });

  // Query untuk get kategori list
  const { data: kategoriList } = useQuery({
    queryKey: ["kategori-list"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/kategori");
      return response.data.data;
    },
  });

  // Query untuk get item keuangan berdasarkan filter
  const { data: itemList, isLoading, refetch } = useQuery({
    queryKey: ["item-keuangan", selectedPeriode, selectedKategori],
    queryFn: async () => {
      const params = {};
      if (selectedPeriode) params.periodeId = selectedPeriode;
      if (selectedKategori) params.kategoriId = selectedKategori;

      const response = await axios.get("/api/keuangan/item", { params });
      return response.data.data;
    },
    enabled: !!selectedPeriode, // Only fetch when periode is selected
  });

  // Mutation untuk delete item
  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      await axios.delete(`/api/keuangan/item/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-keuangan"] });
      toast.success("Item keuangan berhasil dihapus");
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus item");
    },
  });

  // Format rupiah
  const formatRupiah = (amount) => {
    if (!amount || amount === 0) return "Rp 0";
    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  // Build tree structure
  const buildTree = (items) => {
    if (!items) return [];
    
    const itemsMap = new Map();
    const rootItems = [];

    // First pass: create map
    items.forEach(item => {
      itemsMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build tree
    items.forEach(item => {
      if (item.parentId) {
        const parent = itemsMap.get(item.parentId);
        if (parent) {
          parent.children.push(itemsMap.get(item.id));
        }
      } else {
        rootItems.push(itemsMap.get(item.id));
      }
    });

    return rootItems;
  };

  // Toggle expand/collapse
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Render tree node
  const renderTreeNode = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes.has(item.id);
    const paddingLeft = level * 24;

    return (
      <div key={item.id}>
        {/* Node Row */}
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
            level > 0 ? 'border-l-2 border-l-gray-200 dark:border-l-gray-600' : ''
          }`}
          style={{ paddingLeft: paddingLeft + 16 }}
        >
          <div className="flex items-center flex-1">
            {/* Expand/Collapse Button */}
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              {hasChildren ? (
                <button
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => toggleNode(item.id)}
                >
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </button>
              ) : (
                <div className="w-4 h-4" />
              )}
            </div>

            {/* Item Info */}
            <div className="flex-1">
              <div className="flex items-center">
                <Badge className="mr-3 font-mono text-xs" variant="outline">
                  {item.kode}
                </Badge>
                <span className={`font-medium ${
                  level === 0 ? 'text-lg text-gray-900 dark:text-gray-100' :
                  level === 1 ? 'text-base text-gray-800 dark:text-gray-200' :
                  'text-sm text-gray-700 dark:text-gray-300'
                }`}>
                  {item.nama}
                </span>
              </div>
              
              {item.deskripsi && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-12">
                  {item.deskripsi}
                </p>
              )}

              <div className="flex items-center mt-2 ml-12 space-x-4 text-xs text-gray-600 dark:text-gray-400">
                <span>Level: {item.level}</span>
                <span>Urutan: {item.urutan}</span>
                {item.jumlahTransaksi > 0 && (
                  <span className="text-green-600 dark:text-green-400">
                    {item.jumlahTransaksi} transaksi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nominal & Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`font-medium ${
                parseFloat(item.nominalActual) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {formatRupiah(item.nominalActual)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Actual
              </div>
            </div>

            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/keuangan/item/${item.id}`)}
                title="Lihat Detail"
              >
                <Eye className="h-3 w-3" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/keuangan/item/${item.id}/edit`)}
                title="Edit Item"
              >
                <Edit className="h-3 w-3" />
              </Button>

              <Button
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                size="sm"
                variant="outline"
                onClick={() => setItemToDelete(item)}
                title="Hapus Item"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {item.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree(itemList);
  const selectedPeriodeData = periodeList?.find(p => p.id === selectedPeriode);

  if (isLoading && selectedPeriode) {
    return <LoadingScreen isLoading={true} message="Memuat item keuangan..." />;
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Keuangan", href: "/admin/keuangan" },
          { label: "Item Keuangan" },
        ]}
        description="Kelola item keuangan per periode dengan struktur hierarkis"
        title="Kelola Item Keuangan"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Periode Anggaran *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={selectedPeriode}
                  onChange={(e) => setSelectedPeriode(e.target.value)}
                >
                  <option value="">Pilih Periode</option>
                  {periodeList?.map((periode) => (
                    <option key={periode.id} value={periode.id}>
                      {periode.nama} ({periode.tahun})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori (Opsional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {kategoriList?.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                      {kategori.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedPeriode ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pilih Periode Anggaran
                </h3>
                <p className="text-sm text-gray-500">
                  Silakan pilih periode anggaran terlebih dahulu untuk melihat item keuangan
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Selected Period Info */}
            {selectedPeriodeData && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {selectedPeriodeData.nama}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(selectedPeriodeData.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(selectedPeriodeData.tanggalAkhir).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/admin/keuangan/item/create?periodeId=${selectedPeriode}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Item
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Items List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <List className="h-5 w-5 mr-2" />
                  Item Keuangan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!treeData || treeData.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Belum Ada Item
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Belum ada item keuangan untuk periode ini
                    </p>
                    <Button
                      onClick={() => router.push(`/admin/keuangan/item/create?periodeId=${selectedPeriode}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Item Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {treeData.map(item => renderTreeNode(item))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        confirmText="Ya, Hapus"
        description={`Apakah Anda yakin ingin menghapus item "${itemToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleteMutation.isPending}
        open={!!itemToDelete}
        title="Hapus Item Keuangan"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate(itemToDelete.id)}
        onOpenChange={() => setItemToDelete(null)}
      />
    </>
  );
}

ItemKeuanganPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};