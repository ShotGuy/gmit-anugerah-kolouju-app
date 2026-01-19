"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ChevronRight,
    ChevronDown,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Loader2,
    DollarSign,
    Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { getItemsTree, deleteItemKeuangan } from "@/actions/keuangan/item";

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
interface ItemKeuangan {
    id: string;
    kode: string;
    nama: string;
    level: number;
    parentId: string | null;
    kategoriId: string;
    totalTarget: number | null;
    nominalActual: number | null;
    targetFrekuensi: number | null;
    satuanFrekuensi: string | null;
    nominalSatuan: number | null;
    deskripsi: string | null;
    createdAt: Date;
    updatedAt: Date;
    hasChildren: boolean;
    children?: ItemKeuangan[];
}

interface BudgetTreeClientProps {
    initialPeriodes: Periode[];
    initialKategoris: Kategori[];
}

export default function BudgetTreeClient({
    initialPeriodes,
    initialKategoris,
}: BudgetTreeClientProps) {
    const router = useRouter();
    const [selectedPeriode, setSelectedPeriode] = useState<string>(
        initialPeriodes.length > 0 ? initialPeriodes[0].id : ""
    );
    const [selectedKategori, setSelectedKategori] = useState<string>("all");

    const [items, setItems] = useState<ItemKeuangan[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState<string>("all");

    // Tree State
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // --- Fetch Data ---
    const fetchData = async () => {
        if (!selectedPeriode) return;
        setIsLoading(true);
        // We fetch all items for the period (and optionally category from server if we wanted to optimization, 
        // but user asked for client side filtering feel effectively). 
        // Let's keep fetching based on selectedKategori if it's "all" or specific to minimize data if needed,
        // but for "search" we usually need full tree to filter.
        // For now, let's pull all items for the period to allow smooth client-side filtering.
        const res = await getItemsTree(selectedPeriode, selectedKategori === "all" ? undefined : selectedKategori);
        if (res.success && res.data) {
            setItems(res.data);
        } else {
            setItems([]);
            toast.error("Gagal memuat data anggaran");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [selectedPeriode, selectedKategori]);

    // --- Tree Helper ---
    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedNodes);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedNodes(newSet);
    };

    // Filter Logic
    const filteredItems = useMemo(() => {
        let result = items;

        // 1. Text Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.nama.toLowerCase().includes(lowerQuery) ||
                item.kode.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Level Filter
        if (filterLevel !== "all") {
            const level = parseInt(filterLevel);
            result = result.filter(item => item.level === level);
        }

        return result;
    }, [items, searchQuery, filterLevel]);

    // Build Hierarchy
    const treeData = useMemo(() => {
        // If searching or filtering level, we might break the tree structure.
        // If specific filters are active, we might want to show flat list or maintain tree path.
        // Usually simpler to show flat list when searching, or keep tree if possible.
        // Let's stick to Tree structure, but if a child matches and parent doesn't ?? 
        // For now, let's rebuild tree from filtered items. This works best if we filter "Keep parents of matched children".
        // But for simple "Level" filter, it's just that level.

        // If strict filtering is applied (SearchResults), standard tree might look broken. 
        // Let's try to Map all items first.

        const map = new Map<string, ItemKeuangan & { children: ItemKeuangan[] }>();
        const roots: (ItemKeuangan & { children: ItemKeuangan[] })[] = [];

        // Note: filteredItems contains the items that matched. 
        // Constructing a tree from ONLY matched items might isolate children from parents.
        // Ideally: If searching, show the matched item. If it has parent, show parent (expanded)?
        // For simplicity in this iteration: Just build tree from filteredItems. 
        // *Improvement*: When searching, maybe just show flat table? User asked for filters.

        // Let's use the full 'items' for tree construction IF no search/level filter is active
        // But if filters are active, maybe just flat list? 
        // The prompt says "filter by level". If I filter level 1, I only see roots. If level 2, only existing children.
        // Let's support that (Flat view effectively if filtering strictly).

        const sourceData = (searchQuery || filterLevel !== "all") ? filteredItems : items;
        const isFiltering = searchQuery !== "" || filterLevel !== "all";

        sourceData.forEach((item) => {
            map.set(item.id, { ...item, children: [] });
        });

        sourceData.forEach((item) => {
            // Only attach to parent IF parent is also in the sourceData (filtered)
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId)!.children.push(map.get(item.id)!);
            } else {
                // If parent not found (e.g. filtered out), treat as root for display
                roots.push(map.get(item.id)!);
            }
        });

        return roots;
    }, [items, filteredItems, searchQuery, filterLevel]);


    // --- Handlers ---
    const handleAddRoot = () => {
        if (!selectedPeriode) return;
        router.push(`/keuangan/create?periodeId=${selectedPeriode}`);
    };

    const handleAddChild = (parent: ItemKeuangan) => {
        if (!selectedPeriode) return;
        router.push(`/keuangan/create?periodeId=${selectedPeriode}&parentId=${parent.id}`);
    };

    const handleEdit = (item: ItemKeuangan) => {
        router.push(`/keuangan/${item.id}/edit`);
    };

    const handleDelete = async (id: string, nama: string) => {
        if (!confirm(`Hapus item "${nama}"?`)) return;

        // Optimistic Update
        const oldItems = [...items];
        setItems((prev) => prev.filter(i => i.id !== id));

        const res = await deleteItemKeuangan(id);
        if (res.success) {
            toast.success(res.message);
        } else {
            setItems(oldItems); // Revert
            toast.error(res.message || "Gagal menghapus");
        }
    };

    const handleExport = () => {
        toast.info("Fitur Export akan segera tersedia.");
    };

    // --- Render Row ---
    const renderRow = (item: ItemKeuangan & { children: ItemKeuangan[] }, level: number) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedNodes.has(item.id);
        const indentLevel = (searchQuery || filterLevel !== "all") ? 0 : level;
        const paddingLeft = indentLevel * 24 + 16; // Maintain indentation logic

        return (
            <div key={item.id}>
                <div className={`
          flex flex-col border-b border-border/50 hover:bg-muted/50 transition-colors py-2 pr-4
          ${(level === 0 && !searchQuery) ? "bg-muted/10" : ""}
        `}>
                    <div className="flex items-center">
                        {/* Tree Control & Name */}
                        <div className="flex-1 flex items-center min-w-0" style={{ paddingLeft }}>
                            <div className="w-6 mr-1 flex-shrink-0">
                                {hasChildren && !searchQuery && filterLevel === "all" && (
                                    <button onClick={() => toggleExpand(item.id)} className="text-muted-foreground hover:text-foreground">
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 truncate pr-2">
                                <Badge variant="outline" className="font-mono text-[10px] h-5 px-1 flex-shrink-0">{item.kode}</Badge>
                                <span className={`truncate text-sm ${(level === 0 && !searchQuery) ? "font-medium" : ""}`} title={item.nama}>
                                    {item.nama}
                                </span>
                            </div>
                        </div>

                        {/* Desktop: Target */}
                        <div className="w-[150px] text-right text-xs hidden md:block">
                            {item.totalTarget ? (
                                <span className="font-mono">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.totalTarget)}</span>
                            ) : "-"}
                        </div>

                        {/* Desktop: Realisasi */}
                        <div className="w-[150px] text-right text-xs hidden md:block px-4">
                            {item.nominalActual ? (
                                <span className="font-mono text-green-600 dark:text-green-400">
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.nominalActual)}
                                </span>
                            ) : "-"}
                        </div>

                        {/* Desktop: Progress */}
                        <div className="w-[80px] text-center text-xs hidden sm:block">
                            {item.totalTarget && item.totalTarget > 0 ? (
                                <Badge variant={(item.nominalActual || 0) >= item.totalTarget ? "default" : "secondary"} className="text-[10px]">
                                    {Math.round(((item.nominalActual || 0) / item.totalTarget) * 100)}%
                                </Badge>
                            ) : "-"}
                        </div>

                        {/* Actions */}
                        <div className="w-[50px] flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleAddChild(item)}>
                                        <Plus className="mr-2 h-4 w-4" /> Tambah Sub-Item
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Item
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(item.id, item.nama)} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Mobile Only: Stats Row */}
                    <div className="flex md:hidden items-center justify-between text-[11px] text-muted-foreground mt-1" style={{ paddingLeft: paddingLeft + 28 }}>
                        <div className="flex flex-col gap-0.5">
                            <span>Target: {item.totalTarget ? new Intl.NumberFormat("id-ID", { compactDisplay: "short", notation: "compact", currency: "IDR" }).format(item.totalTarget) : "-"}</span>
                            <span>Real: {item.nominalActual ? new Intl.NumberFormat("id-ID", { compactDisplay: "short", notation: "compact", currency: "IDR" }).format(item.nominalActual) : "-"}</span>
                        </div>
                        {item.totalTarget && item.totalTarget > 0 && (
                            <Badge variant={(item.nominalActual || 0) >= item.totalTarget ? "default" : "secondary"} className="text-[10px] h-5 px-1.5 mr-2">
                                {Math.round(((item.nominalActual || 0) / item.totalTarget) * 100)}%
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Render Children */}
                {(isExpanded || searchQuery || filterLevel !== "all") && item.children && item.children.length > 0 &&
                    item.children.map(child => renderRow({ ...child, children: child.children || [] }, level + 1))
                }
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rencana Mata Anggaran</h1>
                    <p className="text-muted-foreground text-sm">Kelola struktur dan alokasi anggaran belanja/penerimaan.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                        <SelectTrigger className="w-[200px] bg-background">
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialPeriodes.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nama} ({p.tahun})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-3 border rounded-lg shadow-sm">
                <div className="flex flex-1 items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {/* Search */}
                    <div className="relative w-full md:w-[250px]">
                        <input
                            type="text"
                            placeholder="Cari item anggaran..."
                            className="w-full text-sm pl-3 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Kategori */}
                    <Select value={selectedKategori} onValueChange={setSelectedKategori}>
                        <SelectTrigger className="w-[180px] bg-background h-9 text-xs">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {initialKategoris.map(k => (
                                <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter Level */}
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-[120px] bg-background h-9 text-xs">
                            <SelectValue placeholder="Semua Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Level</SelectItem>
                            <SelectItem value="0">Level 0 (Root)</SelectItem>
                            <SelectItem value="1">Level 1</SelectItem>
                            <SelectItem value="2">Level 2</SelectItem>
                            <SelectItem value="3">Level 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={handleAddRoot} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Item
                    </Button>
                </div>
            </div>

            <Card className="min-h-[500px]">
                <CardHeader className="py-4 border-b bg-muted/20">
                    <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="flex-1 pl-4">Item Anggaran</div>
                        <div className="w-[150px] text-right hidden md:block">Target</div>
                        <div className="w-[150px] text-right hidden md:block px-4">Realisasi</div>
                        <div className="w-[80px] text-center hidden sm:block">Capaian</div>
                        <div className="w-[50px] text-right"></div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground text-sm">Memuat data anggaran...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">Belum ada item anggaran</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-4">
                                Mulai dengan menambahkan item anggaran utama untuk periode ini.
                            </p>
                            <Button onClick={handleAddRoot}>
                                <Plus className="mr-2 h-4 w-4" /> Buat Item Baru
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {treeData.map(root => renderRow(root, 0))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
