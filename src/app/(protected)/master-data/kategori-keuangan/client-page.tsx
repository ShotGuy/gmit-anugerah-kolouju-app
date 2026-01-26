"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Tag, Loader2, Search, MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createKategori, updateKategori, deleteKategori, KategoriKeuanganState } from "@/actions/keuangan/kategori";

interface Kategori {
    id: string;
    nama: string;
    kode: string;
    jenis: "PENERIMAAN" | "PENGELUARAN";
    isActive: boolean;
    _count?: {
        itemKeuangan: number;
    };
}

interface KategoriKeuanganClientProps {
    initialData: Kategori[];
}

const initialState: KategoriKeuanganState = {
    message: null,
    errors: {},
};

export default function KategoriKeuanganClient({
    initialData,
}: KategoriKeuanganClientProps) {
    const [data, setData] = useState<Kategori[]>(initialData);
    const [search, setSearch] = useState("");

    // UI States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Selection States
    const [editingItem, setEditingItem] = useState<Kategori | null>(null);

    // --- Create / Update Action Wrapper ---
    const submitAction = async (prevState: KategoriKeuanganState, formData: FormData): Promise<KategoriKeuanganState> => {
        if (editingItem) {
            return await updateKategori(editingItem.id, prevState, formData);
        } else {
            return await createKategori(prevState, formData);
        }
    };

    const [state, formAction, isPending] = useActionState(submitAction, initialState);

    const form = useForm({
        defaultValues: {
            nama: "",
            kode: "",
            jenis: "PENERIMAAN",
        },
    });

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            setIsDialogOpen(false);
            setEditingItem(null);
            form.reset({ nama: "", kode: "", jenis: "PENERIMAAN" });
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, form]);

    // Handle Edit
    const handleEdit = (item: Kategori) => {
        setEditingItem(item);
        form.reset({
            nama: item.nama,
            kode: item.kode,
            jenis: item.jenis as any || "PENERIMAAN",
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        form.reset({ nama: "", kode: "", jenis: "PENERIMAAN" });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string, nama: string) => {
        if (!confirm(`Hapus kategori "${nama}"?`)) return;

        setIsDeleting(id);
        const result = await deleteKategori(id);
        setIsDeleting(null);

        if (result.success) {
            toast.success(result.message);
            setData((prev) => prev.filter((item) => item.id !== id));
        } else {
            toast.error(result.message);
        }
    };

    const filteredData = data.filter(
        (item) =>
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.kode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kategori Keuangan</h1>
                    <p className="text-muted-foreground">
                        Kelola Master Data Kategori untuk Anggaran Gereja.
                    </p>
                </div>
                <Button onClick={handleCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Daftar Kategori
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:min-w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau kode..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Kode</TableHead>
                                        <TableHead>Nama Kategori</TableHead>
                                        <TableHead className="text-center">Penggunaan di Anggaran</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                Tidak ada data kategori.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <Badge variant="outline">{item.kode}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{item.nama}</div>
                                                    <div className="mt-1">
                                                        {item.jenis === "PENERIMAAN" ?
                                                            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200">Penerimaan</Badge> :
                                                            <Badge variant="destructive" className="text-[10px]">Pengeluaran</Badge>
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item._count?.itemKeuangan || 0} Item
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(item.id, item.nama)}
                                                                className="text-destructive focus:text-destructive"
                                                                disabled={isDeleting === item.id}
                                                            >
                                                                {isDeleting === item.id ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                )}
                                                                Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* MOBILE LIST VIEW */}
                        <div className="block md:hidden divide-y">
                            {filteredData.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">Tidak ada data.</div>
                            ) : (
                                filteredData.map((item) => (
                                    <div key={item.id} className="p-4 flex flex-col gap-3 bg-card">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono">{item.kode}</Badge>
                                                    <h3 className="font-semibold">{item.nama}</h3>
                                                </div>
                                                <div className="mb-1">
                                                    {item.jenis === "PENERIMAAN" ?
                                                        <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200">Penerimaan</Badge> :
                                                        <Badge variant="destructive" className="text-[10px]">Pengeluaran</Badge>
                                                    }
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />
                                                    {item._count?.itemKeuangan || 0} Item Anggaran
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(item.id, item.nama)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Ubah data kategori keuangan." : "Buat kategori keuangan baru untuk pengelompokan anggaran."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form action={formAction} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="jenis"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Jenis Anggaran</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-colors flex-1">
                                                    <input
                                                        type="radio"
                                                        {...field}
                                                        value="PENERIMAAN"
                                                        checked={field.value === "PENERIMAAN"}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="font-medium text-sm">Penerimaan (+Rp)</span>
                                                </label>
                                                <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer has-[:checked]:bg-red-50 has-[:checked]:border-red-500 transition-colors flex-1">
                                                    <input
                                                        type="radio"
                                                        {...field}
                                                        value="PENGELUARAN"
                                                        checked={field.value === "PENGELUARAN"}
                                                        className="h-4 w-4 text-red-600"
                                                    />
                                                    <span className="font-medium text-sm">Pengeluaran (-Rp)</span>
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="kode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Kategori</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: A, B, C" {...field} maxLength={10} name="kode" />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">
                                            Kode unik, maksimal 10 karakter.
                                        </p>
                                        <FormMessage>{state.errors?.kode}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nama"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Kategori</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: PENERIMAAN RUTIN" {...field} name="nama" />
                                        </FormControl>
                                        <FormMessage>{state.errors?.nama}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
