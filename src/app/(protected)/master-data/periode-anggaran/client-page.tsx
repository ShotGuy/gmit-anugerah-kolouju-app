"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Calendar as CalendarIcon, Loader2, Search, CheckCircle, XCircle, MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react";

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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPeriode, updatePeriode, deletePeriode, PeriodeState } from "@/actions/keuangan/periode";
import { Textarea } from "@/components/ui/textarea";

interface Periode {
    id: string;
    nama: string;
    tahun: number;
    tanggalMulai: Date;
    tanggalAkhir: Date;
    status: string;
    keterangan: string | null;
    isActive: boolean;
    _count?: {
        itemKeuangan: number;
        realisasiItemKeuangan?: number;
    };
}

interface PeriodeAnggaranClientProps {
    initialData: Periode[];
}

const initialState: PeriodeState = {
    message: null,
    errors: {},
};

export default function PeriodeAnggaranClient({
    initialData,
}: PeriodeAnggaranClientProps) {
    const [data, setData] = useState<Periode[]>(initialData);
    const [search, setSearch] = useState("");

    // UI States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selection States
    const [editingItem, setEditingItem] = useState<Periode | null>(null);
    const [deletingItem, setDeletingItem] = useState<Periode | null>(null);

    // --- Create / Update Action ---
    // We wrap the action to handle both create and update based on `editingItem`
    const submitAction = async (prevState: PeriodeState, formData: FormData): Promise<PeriodeState> => {
        if (editingItem) {
            return await updatePeriode(editingItem.id, prevState, formData);
        } else {
            return await createPeriode(prevState, formData);
        }
    };

    const [state, formAction, isPending] = useActionState(submitAction, initialState);

    const form = useForm({
        defaultValues: {
            nama: "",
            tahun: new Date().getFullYear(),
            tanggalMulai: "",
            tanggalAkhir: "",
            keterangan: "",
        },
    });

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Handle Server Action Response
    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            setIsDialogOpen(false);
            setEditingItem(null);
            form.reset({
                nama: "",
                tahun: new Date().getFullYear(),
                tanggalMulai: "",
                tanggalAkhir: "",
                keterangan: ""
            });
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, form]);

    // Handle Edit Click
    const handleEdit = (item: Periode) => {
        setEditingItem(item);
        form.reset({
            nama: item.nama,
            tahun: item.tahun,
            // Format Date for Input Date (YYYY-MM-DD)
            tanggalMulai: new Date(item.tanggalMulai).toISOString().split('T')[0],
            tanggalAkhir: new Date(item.tanggalAkhir).toISOString().split('T')[0],
            keterangan: item.keterangan || "",
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        form.reset({
            nama: "",
            tahun: new Date().getFullYear(),
            tanggalMulai: "",
            tanggalAkhir: "",
            keterangan: ""
        });
        setIsDialogOpen(true);
    };

    // Handle Delete
    const verifyDelete = (item: Periode) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;

        try {
            const res = await deletePeriode(deletingItem.id);
            if (res.success) {
                toast.success(res.message);
                setIsDeleteDialogOpen(false);
                setDeletingItem(null);
            } else {
                toast.error(res.message);
                // Keep dialog open if failed? Or close. 
                // Close is better UX if error is "cannot delete" (user can't fix it right now anyway).
                // Actually keep open so they see context but maybe not necessary.
                setIsDeleteDialogOpen(false);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat menghapus");
        }
    };


    const filteredData = data.filter(
        (item) =>
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.tahun.toString().includes(search)
    );

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Periode Anggaran</h1>
                    <p className="text-muted-foreground">
                        Atur Tahun Anggaran dan periode waktu pelaksanaan keuangan.
                    </p>
                </div>
                <Button onClick={handleCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Buat Periode Baru
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Daftar Periode
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:min-w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari periode..."
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
                                    <TableHead>Nama Periode</TableHead>
                                    <TableHead>Tahun</TableHead>
                                    <TableHead>Rentang Waktu</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Statistik</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Tidak ada data periode.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div>{item.nama}</div>
                                                {item.keterangan && (
                                                    <div className="text-xs text-muted-foreground">{item.keterangan}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.tahun}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatDate(item.tanggalMulai)} - {formatDate(item.tanggalAkhir)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={item.status === 'ACTIVE' ? "default" : "secondary"}
                                                    className={item.status === 'ACTIVE' ? "bg-green-500 hover:bg-green-600" : ""}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{item._count?.itemKeuangan || 0} Item Anggaran</Badge>
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
                                                            onClick={() => verifyDelete(item)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
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
                </CardContent>
            </Card>

            {/* CREATE / EDIT DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Periode" : "Buat Periode Baru"}</DialogTitle>
                        <DialogDescription>
                            {editingItem
                                ? "Ubah informasi periode anggaran yang sudah ada."
                                : "Tentukan periode baru untuk pencatatan keuangan."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form action={formAction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Nama Periode</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: TA 2026, Triwulan 1 2026" {...field} name="nama" />
                                            </FormControl>
                                            <FormMessage>{state.errors?.nama}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tahun"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tahun</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} name="tahun" />
                                            </FormControl>
                                            <FormMessage>{state.errors?.tahun}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tanggalMulai"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Mulai</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} name="tanggalMulai" />
                                            </FormControl>
                                            <FormMessage>{state.errors?.tanggalMulai}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tanggalAkhir"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Akhir</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} name="tanggalAkhir" />
                                            </FormControl>
                                            <FormMessage>{state.errors?.tanggalAkhir}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="keterangan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keterangan (Opsional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Catatan tambahan..." {...field} name="keterangan" />
                                        </FormControl>
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

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Hapus Periode?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus periode <strong>{deletingItem?.nama}</strong>?
                            <br /><br />
                            Tindakan ini tidak dapat dibatalkan. Sistem akan memverifikasi bahwa periode ini tidak memiliki data terkait sebelum menghapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault(); // Prevent auto close to handle async
                                confirmDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
