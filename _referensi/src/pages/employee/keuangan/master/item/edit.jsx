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
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DeleteOptionsModal from "@/components/ui/DeleteOptionsModal";
import NumberInput from "@/components/ui/inputs/NumberInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";

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

    const [selectedKategori, setSelectedKategori] = useState(
        searchParams?.get("kategoriId") || ""
    );
    const [selectedPeriode, setSelectedPeriode] = useState(
        searchParams?.get("periodeId") || ""
    );
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);

    const [markedForDeletion, setMarkedForDeletion] = useState(new Set());

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

    // Queries
    const { data: kategoriOptions } = useQuery({
        queryKey: ["kategori-keuangan-options"],
        queryFn: async () => {
            const response = await axios.get("/api/keuangan/kategori/options");
            return response.data;
        },
    });

    const { data: periodeOptions } = useQuery({
        queryKey: ["periode-anggaran-options"],
        queryFn: async () => {
            const response = await axios.get("/api/keuangan/periode/options");
            return response.data;
        },
    });

    const { data: existingItems } = useQuery({
        queryKey: ["existing-items", selectedKategori, selectedPeriode],
        queryFn: () =>
            itemKeuanganService.getByKategoriAndPeriode(
                selectedKategori,
                selectedPeriode
            ),
        enabled: !!(selectedKategori && selectedPeriode),
    });

    useEffect(() => {
        if (selectedKategori && selectedPeriode && existingItems?.data?.items) {
            const existing = existingItems.data.items;

            if (existing.length > 0) {
                setItems(buildTreeFromExisting(existing));
            } else {
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

    const getKategoriKode = () => {
        const selectedKat = kategoriOptions?.data?.find(
            (k) => k.id === selectedKategori
        );
        return selectedKat?.kode || "A";
    };

    const buildTreeFromExisting = (existingItems) => {
        const itemMap = new Map();
        const rootItems = [];

        existingItems.forEach((item) => {
            itemMap.set(item.id, {
                ...item,
                children: [],
                id: item.id,
                targetFrekuensi: item.targetFrekuensi
                    ? item.targetFrekuensi.toString()
                    : "",
                satuanFrekuensi: item.satuanFrekuensi || "",
                nominalSatuan: item.nominalSatuan ? item.nominalSatuan.toString() : "",
                totalTarget: item.totalTarget ? item.totalTarget.toString() : "",
            });
        });

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

    const generateKode = (parentKode, childIndex, level) => {
        if (level === 1) {
            return String.fromCharCode(65 + childIndex);
        } else {
            return `${parentKode}.${childIndex + 1}`;
        }
    };

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

    const addChild = (parentId, parentLevel) => {
        const tempId = `temp_${Date.now()}_${Math.random()}`;

        const addChildToTree = (itemList) => {
            return itemList.map((item) => {
                if (item.id === parentId) {
                    const newChild = {
                        id: tempId,
                        level: parentLevel + 1,
                        kode: "",
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

    const addSibling = (afterItemId, level) => {
        const tempId = `temp_${Date.now()}_${Math.random()}`;

        const addSiblingToTree = (itemList, targetLevel = 1) => {
            if (targetLevel === level) {
                const afterIndex = itemList.findIndex(
                    (item) => item.id === afterItemId
                );
                if (afterIndex !== -1) {
                    const newSibling = {
                        id: tempId,
                        level: level,
                        kode: "",
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

    const countTotalItems = (itemList) => {
        return itemList.reduce((total, item) => {
            return total + 1 + (item.children ? countTotalItems(item.children) : 0);
        }, 0);
    };

    const canDeleteItem = (itemId, itemLevel) => {
        if (itemLevel === 1) {
            return items.length > 1;
        }
        return true;
    };

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

    const showDeleteConfirmation = (itemId) => {
        const itemInfo = findItemInfo(itemId);
        if (!itemInfo) return;

        const { item } = itemInfo;
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
            setDeleteOptionsModal({
                isOpen: true,
                itemId,
                itemName: item.nama || item.kode,
                itemType: "existing",
                hasChildren,
                childrenCount,
            });
        } else {
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

        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setDeleteOptionsModal((prev) => ({ ...prev, isOpen: false }));

        toast.success(
            hasChildren
                ? `Item "${item.nama || item.kode}" dan sub-itemnya berhasil dihapus dari form`
                : `Item "${item.nama || item.kode}" berhasil dihapus dari form`
        );
    };

    const markForDeletion = (itemId) => {
        const itemInfo = findItemInfo(itemId);
        if (!itemInfo) return;

        const { item } = itemInfo;
        const hasChildren = item.children && item.children.length > 0;

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

        setDeleteOptionsModal((prev) => ({ ...prev, isOpen: false }));

        toast.success(
            hasChildren
                ? `Item "${item.nama || item.kode}" dan sub-itemnya ditandai untuk dihapus saat simpan`
                : `Item "${item.nama || item.kode}" ditandai untuk dihapus saat simpan`
        );
    };

    const cancelDeletion = (itemId) => {
        const itemInfo = findItemInfo(itemId);
        if (!itemInfo) return;

        const { item } = itemInfo;
        const hasChildren = item.children && item.children.length > 0;

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

    const handleImmediateDelete = async (itemId) => {
        setDeletingNow(true);
        try {
            await itemKeuanganService.delete(itemId);

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
            let updatedChildren = [];
            if (item.children && item.children.length > 0) {
                updatedChildren = calculateTreeTargets(item.children);
            }

            let newItem = { ...item, children: updatedChildren };
            if (updatedChildren.length > 0) {
                const sumChildren = updatedChildren.reduce((sum, child) => {
                    return sum + (parseFloat(child.totalTarget) || 0);
                }, 0);

                newItem.totalTarget = sumChildren.toString();
                newItem.targetFrekuensi = "";
                newItem.nominalSatuan = "";
            }
            return newItem;
        });
    };

    const updateItem = (itemId, field, value) => {
        const applyChange = (itemList) => {
            return itemList.map((item) => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, [field]: value };
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
        const recalculatedItems = calculateTreeTargets(changedItems);
        setItems(recalculatedItems);
    };

    const saveItems = async () => {
        if (!selectedKategori) {
            toast.error("Pilih kategori terlebih dahulu");
            return;
        }
        if (!selectedPeriode) {
            toast.error("Pilih periode terlebih dahulu");
            return;
        }

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
            const existingItemIds =
                existingItems?.data?.items?.map((item) => item.id) || [];

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
            const itemsToDelete = [
                ...existingItemIds.filter((id) => !currentItemIds.includes(id)),
                ...Array.from(markedForDeletion).filter(
                    (id) => !id.startsWith("temp_")
                ),
            ];
            const uniqueItemsToDelete = [...new Set(itemsToDelete)];

            for (const itemId of uniqueItemsToDelete) {
                if (!itemId.startsWith("temp_")) {
                    try {
                        await itemKeuanganService.delete(itemId);
                    } catch (error) {
                        if (error.response?.status !== 404) {
                            console.warn(`Failed to delete item ${itemId}`, error);
                        }
                    }
                }
            }

            const flattenItems = async (itemList, parentRealId = null) => {
                let result = [];
                for (const item of itemList) {
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

                    let savedItem;
                    try {
                        if (item.id.startsWith("temp_")) {
                            savedItem = await itemKeuanganService.create(itemData);
                        } else {
                            savedItem = await itemKeuanganService.update(item.id, itemData);
                        }

                        result.push(savedItem);

                        if (savedItem && item.children && item.children.length > 0) {
                            const childResults = await flattenItems(
                                item.children,
                                savedItem.data?.id || savedItem.id
                            );
                            result.push(...childResults);
                        }
                    } catch (err) {
                        console.error("Error saving specific item", item, err);
                        // Continue? Or throw?
                        throw err;
                    }
                }
                return result;
            };

            await flattenItems(items);
            toast.success("Item keuangan berhasil diperbarui");
            setMarkedForDeletion(new Set());
            router.push("/employee/keuangan/master/item");
        } catch (error) {
            console.error("Error saving items:", error);
            toast.error(error.response?.data?.message || "Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const renderItemForm = (item, level = 1, index = 0) => {
        const indentClass = level > 1 ? `ml-${(level - 1) * 8}` : "";
        const isMarked = markedForDeletion.has(item.id);

        return (
            <div key={item.id} className={`space-y-4 ${indentClass} ${isMarked ? "opacity-50" : ""}`}>
                <Card className={`relative ${isMarked ? "border-red-300 bg-red-50" : ""}`}>
                    {isMarked && (
                        <div className="absolute inset-x-0 top-0 bottom-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                                <Badge variant="destructive">Ditandai untuk dihapus</Badge>
                                <Button size="sm" variant="outline" onClick={() => cancelDeletion(item.id)}>
                                    <Undo2 className="h-4 w-4 mr-2" /> Batal Hapus
                                </Button>
                            </div>
                        </div>
                    )}

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
                                    disabled={isMarked}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Sub Item
                                </Button>

                                <Button
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                    onClick={() => addSibling(item.id, item.level)}
                                    disabled={isMarked}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Sibling
                                </Button>

                                {markedForDeletion.has(item.id) ? (
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                        onClick={() => cancelDeletion(item.id)}
                                        className="text-gray-600"
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                        onClick={() => deleteItem(item.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Same fields as create, but handles values */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <TextInput
                                    required
                                    label="Nama Item"
                                    placeholder="Contoh: Persembahan Perpuluhan"
                                    value={item.nama}
                                    onChange={(value) => updateItem(item.id, "nama", value)}
                                    disabled={isMarked}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <TextAreaInput
                                    label="Deskripsi"
                                    placeholder="Deskripsi detail item"
                                    rows={2}
                                    value={item.deskripsi}
                                    onChange={(value) => updateItem(item.id, "deskripsi", value)}
                                    disabled={isMarked}
                                />
                            </div>

                            <div>
                                <NumberInput
                                    label="Target Frekuensi"
                                    placeholder="12"
                                    value={item.targetFrekuensi}
                                    onChange={(value) =>
                                        updateItem(item.id, "targetFrekuensi", value)
                                    }
                                    disabled={item.children && item.children.length > 0 || isMarked}
                                />
                            </div>

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
                                    disabled={item.children && item.children.length > 0 || isMarked}
                                />
                            </div>

                            <div>
                                <NumberInput
                                    label="Nominal Per Satuan"
                                    placeholder="1000000"
                                    showCurrencyFormat={true}
                                    value={item.nominalSatuan}
                                    onChange={(value) =>
                                        updateItem(item.id, "nominalSatuan", value)
                                    }
                                    disabled={item.children && item.children.length > 0 || isMarked}
                                />
                            </div>

                            <div>
                                <NumberInput
                                    label="Total Target Anggaran"
                                    placeholder="12000000"
                                    showCurrencyFormat={true}
                                    value={item.totalTarget}
                                    onChange={(value) =>
                                        updateItem(item.id, "totalTarget", value)
                                    }
                                    disabled={item.children && item.children.length > 0 || isMarked}
                                />

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.push("/employee/keuangan/master/item")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Edit Rancangan Item Keuangan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Edit struktur dan nominal anggaran
                        </p>
                    </div>
                </div>

                <Button
                    className="min-w-32"
                    disabled={saving || !selectedKategori || !selectedPeriode}
                    onClick={saveItems}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
            </div>

            {!selectedKategori || !selectedPeriode ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Parameter Kategori atau Periode tidak valid.</p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => router.push("/employee/keuangan/master/item")}
                        >
                            Kembali ke Daftar
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                        <CardContent className="py-4 px-6 flex items-center justify-between">
                            <div className="flex gap-8">
                                <div>
                                    <span className="text-sm text-gray-500 block">Kategori</span>
                                    <span className="font-semibold">{getKategoriKode()}</span>
                                </div>
                                {/* Periode info is harder to get without fetching specific object, but ID is there */}
                                <div>
                                    <span className="text-sm text-gray-500 block">Periode ID</span>
                                    <span className="font-semibold">{selectedPeriode}</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Mode Edit
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {items
                            .filter((item) => item.level === 1)
                            .map((item, index) => renderItemForm(item, 1, index))}
                    </div>

                    <div className="flex justify-center pt-8 pb-20">
                        <Button
                            className="min-w-32"
                            size="lg"
                            disabled={saving}
                            onClick={saveItems}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                message={confirmModal.message}
                title={confirmModal.title}
                type={confirmModal.type}
                onCancel={() =>
                    setConfirmModal({
                        isOpen: false,
                        title: "",
                        message: "",
                        onConfirm: null,
                        type: "warning",
                    })
                }
                onConfirm={confirmModal.onConfirm}
            />

            <DeleteOptionsModal
                isOpen={deleteOptionsModal.isOpen}
                title={`Hapus Item: ${deleteOptionsModal.itemName}`}
                description="Item ini sudah tersimpan di database. Apa yang ingin Anda lakukan?"
                options={[
                    {
                        id: "mark",
                        label: "Tandai untuk dihapus (Hapus saat Simpan)",
                        description: "Item akan dihapus dari tampilan sekarang, tapi baru dihapus dari database saat Anda menekan tombol Simpan.",
                        variant: "default",
                        onClick: () => markForDeletion(deleteOptionsModal.itemId)
                    },
                    {
                        id: "immediate",
                        label: "Hapus Sekarang (Permanen)",
                        description: "Item akan langsung dihapus dari database saat ini juga.",
                        variant: "destructive",
                        onClick: () => handleImmediateDelete(deleteOptionsModal.itemId),
                        isLoading: deletingNow
                    }
                ]}
                onClose={() => setDeleteOptionsModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
