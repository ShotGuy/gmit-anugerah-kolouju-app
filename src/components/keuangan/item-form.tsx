"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { createItemKeuangan, updateItemKeuangan } from "@/actions/keuangan/item";

interface ItemFormProps {
    initialData?: any;
    mode: "create" | "edit";
    parent?: any;
    kategoris: any[];
    periodeId: string;
    // Optional callbacks
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ItemForm({
    initialData,
    mode,
    parent,
    kategoris,
    periodeId,
    onSuccess,
    onCancel,
}: ItemFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // Form Setup
    const form = useForm({
        defaultValues: {
            nama: initialData?.nama || "",
            deskripsi: initialData?.deskripsi || "",
            kategoriId: initialData?.kategoriId || (parent ? parent.kategoriId : (kategoris.length > 0 ? kategoris[0].id : "")),
            kode: initialData?.kode || "",
            targetFrekuensi: initialData?.targetFrekuensi?.toString() || "1",
            satuanFrekuensi: initialData?.satuanFrekuensi || "Bulan",
            nominalSatuan: initialData?.nominalSatuan?.toString() || "",
        },
    });

    const onSubmit = async (data: any) => {
        setIsPending(true);
        try {
            const formData = new FormData();
            formData.append("periodeId", periodeId);
            formData.append("nama", data.nama);
            formData.append("deskripsi", data.deskripsi);
            formData.append("kategoriId", data.kategoriId);
            if (data.kode) formData.append("kode", data.kode);

            // If Create Mode and has parent, append parentId
            if (mode === "create" && parent) {
                formData.append("parentId", parent.id);
            }

            formData.append("targetFrekuensi", data.targetFrekuensi);
            formData.append("satuanFrekuensi", data.satuanFrekuensi);
            formData.append("nominalSatuan", data.nominalSatuan);

            let res;
            if (mode === "edit" && initialData) {
                res = await updateItemKeuangan(initialData.id, { message: null, errors: {} }, formData);
            } else {
                res = await createItemKeuangan({ message: null, errors: {} }, formData);
            }

            if (res.success) {
                toast.success(res.message);
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/keuangan"); // Default redirect
                    router.refresh();
                }
            } else {
                if (res.errors) {
                    Object.entries(res.errors).forEach(([key, msgs]) => {
                        // @ts-ignore
                        if (Array.isArray(msgs)) toast.error(`${key}: ${msgs[0]}`);
                    });
                }
                if (res.message) toast.error(res.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto shadow-sm">
            <CardHeader>
                <CardTitle>{mode === "create" ? (parent ? "Tambah Sub-Item" : "Tambah Item Utama") : "Edit Item Anggaran"}</CardTitle>
                <CardDescription>
                    {mode === "create"
                        ? parent
                            ? `Menambahkan item di bawah "${parent.nama}" (${parent.kode})`
                            : "Menambahkan item level teratas (Root). Item root biasanya mewakili kategori besar."
                        : `Mengubah data item "${initialData?.nama}"`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Basic Info Group */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Informasi Dasar</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    {parent || mode === 'edit' ? (
                                        <div className="px-3 py-2 border rounded-md bg-muted text-sm text-muted-foreground">
                                            {kategoris.find(k => k.id === (parent ? parent.kategoriId : form.getValues("kategoriId")))?.nama || "Unknown"}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                                {...form.register("kategoriId")}
                                            >
                                                {kategoris.map(k => (
                                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="kode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kode Manual (Opsional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Auto (Kosongkan)" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="nama"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Item Anggaran</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Persembahan Syukur" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="deskripsi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deskripsi / Keterangan</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Keterangan tambahan..." className="resize-none h-20" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Budget Target Group */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Target & Estimasi</h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="targetFrekuensi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Frekuensi</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <FormField
                                        control={form.control}
                                        name="satuanFrekuensi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Satuan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Bulan/Kali" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <FormField
                                        control={form.control}
                                        name="nominalSatuan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nominal / Satuan (Rp)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Total Target Estimasi:</span>
                            <span className="font-bold text-xl text-primary">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                                    (parseInt(form.watch("targetFrekuensi") || "0") || 0) * (parseFloat(form.watch("nominalSatuan") || "0") || 0)
                                )}
                            </span>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onCancel || (() => router.back())}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Data
                            </Button>
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
