"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getItemsTree } from "@/actions/keuangan/item";
import { saveBudgetTree } from "@/actions/keuangan/bulk-item";

// --- Types ---
interface Periode {
    id: string;
    nama: string;
    tahun: number;
}
interface Kategori {
    id: string;
    nama: string;
    kode: string;
}

interface ItemNode {
    id: string;
    kode: string;
    nama: string;
    deskripsi: string;
    level: number;
    urutan: number;
    targetFrekuensi: string; // Keep as string for input
    satuanFrekuensi: string;
    nominalSatuan: string; // Keep as string for input
    totalTarget: string;   // Keep as string for input
    parentId: string | null;
    children: ItemNode[];
    original?: {
        nama: string;
        deskripsi: string;
        targetFrekuensi: string;
        satuanFrekuensi: string;
        nominalSatuan: string;
    } | null;
}

interface CreateItemTreeProps {
    initialPeriodes: Periode[];
    initialKategoris: Kategori[];
    defaultPeriodeId?: string;
    defaultKategoriId?: string;
}

export default function CreateItemTree({
    initialPeriodes,
    initialKategoris,
    defaultPeriodeId,
    defaultKategoriId
}: CreateItemTreeProps) {
    const router = useRouter();
    const [selectedPeriode, setSelectedPeriode] = useState<string>(defaultPeriodeId || "");
    const [selectedKategori, setSelectedKategori] = useState<string>(defaultKategoriId || "");

    const [items, setItems] = useState<ItemNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const loadInitialData = async () => {
            if (!selectedPeriode || !selectedKategori) {
                setItems([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await getItemsTree(selectedPeriode, selectedKategori);
                if (res.success && res.data && res.data.length > 0) {
                    // Mapper from Server Data to UI State
                    // We need to rebuild the tree structure manually or rely on `getItemsTree` structure
                    // `getItemsTree` returns flat list with parentId. We need hierarchical for the UI.
                    const tree = buildTreeFromFlat(res.data);
                    setItems(tree);
                } else {
                    // Initialize with 1 empty root item if no data
                    setItems([createEmptynode(1, 1, null)]);
                }
            } catch (e) {
                console.error(e);
                toast.error("Gagal memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [selectedPeriode, selectedKategori]);

    // --- Helpers ---
    const buildTreeFromFlat = (flatItems: any[]): ItemNode[] => {
        const map = new Map<string, ItemNode>();
        const roots: ItemNode[] = [];

        // 1. Create Nodes
        flatItems.forEach(item => {
            const node: ItemNode = {
                id: item.id,
                kode: item.kode,
                nama: item.nama,
                deskripsi: item.deskripsi || "",
                level: item.level,
                urutan: item.urutan, // Need to handle ordering if available
                targetFrekuensi: item.targetFrekuensi?.toString() || "",
                satuanFrekuensi: item.satuanFrekuensi || "",
                nominalSatuan: item.nominalSatuan?.toString() || "",
                totalTarget: item.totalTarget?.toString() || "",
                parentId: item.parentId,
                children: [],
                original: {
                    nama: item.nama,
                    deskripsi: item.deskripsi || "",
                    targetFrekuensi: item.targetFrekuensi?.toString() || "",
                    satuanFrekuensi: item.satuanFrekuensi || "",
                    nominalSatuan: item.nominalSatuan?.toString() || ""
                }
            };
            map.set(item.id, node);
        });

        // 2. Link
        flatItems.forEach(item => {
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId)!.children.push(map.get(item.id)!);
            } else {
                roots.push(map.get(item.id)!);
            }
        });

        // Sort by Kode roughly
        const sortNodes = (nodes: ItemNode[]) => {
            nodes.sort((a, b) => a.kode.localeCompare(b.kode));
            nodes.forEach(n => sortNodes(n.children));
        };
        sortNodes(roots);

        return roots;
    };

    const createEmptynode = (level: number, urutan: number, parentId: string | null): ItemNode => {
        return {
            id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            kode: "", // Will be calc
            nama: "",
            deskripsi: "",
            level,
            urutan,
            targetFrekuensi: "",
            satuanFrekuensi: "Bulan",
            nominalSatuan: "",
            totalTarget: "",
            parentId,
            children: [],
            original: null
        };
    };

    // --- Logic: Code Generation ---
    // Simple auto-code logic: A, A.1, A.1.1
    // Re-calculates entire tree codes based on structure
    const updateCodes = (nodes: ItemNode[], parentCode: string = ""): ItemNode[] => {
        return nodes.map((node, index) => {
            const myIndex = index + 1;
            let newCode: string;

            if (node.level === 1) {
                // Use Alphabet for Root? Or just Numbers. Request said "A.1"? 
                // Let's assume Alphabet for Root (A, B, C...) based on reference logic
                newCode = String.fromCharCode(65 + index); // A, B, C...
            } else {
                newCode = `${parentCode}.${myIndex}`;
            }

            return {
                ...node,
                kode: newCode,
                urutan: myIndex,
                children: updateCodes(node.children, newCode)
            };
        });
    };

    // Wrapper to update state with code recalc
    const setTreeItems = (newItems: ItemNode[]) => {
        const codedItems = updateCodes(newItems);
        setItems(codedItems);
    };


    // --- Actions ---
    const handleAddChild = (parentId: string, level: number) => {
        const recursiveAdd = (nodes: ItemNode[]): ItemNode[] => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    const newChild = createEmptynode(level + 1, node.children.length + 1, parentId);
                    return { ...node, children: [...node.children, newChild] };
                } else if (node.children.length > 0) {
                    return { ...node, children: recursiveAdd(node.children) };
                }
                return node;
            });
        };
        setTreeItems(recursiveAdd(items));
    };

    const handleAddSibling = (targetId: string, level: number, parentId: string | null) => {
        if (level === 1) {
            // Root sibling
            const index = items.findIndex(i => i.id === targetId);
            const newSibling = createEmptynode(1, items.length + 1, null);
            const newItems = [...items];
            newItems.splice(index + 1, 0, newSibling);
            setTreeItems(newItems);
        } else {
            // Deep sibling
            const recursiveAdd = (nodes: ItemNode[]): ItemNode[] => {
                // Check if target is child of this level
                // Actually need to find parent first
                // Easier: traverse and look into children array
                return nodes.map(node => {
                    // If target is in my children
                    const childIndex = node.children.findIndex(c => c.id === targetId);
                    if (childIndex !== -1) {
                        const newSibling = createEmptynode(level, node.children.length + 1, node.id);
                        const newChildren = [...node.children];
                        newChildren.splice(childIndex + 1, 0, newSibling);
                        return { ...node, children: newChildren };
                    }
                    // Else recurse
                    if (node.children.length > 0) {
                        return { ...node, children: recursiveAdd(node.children) };
                    }
                    return node;
                });
            };
            setTreeItems(recursiveAdd(items));
        }
    };

    const handleDelete = (targetId: string) => {
        const recursiveDelete = (nodes: ItemNode[]): ItemNode[] => {
            return nodes
                .filter(n => n.id !== targetId)
                .map(n => ({ ...n, children: recursiveDelete(n.children) }));
        };

        // Prevent deleting last root?


        if (confirm("Hapus item ini (dan sub-itemnya)?")) {
            setTreeItems(recursiveDelete(items));
        }
    };

    const handleUpdate = (targetId: string, field: keyof ItemNode, value: string) => {
        // Recursive update
        const updateNode = (nodes: ItemNode[]): ItemNode[] => {
            return nodes.map(node => {
                if (node.id === targetId) {
                    const updated = { ...node, [field]: value };

                    // Auto Calc Logic
                    // If freq or nominal changed, update total
                    if (field === 'targetFrekuensi' || field === 'nominalSatuan') {
                        const freq = parseFloat(field === 'targetFrekuensi' ? value : node.targetFrekuensi);
                        const nom = parseFloat(field === 'nominalSatuan' ? value : node.nominalSatuan);
                        if (!isNaN(freq) && !isNaN(nom)) {
                            updated.totalTarget = (freq * nom).toString();
                        }
                    }

                    return updated;
                }
                if (node.children.length > 0) {
                    // Recurse first
                    const newChildren = updateNode(node.children);

                    // Helper: Rollup Total Target from children
                    // If I have children, my total target is sum of children
                    const sumChildren = newChildren.reduce((acc, child) => {
                        return acc + (parseFloat(child.totalTarget) || 0);
                    }, 0);

                    // Update self if children exist
                    if (newChildren.length > 0) {
                        // Only override if children actually have values? 
                        // Logic from ref: "If has children, Total Target = Sum of Children's Total Target"
                        return { ...node, children: newChildren, totalTarget: sumChildren.toString() };
                    }

                    return { ...node, children: newChildren };
                }
                return node;
            });
        };

        setItems(updateNode(items));
    };


    // --- Saving ---
    const handleSave = async () => {
        if (!selectedPeriode || !selectedKategori) {
            toast.error("Mohon pilih Periode dan Kategori");
            return;
        }

        setIsSaving(true);
        // Clean items for submission (parse numbers)
        const cleanForSubmit = (nodes: ItemNode[]): any[] => {
            return nodes.map(n => ({
                id: n.id,
                kode: n.kode,
                nama: n.nama,
                deskripsi: n.deskripsi,
                level: n.level,
                urutan: n.urutan,
                targetFrekuensi: n.targetFrekuensi ? parseFloat(n.targetFrekuensi) : null,
                satuanFrekuensi: n.satuanFrekuensi,
                nominalSatuan: n.nominalSatuan ? parseFloat(n.nominalSatuan) : null,
                totalTarget: n.totalTarget ? parseFloat(n.totalTarget) : null,
                children: cleanForSubmit(n.children)
            }));
        };

        const payload = cleanForSubmit(items);
        const res = await saveBudgetTree(selectedPeriode, selectedKategori, payload);

        if (res.success) {
            toast.success(res.message);
            router.push('/keuangan');
        } else {
            toast.error(res.message);
        }
        setIsSaving(false);
    };


    // --- Render ---
    const renderNode = (node: ItemNode) => {
        const hasChildren = node.children.length > 0;

        return (
            <div key={node.id} className="space-y-4">
                <Card className="relative border-l-4 border-l-blue-500/20 data-[level=1]:border-l-blue-500">
                    <CardHeader className="p-4 pb-2 bg-muted/20">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                                    {node.kode || "?"}
                                </Badge>
                                <span className="text-xs text-muted-foreground mr-auto md:mr-0">Level {node.level} • Urutan: {node.urutan}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleAddChild(node.id, node.level)}>
                                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Sub Item
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddSibling(node.id, node.level, node.parentId)}>
                                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Sibling
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(node.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Item</label>
                            <Input
                                value={node.nama}
                                onChange={(e) => handleUpdate(node.id, 'nama', e.target.value)}
                                placeholder="Contoh: Persembahan Syukur"
                                className="h-9"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Deskripsi</label>
                            <Input
                                value={node.deskripsi}
                                onChange={(e) => handleUpdate(node.id, 'deskripsi', e.target.value)}
                                placeholder="Deskripsi optional..."
                                className="h-9"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Target (Frekuensi)</label>
                            <div className="flex gap-2">
                                <Input
                                    className="w-20 h-9"
                                    type="number"
                                    placeholder="12"
                                    value={node.targetFrekuensi}
                                    onChange={(e) => handleUpdate(node.id, 'targetFrekuensi', e.target.value)}
                                    disabled={hasChildren}
                                />
                                <Select
                                    value={node.satuanFrekuensi}
                                    onValueChange={(val) => handleUpdate(node.id, 'satuanFrekuensi', val)}
                                    disabled={hasChildren}
                                >
                                    <SelectTrigger className="flex-1 h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Orang/Bulan (OB)">Orang/Bulan (OB)</SelectItem>
                                        <SelectItem value="Tahun">Tahun</SelectItem>
                                        <SelectItem value="Bulan">Bulan</SelectItem>
                                        <SelectItem value="Minggu">Minggu</SelectItem>
                                        <SelectItem value="Hari">Hari</SelectItem>
                                        <SelectItem value="Kali">Kali</SelectItem>
                                        <SelectItem value="Lembar">Lembar</SelectItem>
                                        <SelectItem value="Liter">Liter</SelectItem>
                                        <SelectItem value="Buah">Buah</SelectItem>
                                        <SelectItem value="Orang">Orang</SelectItem>
                                        <SelectItem value="KK">KK</SelectItem>
                                        <SelectItem value="Paket">Paket</SelectItem>
                                        <SelectItem value="Unit">Unit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nominal Satuan</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">Rp</span>
                                <Input
                                    className="pl-8 h-9"
                                    type="number"
                                    placeholder="0"
                                    value={node.nominalSatuan}
                                    onChange={(e) => handleUpdate(node.id, 'nominalSatuan', e.target.value)}
                                    disabled={hasChildren}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-2 bg-muted/30 p-2 rounded border border-dashed text-right flex justify-between items-center px-4">
                            <div className="text-left">
                                <span className="text-xs font-medium text-muted-foreground block">Total Target Anggaran</span>
                                {hasChildren && <span className="text-[10px] text-blue-500 font-medium">(Otomatis dari sub-item)</span>}
                            </div>
                            <span className="font-mono font-bold text-lg">
                                Rp {parseFloat(node.totalTarget || "0").toLocaleString('id-ID')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Children Recursion */}
                {hasChildren && (
                    <div className="pl-4 md:pl-8 space-y-4 border-l-2 border-dashed border-muted ml-2 md:ml-4">
                        {node.children.map(child => renderNode(child))}
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Bar */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Buat Rancangan Anggaran</h2>
                    <p className="text-muted-foreground">Buat struktur hierarkis item keuangan untuk periode tertentu.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !selectedPeriode || !selectedKategori} className="min-w-[140px]">
                        {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save className="h-4 w-4 mr-2" />}
                        Simpan Struktur
                    </Button>
                </div>
            </div>

            {/* 1. Context Selection (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</span>
                            Pilih Periode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih Tahun Anggaran..." />
                            </SelectTrigger>
                            <SelectContent>
                                {initialPeriodes.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nama} ({p.tahun})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</span>
                            Pilih Kategori
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedKategori} onValueChange={setSelectedKategori}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih Kategori Keuangan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {initialKategoris.map(k => (
                                    <SelectItem key={k.id} value={k.id}>{k.nama} ({k.kode})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Builder Area */}
            {selectedPeriode && selectedKategori ? (
                <div className="space-y-4">
                    <Card className="shadow-md">
                        <CardHeader className="bg-muted/5 border-b">
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span>Struktur Item Keuangan</span>
                                <Badge variant="secondary" className="font-normal">
                                    {items.reduce((acc, i) => acc + 1 + countChildren(i), 0)} Item Total
                                </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Kode akan di-generate otomatis saat disimpan.
                            </p>
                        </CardHeader>
                        <CardContent className="p-6 bg-muted/5 min-h-[400px]">
                            {isLoading ? (
                                <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2">
                                    <span className="animate-spin text-2xl">⏳</span>
                                    Memuat data...
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map(node => renderNode(node))}

                                    {items.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-background/50">
                                            <p className="text-muted-foreground mb-4">Belum ada item untuk kategori ini.</p>
                                            <Button variant="outline" onClick={() => setItems([createEmptynode(1, 1, null)])}>
                                                <Plus className="h-4 w-4 mr-2" /> Buat Item Pertama
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/10">
                    <p className="text-muted-foreground font-medium">Silakan pilih Periode dan Kategori terlebih dahulu.</p>
                </div>
            )}
        </div>
    );
}

// Helper for count
function countChildren(node: ItemNode): number {
    return node.children.length + node.children.reduce((acc, c) => acc + countChildren(c), 0);
}
