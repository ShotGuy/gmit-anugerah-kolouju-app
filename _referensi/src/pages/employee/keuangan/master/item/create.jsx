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

    // Query options
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

    const { data: existingItems, refetch: refetchItems } = useQuery({
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

            if (existing.length === 0) {
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
                setItems(buildTreeFromExisting(existing));
            }
        }
    }, [selectedKategori, selectedPeriode, existingItems]);

    const buildTreeFromExisting = (existingItems) => {
        const itemMap = new Map();
        const rootItems = [];

        existingItems.forEach((item) => {
            itemMap.set(item.id, {
                ...item,
                children: [],
                id: item.id,
                targetFrekuensi: item.targetFrekuensi || "",
                satuanFrekuensi: item.satuanFrekuensi || "",
                nominalSatuan: item.nominalSatuan || "",
                totalTarget: item.totalTarget || "",
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

    const showDeleteConfirmation = (itemId) => {
        const itemInfo = findItemInfo(itemId);
        if (!itemInfo) return;

        const { item } = itemInfo;
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

        setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
            type: "warning"
        });

        toast.success(
            hasChildren
                ? `Item "${item.nama || item.kode}" dan sub-itemnya berhasil dihapus`
                : `Item "${item.nama || item.kode}" berhasil dihapus`
        );
    };

    const deleteItem = showDeleteConfirmation;

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

                    let savedItem;
                    if (item.id.startsWith("temp_")) {
                        savedItem = await itemKeuanganService.create(itemData);
                    } else {
                        savedItem = await axios.patch(
                            `/api/keuangan/item/${item.id}`,
                            itemData
                        );
                        savedItem = savedItem.data;
                    }

                    result.push(savedItem);

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

        return (
            <div key={item.id} className={`space-y-4 ${indentClass}`}>
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
                            <div className="md:col-span-2">
                                <TextInput
                                    required
                                    label="Nama Item"
                                    placeholder="Contoh: Persembahan Perpuluhan"
                                    value={item.nama}
                                    onChange={(value) => updateItem(item.id, "nama", value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <TextAreaInput
                                    label="Deskripsi"
                                    placeholder="Deskripsi detail item"
                                    rows={2}
                                    value={item.deskripsi}
                                    onChange={(value) => updateItem(item.id, "deskripsi", value)}
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
                                    disabled={item.children && item.children.length > 0}
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
                                    disabled={item.children && item.children.length > 0}
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
                                    disabled={item.children && item.children.length > 0}
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
                                    disabled={item.children && item.children.length > 0}
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
                    {saving ? "Menyimpan..." : "Simpan Semua"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Dasar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kategori Keuangan
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={selectedKategori}
                                onChange={(e) => setSelectedKategori(e.target.value)}
                            >
                                <option value="">Pilih Kategori</option>
                                {kategoriOptions?.data?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.kode} - {cat.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Periode Anggaran
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={selectedPeriode}
                                onChange={(e) => setSelectedPeriode(e.target.value)}
                            >
                                <option value="">Pilih Periode</option>
                                {periodeOptions?.data?.map((periode) => (
                                    <option key={periode.value} value={periode.value}>
                                        {periode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedKategori && selectedPeriode && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Struktur Item</h2>
                    </div>

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
                            {saving ? "Menyimpan..." : "Simpan Semua Data"}
                        </Button>
                    </div>
                </div>
            )}

            {selectedKategori && selectedPeriode && items.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p>Gagal memuat item atau belum ada item.</p>
                </div>
            )}

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
                        type: "warning"
                    })
                }
                onConfirm={confirmModal.onConfirm}
            />
        </div>
    );
}
