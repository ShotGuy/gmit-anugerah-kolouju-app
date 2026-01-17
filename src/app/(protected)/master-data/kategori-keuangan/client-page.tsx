"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Tag, Loader2, Search } from "lucide-react";

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
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { createKategori, deleteKategori, KategoriKeuanganState } from "@/actions/keuangan/kategori";

interface Kategori {
    id: string;
    nama: string;
    kode: string;
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Server Action Hook
    const [state, formAction, isPending] = useActionState(createKategori, initialState);

    const form = useForm({
        defaultValues: {
            nama: "",
            kode: "",
        },
    });

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            setIsDialogOpen(false);
            form.reset();
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, form]);

    const handleDelete = async (id: string, nama: string) => {
        if (!confirm(`Hapus kategori "${nama}"?`)) return;

        setIsDeleting(id);
        const result = await deleteKategori(id);
        setIsDeleting(null);

        if (result.success) {
            toast.success(result.message);
            // Optimistic update handled by Next.js revalidatePath but we can also filter locally
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
                <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Kategori</TableHead>
                                    <TableHead className="text-center">Penggunaan di Anggaran</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
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
                                            <TableCell>{item.nama}</TableCell>
                                            <TableCell className="text-center">
                                                {item._count?.itemKeuangan || 0} Item
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(item.id, item.nama)}
                                                    disabled={isDeleting === item.id}
                                                >
                                                    {isDeleting === item.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        <DialogDescription>
                            Buat kategori keuangan baru untuk pengelompokan anggaran.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form action={formAction} className="space-y-4">
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
