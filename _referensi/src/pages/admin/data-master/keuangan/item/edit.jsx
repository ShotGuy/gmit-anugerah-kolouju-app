// pages/admin/data-master/keuangan/item/edit.jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DeleteOptionsModal from "@/components/ui/DeleteOptionsModal";

const itemKeuanganService = {
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
  getByKategoriAndPeriode: async (kategoriId, periodeId) => {
    const response = await axios.get(
      `/api/keuangan/item?kategoriId=${kategoriId}&periodeId=${periodeId}`
    );

    return response.data;
  },
};

export default function EditItemKeuanganPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get periode and kategori from URL params
  const [selectedKategori, setSelectedKategori] = useState(
    searchParams?.get("kategoriId") || ""
  );
  const [selectedPeriode, setSelectedPeriode] = useState(
    searchParams?.get("periodeId") || ""
  );
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  // Track items marked for deletion
  const [markedForDeletion, setMarkedForDeletion] = useState(new Set());

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
  });

  const [deleteOptionsModal, setDeleteOptionsModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: "",
    itemType: "existing",
    hasChildren: false,
    childrenCount: 0,
  });

  const [deletingNow, setDeletingNow] = useState(false);

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
  const { data: existingItems } = useQuery({
    queryKey: ["existing-items", selectedKategori, selectedPeriode],
    queryFn: () =>
      itemKeuanganService.getByKategoriAndPeriode(
        selectedKategori,
        selectedPeriode
      ),
    enabled: !!(selectedKategori && selectedPeriode),
  });

  // Initialize items from existing data
  useEffect(() => {
    if (selectedKategori && selectedPeriode && existingItems?.data?.items) {
      const existing = existingItems.data.items;

      if (existing.length > 0) {
        // Convert existing items ke format tree untuk editing
        setItems(buildTreeFromExisting(existing));
      } else {
        // Jika tidak ada items, buat item level 1 pertama
        setItems([
          {
            id: "temp_1",
            level: 1,
            kode: getKategoriKode(),
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
      }
    }
  }, [selectedKategori, selectedPeriode, existingItems, kategoriOptions]);

  // Get kategori kode
  const getKategoriKode = () => {
    const selectedKat = kategoriOptions?.data?.find(
      (k) => k.id === selectedKategori
    );

    return selectedKat?.kode || "A";
  };

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
        // Handle target fields - ensure they're properly mapped
        targetFrekuensi: item.targetFrekuensi
          ? item.targetFrekuensi.toString()
          : "",
        satuanFrekuensi: item.satuanFrekuensi || "",
        nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : "",
        totalTarget: item.totalTarget ? item.totalTarget.toString() : "",
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
          siblingCount: itemList.length,
        };
      }
      if (item.children && item.children.length > 0) {
        const found = findItemInfo(itemId, item.children, item);

        if (found) return found;
      }
    }

    return null;
  };

  // Show delete confirmation or options modal
  const showDeleteConfirmation = (itemId) => {
    const itemInfo = findItemInfo(itemId);

    if (!itemInfo) return;

    const { item } = itemInfo;

    // Check if item can be deleted
    if (!canDeleteItem(itemId, item.level)) {
      toast.error(
        "Tidak dapat menghapus item ini. Minimal harus ada 1 item utama."
      );

      return;
    }

    const isExistingItem = !item.id.startsWith("temp_");
    const hasChildren = item.children && item.children.length > 0;
    const childrenCount = hasChildren ? countTotalItems(item.children) : 0;

    if (isExistingItem) {
      // Show delete options modal for existing items
      setDeleteOptionsModal({
        isOpen: true,
        itemId,
        itemName: item.nama || item.kode,
        itemType: "existing",
        hasChildren,
        childrenCount,
      });
    } else {
      // Show simple confirmation for new items
      let title, message, type;

      if (hasChildren) {
        title = "Hapus Item dengan Sub-Items";
        message = `Item "${item.nama || item.kode}" memiliki ${childrenCount} sub-item.\n\nMenghapus item ini akan menghapus semua sub-item juga.\n\nApakah Anda yakin ingin melanjutkan?`;
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
        onConfirm: () => handleDeleteFromForm(itemId),
      });
    }
  };

  // Handle delete from form only (for new items)
  const handleDeleteFromForm = (itemId) => {
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

    // Close modals
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setDeleteOptionsModal((prev) => ({ ...prev, isOpen: false }));

    // Show success message
    toast.success(
      hasChildren
        ? `Item "${item.nama || item.kode}" dan sub-itemnya berhasil dihapus dari form`
        : `Item "${item.nama || item.kode}" berhasil dihapus dari form`
    );
  };

  // Mark item for deletion (for existing items)
  const markForDeletion = (itemId) => {
    const itemInfo = findItemInfo(itemId);

    if (!itemInfo) return;

    const { item } = itemInfo;
    const hasChildren = item.children && item.children.length > 0;

    // Collect all IDs to mark (item + all children)
    const collectAllIds = (item) => {
      let ids = [item.id];

      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          ids.push(...collectAllIds(child));
        });
      }

      return ids;
    };

    const allIds = collectAllIds(item);

    setMarkedForDeletion((prev) => new Set([...prev, ...allIds]));

    // Close modals
    setDeleteOptionsModal((prev) => ({ ...prev, isOpen: false }));

    // Show success message
    toast.success(
      hasChildren
        ? `Item "${item.nama || item.kode}" dan sub-itemnya ditandai untuk dihapus saat simpan`
        : `Item "${item.nama || item.kode}" ditandai untuk dihapus saat simpan`
    );
  };

  // Cancel deletion marking
  const cancelDeletion = (itemId) => {
    const itemInfo = findItemInfo(itemId);

    if (!itemInfo) return;

    const { item } = itemInfo;
    const hasChildren = item.children && item.children.length > 0;

    // Collect all IDs to unmark (item + all children)
    const collectAllIds = (item) => {
      let ids = [item.id];

      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          ids.push(...collectAllIds(child));
        });
      }

      return ids;
    };

    const allIds = collectAllIds(item);

    setMarkedForDeletion((prev) => {
      const newSet = new Set(prev);

      allIds.forEach((id) => newSet.delete(id));

      return newSet;
    });

    toast.success(
      hasChildren
        ? `Penghapusan item "${item.nama || item.kode}" dan sub-itemnya dibatalkan`
        : `Penghapusan item "${item.nama || item.kode}" dibatalkan`
    );
  };

  // Legacy function name for compatibility
  const deleteItem = showDeleteConfirmation;

  // Handle immediate delete for existing items
  const handleImmediateDelete = async (itemId) => {
    setDeletingNow(true);
    try {
      await itemKeuanganService.delete(itemId);

      // Remove from form as well
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
      setDeleteOptionsModal((prev) => ({ ...prev, isOpen: false }));

      toast.success("Item berhasil dihapus dari database");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Gagal menghapus item dari database");
    } finally {
      setDeletingNow(false);
    }
  };

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
          // ONLY if it's a leaf node 
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
      // Get existing items to know which ones to delete
      const existingItemIds =
        existingItems?.data?.items?.map((item) => item.id) || [];

      // Collect all current item IDs (excluding temp items)
      const getCurrentItemIds = (itemList) => {
        let ids = [];

        for (const item of itemList) {
          if (!item.id.startsWith("temp_")) {
            ids.push(item.id);
          }
          if (item.children && item.children.length > 0) {
            ids.push(...getCurrentItemIds(item.children));
          }
        }

        return ids;
      };

      const currentItemIds = getCurrentItemIds(items);

      // Find items to delete (removed from form + marked for deletion)
      const itemsToDelete = [
        ...existingItemIds.filter((id) => !currentItemIds.includes(id)), // Items removed from form
        ...Array.from(markedForDeletion).filter(
          (id) => !id.startsWith("temp_")
        ), // Items marked for deletion
      ];

      // Remove duplicates
      // 1. Process Deletions First (Bottom-Up approach ideally, but for now we trust backend constraints or simple iter)
      // Convert Set to Array
      const uniqueItemsToDelete = [...new Set(itemsToDelete)];

      for (const itemId of uniqueItemsToDelete) {
        // Only delete real items
        if (!itemId.startsWith("temp_")) {
          try {
            await itemKeuanganService.delete(itemId);
          } catch (error) {
            // Ignore 404
            if (error.response?.status !== 404) {
              console.warn(`Failed to delete item ${itemId}`, error);
            }
          }
        }
      }



      // 2. Flatten items untuk save/update ke database
      const flattenItems = async (itemList, parentRealId = null) => {
        let result = [];

        for (const item of itemList) {
          // SKIP valid items if they were marked for deletion 
          // (Because we just deleted them above, or intended to)
          if (markedForDeletion.has(item.id)) continue;

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

          try {
            if (item.id.startsWith("temp_")) {
              // New item
              savedItem = await itemKeuanganService.create(itemData);
            } else {
              // Existing item - update
              savedItem = await itemKeuanganService.update(item.id, itemData);
            }

            result.push(savedItem);

            // Save children dengan parent ID yang benar
            // Only recurse if we successfully saved the parent
            if (savedItem && item.children && item.children.length > 0) {
              const childResults = await flattenItems(
                item.children,
                savedItem.data?.id || savedItem.id
              );

              result.push(...childResults);
            }
          } catch (error) {
            // Check for 404 (Item not found during Update)
            if (!item.id.startsWith("temp_") && error.response?.status === 404) {
              console.warn(`Item ${item.id} not found in DB (404). Skipping update.`);
              continue; // Skip this item and its children
            }
            throw error; // Rethrow other errors
          }
        }

        return result;
      };

      await flattenItems(items);

      toast.success("Item keuangan berhasil diperbarui");
      router.push("/admin/data-master/keuangan/item");
    } catch (error) {
      console.error("Error saving items:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  // Render item form (sama dengan create page)
  const renderItemForm = (item, level = 1, index = 0) => {
    const indentClass = level > 1 ? `ml-${(level - 1) * 8}` : "";

    const isMarkedForDeletion = markedForDeletion.has(item.id);

    return (
      <div key={item.id} className={`space-y-4 ${indentClass}`}>
        {/* Item Form */}
        <Card
          className={`relative transition-all duration-300 ${isMarkedForDeletion
            ? "opacity-60 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
            : ""
            }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {item.kode} (Level {item.level})
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Urutan: {item.urutan}
                </span>
                {/* Indicator for existing vs new items */}
                {markedForDeletion.has(item.id) ? (
                  <Badge
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse"
                    variant="destructive"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Akan Dihapus
                  </Badge>
                ) : !item.id.startsWith("temp_") ? (
                  <Badge
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    variant="default"
                  >
                    Tersimpan
                  </Badge>
                ) : (
                  <Badge
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    variant="secondary"
                  >
                    Baru
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Show Cancel Delete button if item is marked for deletion */}
                {markedForDeletion.has(item.id) ? (
                  <Button
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 border-green-300 dark:border-green-600"
                    size="sm"
                    title="Batalkan penghapusan item ini"
                    type="button"
                    variant="outline"
                    onClick={() => cancelDeletion(item.id)}
                  >
                    <Undo2 className="w-4 h-4 mr-1" />
                    Batal Hapus
                  </Button>
                ) : (
                  <>
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        size="sm"
                        title={`${item.level === 1 ? "Hapus item utama" : "Hapus sub-item"} ${!item.id.startsWith("temp_") ? "(dari database)" : ""}`}
                        type="button"
                        variant="outline"
                        onClick={() => deleteItem(item.id)}
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
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Item */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Nama Item *
                </label>
                <input
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isMarkedForDeletion
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={isMarkedForDeletion}
                  placeholder="Contoh: Persembahan Perpuluhan"
                  type="text"
                  value={item.nama}
                  onChange={(e) => updateItem(item.id, "nama", e.target.value)}
                />
              </div>

              {/* Deskripsi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Deskripsi
                </label>
                <textarea
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isMarkedForDeletion
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={isMarkedForDeletion}
                  placeholder="Deskripsi detail item"
                  rows="2"
                  value={item.deskripsi}
                  onChange={(e) =>
                    updateItem(item.id, "deskripsi", e.target.value)
                  }
                />
              </div>

              {/* Target Frekuensi */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Frekuensi
                </label>
                <input
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isMarkedForDeletion || (item.children && item.children.length > 0)
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={isMarkedForDeletion || (item.children && item.children.length > 0)}
                  placeholder="12"
                  type="number"
                  value={item.targetFrekuensi}
                  onChange={(e) =>
                    updateItem(item.id, "targetFrekuensi", e.target.value)
                  }
                />
              </div>

              {/* Satuan Frekuensi */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Satuan Frekuensi
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isMarkedForDeletion || (item.children && item.children.length > 0)
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={isMarkedForDeletion || (item.children && item.children.length > 0)}
                  value={item.satuanFrekuensi}
                  onChange={(e) =>
                    updateItem(item.id, "satuanFrekuensi", e.target.value)
                  }
                >
                  <option value="">Pilih satuan</option>
                  <option value="Kali">Kali</option>
                  <option value="Bulan">Per Bulan</option>
                  <option value="Tahun">Per Tahun</option>
                  <option value="Minggu">Per Minggu</option>
                  <option value="Hari">Per Hari</option>
                </select>
              </div>

              {/* Nominal Satuan */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nominal Per Satuan
                </label>
                <input
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isMarkedForDeletion || (item.children && item.children.length > 0)
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={isMarkedForDeletion || (item.children && item.children.length > 0)}
                  placeholder="1000000"
                  type="number"
                  value={item.nominalSatuan}
                  onChange={(e) =>
                    updateItem(item.id, "nominalSatuan", e.target.value)
                  }
                />
              </div>

              {/* Total Target */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Target Anggaran
                </label>
                <input
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isMarkedForDeletion || (item.children && item.children.length > 0)
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={isMarkedForDeletion || (item.children && item.children.length > 0)}
                  placeholder="12000000"
                  type="number"
                  value={item.totalTarget}
                  onChange={(e) =>
                    updateItem(item.id, "totalTarget", e.target.value)
                  }
                />

                {/* Auto Calculation Info */}
                {item.children && item.children.length > 0 ? (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                    ⓘ Total otomatis dari penjumlahan sub-item
                  </div>
                ) : (
                  item.targetFrekuensi && item.nominalSatuan && (
                    <div className="text-xs text-gray-500 mt-1">
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

  // Get current periode info
  const currentPeriodeInfo = periodeOptions?.data?.find(
    (p) => p.value === selectedPeriode
  );
  const currentKategoriInfo = kategoriOptions?.data?.find(
    (k) => k.id === selectedKategori
  );

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
            <h1 className="text-2xl font-bold">Edit Item Keuangan</h1>
            <p className="text-gray-600">
              Edit struktur hierarkis item keuangan untuk{" "}
              {currentKategoriInfo?.nama} - {currentPeriodeInfo?.label}
            </p>
          </div>
        </div>

        <Button
          className="min-w-32"
          disabled={saving || !selectedKategori || !selectedPeriode}
          onClick={saveItems}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Menyimpan..." : "Update"}
        </Button>
      </div>

      {/* Info Kategori dan Periode (Read-only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">
                {currentKategoriInfo?.kode} - {currentKategoriInfo?.nama}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Periode Anggaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{currentPeriodeInfo?.label}</span>
              {currentPeriodeInfo?.tanggalMulai &&
                currentPeriodeInfo?.tanggalAkhir && (
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(
                      currentPeriodeInfo.tanggalMulai
                    ).toLocaleDateString("id-ID")}{" "}
                    -{" "}
                    {new Date(
                      currentPeriodeInfo.tanggalAkhir
                    ).toLocaleDateString("id-ID")}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Items */}
      {selectedKategori && selectedPeriode && items.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Struktur Item Keuangan</CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kode akan di-generate otomatis berdasarkan hierarki dan urutan
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Item tersimpan di database
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Item baru (belum tersimpan)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trash2 className="w-3 h-3 text-red-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Hapus langsung atau saat simpan
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Undo2 className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Batalkan penghapusan
                    </span>
                  </div>
                </div>
                {markedForDeletion.size > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        {markedForDeletion.size} item ditandai untuk dihapus
                        saat simpan
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {items.map((item, index) => renderItemForm(item, 1, index))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {selectedKategori && selectedPeriode && items.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-gray-500">Memuat data...</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        cancelText="Batal"
        confirmText="Ya, Hapus"
        confirmVariant="destructive"
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        title={confirmModal.title}
        type={confirmModal.type}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />

      {/* Delete Options Modal */}
      <DeleteOptionsModal
        childrenCount={deleteOptionsModal.childrenCount}
        hasChildren={deleteOptionsModal.hasChildren}
        isOpen={deleteOptionsModal.isOpen}
        itemName={deleteOptionsModal.itemName}
        itemType={deleteOptionsModal.itemType}
        loading={deletingNow}
        onClose={() =>
          setDeleteOptionsModal((prev) => ({ ...prev, isOpen: false }))
        }
        onDeleteLater={() => markForDeletion(deleteOptionsModal.itemId)}
        onDeleteNow={() => handleImmediateDelete(deleteOptionsModal.itemId)}
      />
    </div>
  );
}
