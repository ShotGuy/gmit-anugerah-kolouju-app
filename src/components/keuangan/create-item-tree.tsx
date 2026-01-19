"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    ChevronRight,
    GripVertical
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragMoveEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SortableItemCard } from "./SortableItemCard";
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

    // --- DnD State ---
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Flatten Tree for SortableContext
    // Strategy: "Collapse while Dragging"
    // If dragging a parent, hide its children from the flattened list.
    const flattenedItems = useMemo(() => {
        const flat: ItemNode[] = [];

        // Helper to check if node is a child of the active item
        const isChildOfActive = (node: ItemNode, activeId: string | null): boolean => {
            if (!activeId) return false;
            // We can check if parentId chain matches activeId.
            // But simpler: In the traverse, if we encounter activeId, we skip adding its children.
            return false; // Logic handled in traversal
        };

        const traverse = (nodes: ItemNode[], isHidden: boolean = false) => {
            nodes.forEach(node => {
                if (!isHidden) {
                    flat.push(node);
                }

                // If this node is the one being dragged, hide its children
                const shouldHideChildren = isHidden || (activeId !== null && node.id === activeId);

                if (node.children.length > 0) {
                    traverse(node.children, shouldHideChildren);
                }
            });
        };

        traverse(items);
        return flat;
    }, [items, activeId]);

    const activeItem = useMemo(() => flattenedItems.find(i => i.id === activeId), [activeId, flattenedItems]);

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
    const handleAddChild = useCallback((parentId: string, level: number) => {
        setItems(prevItems => {
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
            const codedItems = updateCodes(recursiveAdd(prevItems));
            return codedItems;
        });
    }, []);

    const handleAddSibling = useCallback((targetId: string, level: number, parentId: string | null) => {
        setItems(prevItems => {
            let newItems = [...prevItems];
            if (level === 1) {
                // Root sibling
                const index = newItems.findIndex(i => i.id === targetId);
                const newSibling = createEmptynode(1, newItems.length + 1, null);
                newItems.splice(index + 1, 0, newSibling);
            } else {
                // Deep sibling
                const recursiveAdd = (nodes: ItemNode[]): ItemNode[] => {
                    return nodes.map(node => {
                        const childIndex = node.children.findIndex(c => c.id === targetId);
                        if (childIndex !== -1) {
                            const newSibling = createEmptynode(level, node.children.length + 1, node.id);
                            const newChildren = [...node.children];
                            newChildren.splice(childIndex + 1, 0, newSibling);
                            return { ...node, children: newChildren };
                        }
                        if (node.children.length > 0) {
                            return { ...node, children: recursiveAdd(node.children) };
                        }
                        return node;
                    });
                };
                newItems = recursiveAdd(newItems);
            }
            return updateCodes(newItems);
        });
    }, []);

    const handleDelete = useCallback((targetId: string) => {
        if (!confirm("Hapus item ini (dan sub-itemnya)?")) return;

        setItems(prevItems => {
            const recursiveDelete = (nodes: ItemNode[]): ItemNode[] => {
                return nodes
                    .filter(n => n.id !== targetId)
                    .map(n => ({ ...n, children: recursiveDelete(n.children) }));
            };
            return updateCodes(recursiveDelete(prevItems));
        });
    }, []);

    const handleUpdate = useCallback((targetId: string, field: keyof ItemNode, value: string) => {
        setItems(prevItems => {
            const updateNode = (nodes: ItemNode[]): ItemNode[] => {
                return nodes.map(node => {
                    if (node.id === targetId) {
                        const updated = { ...node, [field]: value };
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
                        const newChildren = updateNode(node.children);
                        const sumChildren = newChildren.reduce((acc, child) => {
                            return acc + (parseFloat(child.totalTarget) || 0);
                        }, 0);
                        if (newChildren.length > 0) {
                            return { ...node, children: newChildren, totalTarget: sumChildren.toString() };
                        }
                        return { ...node, children: newChildren };
                    }
                    return node;
                });
            };
            // Note: Update doesn't typically change structure, so updateCodes might be overkill but safe
            // Optimization: Skip updateCodes if field is not structure-related?
            return updateNode(prevItems);
        });
    }, []);

    // --- DnD Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragMove = (event: DragMoveEvent) => {
        // No-op to avoid re-renders. Dnd-kit handles internal state.
        // If we need visual indicators based on position, use event.delta in DragOverlay or CSS.
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeNode = flattenedItems.find(i => i.id === active.id);
        const overNode = flattenedItems.find(i => i.id === over.id);

        if (!activeNode || !overNode) return;

        // Visual Depth Calculation
        const projectedDepth = activeNode.level + Math.round(event.delta.x / 24);

        // Construct new Flat List order
        const oldIndex = flattenedItems.findIndex(i => i.id === active.id);
        const newIndex = flattenedItems.findIndex(i => i.id === over.id);

        let newFlatOrder = arrayMove(flattenedItems, oldIndex, newIndex);

        // Reconstruct Tree
        const newTree: ItemNode[] = [];
        const stack: ItemNode[] = [];

        // Helper to recursively update levels
        const updateSubtreeLevels = (nodes: ItemNode[], delta: number): ItemNode[] => {
            return nodes.map(node => ({
                ...node,
                level: node.level + delta,
                children: updateSubtreeLevels(node.children, delta)
            }));
        };

        // Pre-process nodes: Wipe children for visible items, Keep children for collapsed dragged item
        const processingNodes: ItemNode[] = newFlatOrder.map(n => {
            if (n.id === active.id) {
                // Keep children intact for the dragged item (subtree)
                return { ...n };
            }
            // For others, wipe children to rebuild hierarchy from flat list order
            return { ...n, children: [] };
        });

        for (let i = 0; i < processingNodes.length; i++) {
            const item = processingNodes[i];
            const prevItem = i > 0 ? processingNodes[i - 1] : null;

            // Determine Target Depth
            let depth = item.level;

            if (item.id === active.id) {
                const maxDepth = prevItem ? prevItem.level + 1 : 1;
                const minDepth = 1;
                depth = Math.max(minDepth, Math.min(projectedDepth, maxDepth));

                // If level changed, we must shift the subtree
                const delta = depth - item.level;
                if (delta !== 0) {
                    item.children = updateSubtreeLevels(item.children, delta);
                }
            } else {
                const maxDepth = prevItem ? prevItem.level + 1 : 1;
                if (depth > maxDepth) {
                    depth = maxDepth;
                }
            }

            // Assign valid depth
            item.level = depth;
            item.parentId = null;

            // Stack management
            while (stack.length >= depth) {
                stack.pop();
            }

            // Parent is now at stack top
            const parent = stack.length > 0 ? stack[stack.length - 1] : null;

            if (parent) {
                parent.children.push(item);
                item.parentId = parent.id;
            } else {
                newTree.push(item);
                item.parentId = null;
            }

            stack.push(item);
        }

        setTreeItems(newTree);
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
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragStart={handleDragStart}
                                        onDragMove={handleDragMove}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={flattenedItems.map(i => i.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {flattenedItems.map(node => (
                                                <SortableItemCard
                                                    key={node.id}
                                                    node={node}
                                                    handleAddChild={handleAddChild}
                                                    handleAddSibling={handleAddSibling}
                                                    handleDelete={handleDelete}
                                                    handleUpdate={handleUpdate}
                                                />
                                            ))}
                                        </SortableContext>
                                        <DragOverlay>
                                            {activeId && activeItem ? (
                                                <SortableItemCard
                                                    node={activeItem}
                                                    isOverlay
                                                    handleAddChild={() => { }}
                                                    handleAddSibling={() => { }}
                                                    handleDelete={() => { }}
                                                    handleUpdate={() => { }}
                                                />
                                            ) : null}
                                        </DragOverlay>
                                    </DndContext>

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
