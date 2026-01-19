"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Wallet } from "lucide-react";
import { createAkunKas, updateAkunKas, deleteAkunKas, getAkunKasList } from "@/actions/keuangan/akun-kas";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AkunKasPage() {
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const res = await getAkunKasList();
        if (res.success && res.data) {
            setData(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = data.filter(item =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        let res;
        if (editingItem) {
            res = await updateAkunKas(editingItem.id, {} as any, formData);
        } else {
            res = await createAkunKas({} as any, formData);
        }

        if (res.success) {
            toast.success(res.message);
            setIsOpen(false);
            setEditingItem(null);
            loadData();
        } else {
            // Handle errors (simple toast for now)
            toast.error(res.message || "Terjadi kesalahan");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus akun kas ini?")) return;
        const res = await deleteAkunKas(id);
        if (res.success) {
            toast.success(res.message);
            loadData();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
            <PageHeader
                title="Master Akun Kas"
                description="Kelola dompet dan akun kas gereja"
                breadcrumb={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Master Data", href: "/master-data" },
                    { label: "Akun Kas" },
                ]}
            />

            <Card className="mt-6">
                <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari akun kas..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Akun
                    </Button>
                </div>
                <CardContent className="p-0">
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Akun</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Saldo Saat Ini</TableHead>
                                    <TableHead className="text-center">Default</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Memuat...</TableCell>
                                    </TableRow>
                                ) : filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada akun kas</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                                    <Wallet className="h-4 w-4" />
                                                </div>
                                                {item.nama}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{item.deskripsi || "-"}</TableCell>
                                            <TableCell className="font-mono font-medium">
                                                {formatCurrency(item.saldoSaatIni)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.isDefault && <Badge variant="secondary">Default</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsOpen(true); }}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* MOBILE LIST VIEW */}
                    <div className="block md:hidden divide-y">
                        {isLoading ? (
                            <div className="text-center p-8 text-muted-foreground">Memuat...</div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">Belum ada akun kas.</div>
                        ) : (
                            filteredData.map((item) => (
                                <div key={item.id} className="p-4 flex flex-col gap-4 bg-card">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
                                                <Wallet className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-base">{item.nama}</h3>
                                                    {item.isDefault && <Badge variant="secondary" className="text-[10px] px-1.5 h-5">Default</Badge>}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{item.deskripsi || "Tanpa deskripsi"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-dashed">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saldo Saat Ini</span>
                                        <span className="font-bold text-lg font-mono text-blue-700">{formatCurrency(item.saldoSaatIni)}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => { setEditingItem(item); setIsOpen(true); }}>
                                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingItem(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Akun Kas" : "Tambah Akun Kas"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Perbarui informasi akun kas." : "Buat dompet baru untuk pemisahan dana."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Akun</Label>
                            <Input id="nama" name="nama" defaultValue={editingItem?.nama} required placeholder="Contoh: Kas Umum" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <Textarea id="deskripsi" name="deskripsi" defaultValue={editingItem?.deskripsi} placeholder="Keterangan peruntukan dana..." />
                        </div>

                        {!editingItem && (
                            <div className="space-y-2">
                                <Label htmlFor="saldoAwal">Saldo Awal (Opsional)</Label>
                                <Input id="saldoAwal" name="saldoAwal" type="number" placeholder="0" />
                                <p className="text-xs text-muted-foreground">Hanya untuk inisialisasi awal. Perubahan saldo selanjutnya melalui transaksi realisasi.</p>
                            </div>
                        )}

                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <Switch id="isDefault" name="isDefault" defaultChecked={editingItem?.isDefault} />
                            <Label htmlFor="isDefault">Jadikan Akun Utama (Default)</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit">{editingItem ? "Simpan Perubahan" : "Buat Akun"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
