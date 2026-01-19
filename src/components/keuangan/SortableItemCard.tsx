import { memo } from "react";
import {
    GripVertical,
    Plus,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItemNode {
    id: string;
    kode: string;
    nama: string;
    deskripsi: string;
    level: number;
    urutan: number;
    targetFrekuensi: string;
    satuanFrekuensi: string;
    nominalSatuan: string;
    totalTarget: string;
    parentId: string | null;
    children: ItemNode[];
}

interface ItemCardProps {
    node: ItemNode;
    handleUpdate: (id: string, field: any, value: string) => void;
    handleAddChild: (id: string, level: number) => void;
    handleAddSibling: (id: string, level: number, parentId: string | null) => void;
    handleDelete: (id: string) => void;
    isOverlay?: boolean;
}

function SortableItemCardComponent({
    node,
    handleUpdate,
    handleAddChild,
    handleAddSibling,
    handleDelete,
    isOverlay = false
}: ItemCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: node.id, data: node });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // When dragging, original is semi-transparent. Overlay is opaque.
        marginLeft: (node.level - 1) * 24,
        position: 'relative'
    };

    if (isOverlay) {
        // Overlay style: No margin (relative to cursor), Opaque, Shadow
        return (
            <div className="mb-4 w-full max-w-4xl cursor-grabbing shadow-2xl opacity-100">
                <Card className="relative border-l-4 border-l-blue-500 bg-background">
                    <CardHeader className="p-4 pb-2 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="cursor-grabbing text-foreground">
                                <GripVertical size={20} />
                            </div>
                            <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                                {node.kode || "?"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Level {node.level} • Urutan: {node.urutan}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                            {/* Simplified Content for Overlay */}
                            <div className="md:col-span-2">
                                <Input value={node.nama} readOnly className="h-9" />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <span className="font-bold">Rp {parseFloat(node.totalTarget || "0").toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <Card className="relative border-l-4 border-l-blue-500/20 data-[level=1]:border-l-blue-500" data-level={node.level}>
                <CardHeader className="p-4 pb-2 bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                        <div className="flex items-center gap-3">
                            {/* DRAG HANDLE */}
                            <div {...attributes} {...listeners} className="cursor-move text-muted-foreground hover:text-foreground">
                                <GripVertical size={20} />
                            </div>

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
                                disabled={node.children.length > 0}
                            />
                            <Select
                                value={node.satuanFrekuensi}
                                onValueChange={(val) => handleUpdate(node.id, 'satuanFrekuensi', val)}
                                disabled={node.children.length > 0}
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
                                disabled={node.children.length > 0}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-2 bg-muted/30 p-2 rounded border border-dashed text-right flex justify-between items-center px-4">
                        <div className="text-left">
                            <span className="text-xs font-medium text-muted-foreground block">Total Target Anggaran</span>
                            {node.children.length > 0 && <span className="text-[10px] text-blue-500 font-medium">(Otomatis dari sub-item)</span>}
                        </div>
                        <span className="font-mono font-bold text-lg">
                            Rp {parseFloat(node.totalTarget || "0").toLocaleString('id-ID')}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export const SortableItemCard = memo(SortableItemCardComponent);
