// pages/admin/master-data/item-keuangan.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Eye,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ViewModal from "@/components/ui/ViewModal";
import PageTitle from "@/components/ui/PageTitle";
import { useUser } from "@/hooks/useUser";

// Service untuk API calls
const itemKeuanganService = {
  get: async (params) => {
    const response = await axios.get("/api/keuangan/item", { params });
    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/api/keuangan/item", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.patch(`/api/keuangan/item/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/api/keuangan/item/${id}`);
    return response.data;
  },
};

export default function ItemKeuanganPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State untuk modal dan dialog
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  // State untuk filter dan search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPeriode, setSelectedPeriode] = useState("all");

  const { user: authData } = useUser();

  // Format rupiah helper
  const formatRupiah = (amount) => {
    if (!amount || amount === null || amount === "0" || amount === 0)
      return "Rp 0";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) return "Rp 0";
    return `Rp ${numAmount.toLocaleString("id-ID")}`;
  };

  // Query untuk fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "item-keuangan",
      { search: searchTerm, category: selectedCategory, level: selectedLevel, periode: selectedPeriode },
    ],
    queryFn: () =>
      itemKeuanganService.get({
        search: searchTerm,
        kategoriId: selectedCategory !== "all" ? selectedCategory : undefined,
        level: selectedLevel !== "all" ? selectedLevel : undefined,
        periodeId: selectedPeriode !== "all" ? selectedPeriode : undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  // Query untuk kategori options
  const { data: kategoriOptions } = useQuery({
    queryKey: ["kategori-keuangan-options"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/kategori/options");
      return response.data;
    },
  });

  // Query untuk periode options
  const { data: periodeOptions } = useQuery({
    queryKey: ["periode-anggaran-options"],
    queryFn: async () => {
      const response = await axios.get("/api/keuangan/periode/options");
      return response.data;
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => itemKeuanganService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-keuangan"] });
      toast.success("Item keuangan berhasil dihapus");
      setDeleteItem(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus data");
    },
  });


  // Helper untuk group items by periode
  const groupItemsByPeriode = (items) => {
    const grouped = new Map();
    
    items.forEach((item) => {
      const periodeId = item.periodeId;
      if (!grouped.has(periodeId)) {
        grouped.set(periodeId, []);
      }
      grouped.get(periodeId).push(item);
    });
    
    return grouped;
  };

  // Helper untuk get periode info
  const getPeriodeInfo = (periodeId) => {
    return periodeOptions?.data?.find(p => p.value === periodeId);
  };

  // Helper untuk render hierarki tree
  const buildTree = (items) => {
    const itemMap = new Map();
    const rootItems = [];

    // Buat map untuk akses cepat
    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build tree
    items.forEach((item) => {
      const itemWithChildren = itemMap.get(item.id);

      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(itemWithChildren);
        }
      } else {
        rootItems.push(itemWithChildren);
      }
    });

    return rootItems.sort((a, b) => a.urutan - b.urutan);
  };

  // Render item dalam bentuk tree dengan indentasi
  const renderTreeItem = (item, level = 0) => {
    const indentClass = level > 0 ? `pl-${level * 6}` : "";
    const items = data?.data?.items || [];

    return (
      <div key={item.id}>
        {/* Item utama */}
        <div
          className={`flex items-center justify-between p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${indentClass}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Indikator level dengan garis */}
              {level > 0 && (
                <div className="flex items-center">
                  {Array.from({ length: level }).map((_, i) => (
                    <div key={i} className="w-4 h-px bg-gray-300 mr-2" />
                  ))}
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {item.kode}
                  </span>
                  <span className="font-medium">{item.nama}</span>
                  <Badge variant={item.isActive ? "success" : "secondary"}>
                    Level {item.level}
                  </Badge>
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Kategori: {item.kategori?.nama || "-"} | Parent:{" "}
                  {item.parent?.nama || "Root"} | Sub Item:{" "}
                  {item._count?.children || 0}
                  {selectedPeriode === "all" && (
                    <span> | Periode: {getPeriodeInfo(item.periodeId)?.label || item.periodeId}</span>
                  )}
                </div>

                {item.totalTarget && (
                  <div className="text-sm text-green-600 mt-1">
                    Target: {formatRupiah(item.totalTarget)}
                    {item.targetFrekuensi && item.satuanFrekuensi && (
                      <span className="text-gray-500 ml-2">
                        ({item.targetFrekuensi} {item.satuanFrekuensi} ×{" "}
                        {formatRupiah(item.nominalSatuan)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewItem(item)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {authData?.isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteItem(item)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Render children */}
        {item.children && item.children.length > 0 && (
          <div>
            {item.children
              .sort((a, b) => a.urutan - b.urutan)
              .map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };


  // View fields untuk modal detail
  const viewFields = [
    { key: "kode", label: "Kode Item" },
    { key: "nama", label: "Nama Item" },
    { key: "deskripsi", label: "Deskripsi" },
    {
      key: "kategori",
      label: "Kategori",
      getValue: (item) =>
        item?.kategori ? `${item.kategori.kode} - ${item.kategori.nama}` : "-",
    },
    {
      key: "parent",
      label: "Parent Item",
      getValue: (item) =>
        item?.parent
          ? `${item.parent.kode} - ${item.parent.nama}`
          : "Root Item",
    },
    { key: "level", label: "Level Hierarki" },
    { key: "urutan", label: "Urutan" },
    { key: "targetFrekuensi", label: "Target Frekuensi" },
    { key: "satuanFrekuensi", label: "Satuan Frekuensi" },
    {
      key: "nominalSatuan",
      label: "Nominal Per Satuan",
      getValue: (item) =>
        item?.nominalSatuan ? formatRupiah(item.nominalSatuan) : "-",
    },
    {
      key: "totalTarget",
      label: "Total Target Anggaran",
      getValue: (item) =>
        item?.totalTarget ? formatRupiah(item.totalTarget) : "-",
    },
    {
      key: "_count",
      label: "Jumlah Sub Item",
      getValue: (item) => `${item?._count?.children || 0} item`,
    },
    {
      key: "isActive",
      label: "Status",
      getValue: (item) => (item?.isActive ? "Aktif" : "Tidak Aktif"),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading data: {error.message}
        </div>
      </div>
    );
  }

  const items = data?.data?.items || [];
  const groupedByPeriode = groupItemsByPeriode(items);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <PageTitle title="Kelola Rancangan Item Keuangan" />
        <div>
          <h1 className="text-2xl font-bold">Kelola Rancangan Item Keuangan</h1>
          <p className="text-gray-600">
            Kelola item keuangan dengan struktur hierarkis untuk sistem anggaran
          </p>
        </div>
        {authData?.isAdmin && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {}}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() =>
                router.push("/admin/data-master/keuangan/item/create")
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Item
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari nama item..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {kategoriOptions?.data?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.kode} - {cat.nama}
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">Semua Level</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>

            {/* Periode Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
            >
              <option value="all">Semua Periode</option>
              {periodeOptions?.data?.map((periode) => (
                <option key={periode.value} value={periode.value}>
                  {periode.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data by Periode */}
      {isLoading ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">Loading...</div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Tidak ada data item keuangan
            </div>
          </CardContent>
        </Card>
      ) : selectedPeriode !== "all" ? (
        // Show single periode
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Item Keuangan - {getPeriodeInfo(selectedPeriode)?.label} ({items.length})
              </CardTitle>
              {authData?.isAdmin && items.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const kategoriId = items[0]?.kategoriId;
                    router.push(`/admin/data-master/keuangan/item/edit?periodeId=${selectedPeriode}&kategoriId=${kategoriId}`);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Periode
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              {buildTree(items).map((item) => renderTreeItem(item))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Show all periode grouped
        <div className="space-y-6">
          {Array.from(groupedByPeriode.entries()).map(([periodeId, periodeItems]) => {
            const periodeInfo = getPeriodeInfo(periodeId);
            const tree = buildTree(periodeItems);
            
            return (
              <Card key={periodeId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {periodeInfo?.label || `Periode ${periodeId}`} ({periodeItems.length} items)
                      </CardTitle>
                      {periodeInfo?.tanggalMulai && periodeInfo?.tanggalAkhir && (
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(periodeInfo.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(periodeInfo.tanggalAkhir).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {authData?.isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const kategoriId = periodeItems[0]?.kategoriId;
                            router.push(`/admin/data-master/keuangan/item/edit?periodeId=${periodeId}&kategoriId=${kategoriId}`);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Periode
                        </Button>
                      )}
                      <Badge variant="outline">
                        {periodeInfo?.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    {tree.map((item) => renderTreeItem(item))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ConfirmDialog
        isLoading={deleteMutation.isPending}
        isOpen={!!deleteItem}
        message={`Apakah Anda yakin ingin menghapus "${deleteItem?.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        title="Hapus Item Keuangan"
        variant="danger"
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
      />

      <ViewModal
        data={
          viewItem
            ? viewFields.map((field) => ({
                label: field.label,
                value: field.getValue
                  ? field.getValue(viewItem)
                  : viewItem?.[field.key],
              }))
            : []
        }
        isOpen={!!viewItem}
        title="Detail Item Keuangan"
        onClose={() => setViewItem(null)}
      />

    </div>
  );
}
