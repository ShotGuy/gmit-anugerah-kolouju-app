// pages/admin/master-data/item-keuangan/create.jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmModal from "@/components/ui/ConfirmModal";
import NumberInput from "@/components/ui/inputs/NumberInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";

const itemKeuanganService = {
  create: async (data) => {
    const response = await axios.post("/api/keuangan/item", data);

    return response.data;
  },
  getByKategoriAndPeriode: async (kategoriId, periodeId) => {
    const response = await axios.get(
      `/api/keuangan/item?kategoriId=${kategoriId}&periodeId=${periodeId}`
    );

    return response.data;
  },
};

export default function CreateItemKeuanganPage() {
  const router = useRouter();
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning"
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

  // Query untuk existing items berdasarkan kategori dan periode
  const { data: existingItems, refetch: refetchItems } = useQuery({
    queryKey: ["existing-items", selectedKategori, selectedPeriode],
    queryFn: () =>
      itemKeuanganService.getByKategoriAndPeriode(
        selectedKategori,
        selectedPeriode
      ),
    enabled: !!(selectedKategori && selectedPeriode),
  });

  // Initialize dengan item level 1 jika belum ada
  useEffect(() => {
    if (selectedKategori && selectedPeriode && existingItems?.data?.items) {
      const existing = existingItems.data.items;

      if (existing.length === 0) {
        // Kategori kosong, buat item level 1 pertama
        setItems([
          {
            id: "temp_1",
            level: 1,
            kode: "A",
            nama: "",
            deskripsi: "",
            targetFrekuensi: "",
            satuanFrekuensi: "",
            nominalSatuan: "",
            totalTarget: "",
            parentId: null,
            children: [],
          },
        ]);
      } else {
        // Convert existing items ke format tree
        setItems(buildTreeFromExisting(existing));
      }
    }
  }, [selectedKategori, selectedPeriode, existingItems]);

  // Build tree dari existing items
  const buildTreeFromExisting = (existingItems) => {
    const itemMap = new Map();
    const rootItems = [];

    // Buat map
    existingItems.forEach((item) => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        id: item.id, // Keep real ID for existing items
        targetFrekuensi: item.targetFrekuensi || "",
        satuanFrekuensi: item.satuanFrekuensi || "",
        nominalSatuan: item.nominalSatuan || "",
        totalTarget: item.totalTarget || "",
      });
    });

    // Build tree
    existingItems.forEach((item) => {
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

  // Generate kode berdasarkan level dan urutan
  const generateKode = (parentKode, childIndex, level) => {
    if (level === 1) {
      // Level 1: A, B, C, dst
      return String.fromCharCode(65 + childIndex);
    } else {
      // Level 2+: A.1, A.1.1, A.1.1.1, dst
      return `${parentKode}.${childIndex + 1}`;
    }
  };

  // Update kode secara rekursif
  const updateKodes = (itemList, parentKode = "", startLevel = 1) => {
    return itemList.map((item, index) => {
      const newKode = generateKode(parentKode, index, item.level);
      const updatedItem = {
        ...item,
        kode: newKode,
        urutan: index + 1,
      };

      if (item.children && item.children.length > 0) {
        updatedItem.children = updateKodes(
          item.children,
          newKode,
          item.level + 1
        );
      }

      return updatedItem;
    });
  };

  // Add child item
  const addChild = (parentId, parentLevel) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const addChildToTree = (itemList) => {
      return itemList.map((item) => {
        if (item.id === parentId) {
          const newChild = {
            id: tempId,
            level: parentLevel + 1,
            kode: "", // Will be generated later
            nama: "",
            deskripsi: "",
            targetFrekuensi: "",
            satuanFrekuensi: "",
            nominalSatuan: "",
            totalTarget: "",
            parentId: parentId,
            children: [],
          };

          return {
            ...item,
            children: [...(item.children || []), newChild],
          };
        }

        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: addChildToTree(item.children),
          };
        }

        return item;
      });
    };

    const updatedItems = addChildToTree(items);

    setItems(updateKodes(updatedItems));
  };

  // Add sibling item
  const addSibling = (afterItemId, level) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const addSiblingToTree = (itemList, targetLevel = 1) => {
      if (targetLevel === level) {
        // Find index of afterItem
        const afterIndex = itemList.findIndex(
          (item) => item.id === afterItemId
        );

        if (afterIndex !== -1) {
          const newSibling = {
            id: tempId,
            level: level,
            kode: "", // Will be generated later
            nama: "",
            deskripsi: "",
            targetFrekuensi: "",
            satuanFrekuensi: "",
            nominalSatuan: "",
            totalTarget: "",
            parentId: itemList[afterIndex].parentId,
            children: [],
          };

          const newList = [...itemList];

          newList.splice(afterIndex + 1, 0, newSibling);

          return newList;
        }
      }

      return itemList.map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: addSiblingToTree(item.children, targetLevel),
          };
        }

        return item;
      });
    };

    let updatedItems;

    if (level === 1) {
      // Add sibling di root level
      const afterIndex = items.findIndex((item) => item.id === afterItemId);

      if (afterIndex !== -1) {
        const newSibling = {
          id: tempId,
          level: 1,
          kode: "",
          nama: "",
          deskripsi: "",
          targetFrekuensi: "",
          satuanFrekuensi: "",
          nominalSatuan: "",
          totalTarget: "",
          parentId: null,
          children: [],
        };

        updatedItems = [...items];
        updatedItems.splice(afterIndex + 1, 0, newSibling);
      }
    } else {
      updatedItems = addSiblingToTree(items, level);
    }

    setItems(updateKodes(updatedItems));
  };

  // Helper function to count total items including children
  const countTotalItems = (itemList) => {
    return itemList.reduce((total, item) => {
      return total + 1 + (item.children ? countTotalItems(item.children) : 0);
    }, 0);
  };

  // Helper function to check if item can be deleted
  const canDeleteItem = (itemId, itemLevel) => {
    // If it's a root level item (level 1)
    if (itemLevel === 1) {
      // Must have at least 1 root item remaining
      return items.length > 1;
    }
    // For sub-items (level > 1), can always be deleted
    return true;
  };

  // Helper function to find item info by ID
  const findItemInfo = (itemId, itemList = items, parentInfo = null) => {
    for (const item of itemList) {
      if (item.id === itemId) {
        return {
          item,
          parent: parentInfo,
          siblings: itemList,
          siblingCount: itemList.length
        };
      }
      if (item.children && item.children.length > 0) {
        const found = findItemInfo(itemId, item.children, item);
        if (found) return found;
      }
    }
    return null;
  };

  // Show confirmation modal for delete
  const showDeleteConfirmation = (itemId) => {
    const itemInfo = findItemInfo(itemId);
    if (!itemInfo) return;

    const { item } = itemInfo;

    // Check if item can be deleted
    if (!canDeleteItem(itemId, item.level)) {
      toast.error("Tidak dapat menghapus item ini. Minimal harus ada 1 item utama.");
      return;
    }

    const hasChildren = item.children && item.children.length > 0;
    let title, message, type;

    if (hasChildren) {
      const childCount = countTotalItems(item.children);
      title = "Hapus Item dengan Sub-Items";
      message = `Item "${item.nama || item.kode}" memiliki ${childCount} sub-item.\n\nMenghapus item ini akan menghapus semua sub-item juga.\n\nApakah Anda yakin ingin melanjutkan?`;
      type = "danger";
    } else {
      title = "Konfirmasi Hapus Item";
      message = `Apakah Anda yakin ingin menghapus item "${item.nama || item.kode}"?`;
      type = "warning";
    }

    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => handleDeleteConfirmed(itemId)
    });
  };

  // Handle confirmed delete
  const handleDeleteConfirmed = (itemId) => {
    const itemInfo = findItemInfo(itemId);
    if (!itemInfo) return;

    const { item } = itemInfo;
    const hasChildren = item.children && item.children.length > 0;

    const deleteFromTree = (itemList) => {
      return itemList
        .filter((item) => item.id !== itemId)
        .map((item) => ({
          ...item,
          children: item.children ? deleteFromTree(item.children) : [],
        }));
    };

    const updatedItems = deleteFromTree(items);
    setItems(updateKodes(updatedItems));

    // Close modal
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      type: "warning"
    });

    // Show success message
    toast.success(
      hasChildren
        ? `Item "${item.nama || item.kode}" dan sub-itemnya berhasil dihapus`
        : `Item "${item.nama || item.kode}" berhasil dihapus`
    );
  };

  // Legacy function name for compatibility
  const deleteItem = showDeleteConfirmation;

  // Helper: Recalculate targets from bottom up
  const calculateTreeTargets = (itemList) => {
    return itemList.map((item) => {
      // 1. Process children first (Recursion)
      let updatedChildren = [];
      if (item.children && item.children.length > 0) {
        updatedChildren = calculateTreeTargets(item.children);
      }

      // 2. Calculate own target
      let newItem = { ...item, children: updatedChildren };

      if (updatedChildren.length > 0) {
        // If has children, Total Target = Sum of Children's Total Target
        const sumChildren = updatedChildren.reduce((sum, child) => {
          return sum + (parseFloat(child.totalTarget) || 0);
        }, 0);

        newItem.totalTarget = sumChildren.toString();
        // Clear manual inputs for parent to avoid confusion
        newItem.targetFrekuensi = "";
        newItem.nominalSatuan = "";
      } else {
        // If leaf (no children), ensure totalTarget respects the manual formula if fields exist
        // (This part usually handled by the input change, but good to ensure consistency)
      }

      return newItem;
    });
  };

  // Update item
  const updateItem = (itemId, field, value) => {
    // 1. First, apply the single change
    const applyChange = (itemList) => {
      return itemList.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Auto calculate totalTarget jika ada targetFrekuensi dan nominalSatuan
          // ONLY if it's a leaf node (will be enforced by UI, but logic here too)
          if ((!item.children || item.children.length === 0) &&
            (field === "targetFrekuensi" || field === "nominalSatuan")) {
            const freq =
              field === "targetFrekuensi" ? value : item.targetFrekuensi;
            const nominal =
              field === "nominalSatuan" ? value : item.nominalSatuan;

            if (freq && nominal && !isNaN(freq) && !isNaN(nominal)) {
              updatedItem.totalTarget = (
                parseFloat(freq) * parseFloat(nominal)
              ).toString();
            }
          }

          // If editing totalTarget directly on leaf
          if (field === "totalTarget") {
            // Just let it be updated
          }

          return updatedItem;
        }

        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: applyChange(item.children),
          };
        }

        return item;
      });
    };

    const changedItems = applyChange(items);

    // 2. Then, recursively recalculate all parenet targets (Roll-up)
    const recalculatedItems = calculateTreeTargets(changedItems);

    setItems(recalculatedItems);
  };

  // Save all items
  const saveItems = async () => {
    if (!selectedKategori) {
      toast.error("Pilih kategori terlebih dahulu");

      return;
    }

    if (!selectedPeriode) {
      toast.error("Pilih periode terlebih dahulu");

      return;
    }

    // Validate required fields
    const validateItems = (itemList) => {
      for (const item of itemList) {
        if (!item.nama.trim()) {
          throw new Error(`Nama item untuk kode ${item.kode} harus diisi`);
        }

        if (item.children && item.children.length > 0) {
          validateItems(item.children);
        }
      }
    };

    try {
      validateItems(items);
    } catch (error) {
      toast.error(error.message);

      return;
    }

    setSaving(true);

    try {
      // Flatten items untuk save ke database
      const flattenItems = async (itemList, parentRealId = null) => {
        let result = [];

        for (const item of itemList) {
          const itemData = {
            kategoriId: selectedKategori,
            periodeId: selectedPeriode,
            parentId: parentRealId,
            kode: item.kode,
            nama: item.nama,
            deskripsi: item.deskripsi || null,
            level: item.level,
            urutan: item.urutan,
            targetFrekuensi: item.targetFrekuensi
              ? parseInt(item.targetFrekuensi)
              : null,
            satuanFrekuensi: item.satuanFrekuensi || null,
            nominalSatuan: item.nominalSatuan
              ? parseFloat(item.nominalSatuan)
              : null,
            totalTarget: item.totalTarget ? parseFloat(item.totalTarget) : null,
            isActive: true,
          };

          // Save parent first
          let savedItem;

          if (item.id.startsWith("temp_")) {
            // New item
            savedItem = await itemKeuanganService.create(itemData);
          } else {
            // Existing item - update
            savedItem = await axios.patch(
              `/api/keuangan/item/${item.id}`,
              itemData
            );
            savedItem = savedItem.data;
          }

          result.push(savedItem);

          // Save children dengan parent ID yang benar
          if (item.children && item.children.length > 0) {
            const childResults = await flattenItems(
              item.children,
              savedItem.data?.id || savedItem.id
            );

            result.push(...childResults);
          }
        }

        return result;
      };

      await flattenItems(items);

      toast.success("Item keuangan berhasil disimpan");
      router.push("/admin/data-master/keuangan/item");
    } catch (error) {
      console.error("Error saving items:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  // Render item form
  const renderItemForm = (item, level = 1, index = 0) => {
    const indentClass = level > 1 ? `ml-${(level - 1) * 8}` : "";

    return (
      <div key={item.id} className={`space-y-4 ${indentClass}`}>
        {/* Item Form */}
        <Card className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {item.kode} (Level {item.level})
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Urutan: {item.urutan}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => addChild(item.id, item.level)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Sub Item
                </Button>

                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => addSibling(item.id, item.level)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Sibling
                </Button>

                {canDeleteItem(item.id, item.level) && (
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    title={item.level === 1 ? "Hapus item utama" : "Hapus sub-item"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                {/* Show info if item cannot be deleted */}
                {!canDeleteItem(item.id, item.level) && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                    Min. 1 item
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Item */}
              <div className="md:col-span-2">
                <TextInput
                  required
                  label="Nama Item"
                  placeholder="Contoh: Persembahan Perpuluhan"
                  value={item.nama}
                  onChange={(value) => updateItem(item.id, "nama", value)}
                />
              </div>

              {/* Deskripsi */}
              <div className="md:col-span-2">
                <TextAreaInput
                  label="Deskripsi"
                  placeholder="Deskripsi detail item"
                  rows={2}
                  value={item.deskripsi}
                  onChange={(value) => updateItem(item.id, "deskripsi", value)}
                />
              </div>

              {/* Target Frekuensi */}
              <div>
                <NumberInput
                  label="Target Frekuensi"
                  placeholder="12"
                  value={item.targetFrekuensi}
                  onChange={(value) =>
                    updateItem(item.id, "targetFrekuensi", value)
                  }
                  disabled={item.children && item.children.length > 0}
                />
              </div>

              {/* Satuan Frekuensi */}
              <div>
                <SelectInput
                  label="Satuan Frekuensi"
                  options={[
                    { value: "Kali", label: "Kali" },
                    { value: "Bulan", label: "Per Bulan" },
                    { value: "Tahun", label: "Per Tahun" },
                    { value: "Minggu", label: "Per Minggu" },
                    { value: "Hari", label: "Per Hari" },
                  ]}
                  placeholder="Pilih satuan"
                  value={item.satuanFrekuensi}
                  onChange={(value) =>
                    updateItem(item.id, "satuanFrekuensi", value)
                  }
                  disabled={item.children && item.children.length > 0}
                />
              </div>

              {/* Nominal Satuan */}
              <div>
                <NumberInput
                  label="Nominal Per Satuan"
                  placeholder="1000000"
                  showCurrencyFormat={true}
                  value={item.nominalSatuan}
                  onChange={(value) =>
                    updateItem(item.id, "nominalSatuan", value)
                  }
                  disabled={item.children && item.children.length > 0}
                />
              </div>

              {/* Total Target */}
              <div>
                <NumberInput
                  label="Total Target Anggaran"
                  placeholder="12000000"
                  showCurrencyFormat={true}
                  value={item.totalTarget}
                  onChange={(value) =>
                    updateItem(item.id, "totalTarget", value)
                  }
                  disabled={item.children && item.children.length > 0}
                />

                {/* Auto Calculation Info */}
                {item.children && item.children.length > 0 ? (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                    ⓘ Total otomatis dari penjumlahan sub-item
                  </div>
                ) : (
                  item.targetFrekuensi && item.nominalSatuan && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Auto: {item.targetFrekuensi} × {item.nominalSatuan} ={" "}
                      {(
                        parseFloat(item.targetFrekuensi || 0) *
                        parseFloat(item.nominalSatuan || 0)
                      ).toLocaleString("id-ID")}
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render Children */}
        {item.children && item.children.length > 0 && (
          <div className="space-y-4">
            {item.children.map((child, childIndex) =>
              renderItemForm(child, level + 1, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/data-master/keuangan/item")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Buat Rancangan Item Keuangan
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Buat struktur hierarkis item keuangan
            </p>
          </div>
        </div>

        <Button
          className="min-w-32"
          disabled={saving || !selectedKategori || !selectedPeriode}
          onClick={saveItems}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      {/* Pilih Kategori dan Periode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pilih Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <SelectInput
              options={
                kategoriOptions?.data?.map((cat) => ({
                  value: cat.id,
                  label: `${cat.kode} - ${cat.nama}`,
                })) || []
              }
              placeholder="Pilih kategori keuangan"
              value={selectedKategori}
              onChange={(value) => setSelectedKategori(value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pilih Periode Anggaran</CardTitle>
          </CardHeader>
          <CardContent>
            <SelectInput
              options={
                periodeOptions?.data?.map((periode) => ({
                  value: periode.value,
                  label: periode.label,
                })) || []
              }
              placeholder="Pilih periode anggaran"
              value={selectedPeriode}
              onChange={(value) => setSelectedPeriode(value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Form Items */}
      {selectedKategori && selectedPeriode && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Struktur Item Keuangan</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kode akan di-generate otomatis berdasarkan hierarki dan urutan
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {items.map((item, index) => renderItemForm(item, 1, index))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmVariant="destructive"
      />
    </div>
  );
}
