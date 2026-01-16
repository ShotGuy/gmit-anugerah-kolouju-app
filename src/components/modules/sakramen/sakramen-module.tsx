"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataFilter, FilterConfig } from "@/components/ui/data-filter";
import { Combobox } from "@/components/ui/combobox";

type BaptisRecord = {
  idBaptis: string;
  tanggal: string;
  idJemaat: string;
  idKlasis: string;
  jemaat?: { idJemaat: string; nama: string };
};

type SidiRecord = {
  idSidi: string;
  tanggal: string;
  idJemaat: string;
  idKlasis: string;
  jemaat?: { idJemaat: string; nama: string };
};

type PernikahanRecord = {
  idPernikahan: string;
  klasis: string;
  tanggal: string;
  jemaats: Array<{ idJemaat: string; nama: string }>;
};

type Props = {
  data: any[];
  metadata?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  masters: {
    jemaat: Array<{ idJemaat: string; nama: string; jenisKelamin: boolean }>;
    klasis: Array<{ idKlasis: string; nama: string }>;
    rayon: Array<{ idRayon: string; namaRayon: string }>;
  };
  activeTab: "baptis" | "sidi" | "pernikahan";
  onTabChange: (val: string) => void;
  isLoading?: boolean;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const baptisSchema = z.object({
  idJemaat: z.string().min(1, "Jemaat harus dipilih"),
  idKlasis: z.string().min(1, "Klasis harus dipilih"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
});

const sidiSchema = baptisSchema;

const pernikahanSchema = z.object({
  klasis: z.string().min(1, "Klasis harus dipilih"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  jemaatIds: z.array(z.string()).length(2, "Harus memilih 2 jemaat"),
});

type BaptisValues = z.infer<typeof baptisSchema>;
type PernikahanValues = z.infer<typeof pernikahanSchema>;

export default function SakramenModule({
  data,
  metadata,
  masters,
  activeTab,
  onTabChange,
  isLoading,
  filters,
  onFilterChange,
  onResetFilters,
  page,
  limit,
  onPageChange,
  onLimitChange
}: Props) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== (filters.search || "")) {
        onFilterChange("search", searchQuery);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, filters.search, onFilterChange]);

  const [openBaptis, setOpenBaptis] = useState(false);
  const [openSidi, setOpenSidi] = useState(false);
  const [openPernikahan, setOpenPernikahan] = useState(false);

  const [editingBaptisId, setEditingBaptisId] = useState<string | null>(null);
  const [editingSidiId, setEditingSidiId] = useState<string | null>(null);
  const [editingPernikahanId, setEditingPernikahanId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "baptis" | "sidi" | "pernikahan" } | null>(null);

  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      key: "idKlasis",
      label: "Klasis",
      options: masters.klasis.map((k) => ({ label: k.nama, value: k.idKlasis })),
    },
    {
      key: "jenisKelamin",
      label: "Jenis Kelamin",
      options: [
        { label: "Laki-laki", value: "L" },
        { label: "Perempuan", value: "P" },
      ],
    },
    {
      key: "rayon",
      label: "Rayon",
      options: masters.rayon.map((r) => ({ label: r.namaRayon, value: r.idRayon })),
    },
    {
      key: "tahun",
      label: "Tahun",
      options: Array.from({ length: 10 }, (_, i) => {
        const y = new Date().getFullYear() - i + 1;
        return { label: String(y), value: String(y) };
      }),
    },
    {
      key: "kategoriUsia",
      label: "Usia",
      options: [
        { label: "Anak (<13)", value: "anak" },
        { label: "Remaja (13-17)", value: "remaja" },
        { label: "Pemuda (18-35)", value: "pemuda" },
        { label: "Dewasa (36-60)", value: "dewasa" },
        { label: "Lansia (>60)", value: "lansia" },
      ],
    },
  ], [masters]);

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["sakramen"] });
  };

  const baptisForm = useForm<BaptisValues>({
    resolver: zodResolver(baptisSchema),
    defaultValues: { idJemaat: "", idKlasis: "", tanggal: "" },
  });
  const sidiForm = useForm<BaptisValues>({
    resolver: zodResolver(sidiSchema),
    defaultValues: { idJemaat: "", idKlasis: "", tanggal: "" },
  });
  const pernikahanForm = useForm<PernikahanValues>({
    resolver: zodResolver(pernikahanSchema),
    defaultValues: { klasis: "", tanggal: "", jemaatIds: [] },
  });

  const createBaptis = async (values: BaptisValues) => {
    try {
      if (editingBaptisId) {
        const res = await fetch(`/api/baptis/${editingBaptisId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Gagal memperbarui");
        toast.success("Data baptis diperbarui");
      } else {
        const res = await fetch("/api/baptis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Gagal menyimpan");
        toast.success("Data baptis tersimpan");
      }
      invalidateData();
      setEditingBaptisId(null);
      baptisForm.reset();
      setOpenBaptis(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleDeleteBaptis = async (id: string) => {
    try {
      const res = await fetch(`/api/baptis/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Data baptis dihapus");
      invalidateData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "baptis") await handleDeleteBaptis(deleteTarget.id);
    else if (deleteTarget.type === "sidi") await handleDeleteSidi(deleteTarget.id);
    else if (deleteTarget.type === "pernikahan") await handleDeletePernikahan(deleteTarget.id);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const openDeleteDialog = (id: string, type: "baptis" | "sidi" | "pernikahan") => {
    setDeleteTarget({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleEditBaptis = (item: BaptisRecord) => {
    setEditingBaptisId(item.idBaptis);
    baptisForm.reset({
      idJemaat: item.idJemaat,
      idKlasis: item.idKlasis,
      tanggal: new Date(item.tanggal).toISOString().split("T")[0],
    });
    setOpenBaptis(true);
  };

  const createSidi = async (values: BaptisValues) => {
    try {
      if (editingSidiId) {
        const res = await fetch(`/api/sidi/${editingSidiId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Gagal memperbarui");
        toast.success("Data sidi diperbarui");
      } else {
        const res = await fetch("/api/sidi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Gagal menyimpan");
        toast.success("Data sidi tersimpan");
      }
      invalidateData();
      setEditingSidiId(null);
      sidiForm.reset();
      setOpenSidi(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleDeleteSidi = async (id: string) => {
    try {
      const res = await fetch(`/api/sidi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Data sidi dihapus");
      invalidateData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleEditSidi = (item: SidiRecord) => {
    setEditingSidiId(item.idSidi);
    sidiForm.reset({
      idJemaat: item.idJemaat,
      idKlasis: item.idKlasis,
      tanggal: new Date(item.tanggal).toISOString().split("T")[0],
    });
    setOpenSidi(true);
  };

  const createPernikahan = async (values: PernikahanValues) => {
    const [id1, id2] = values.jemaatIds;
    const jemaat1 = masters.jemaat.find((j) => j.idJemaat === id1);
    const jemaat2 = masters.jemaat.find((j) => j.idJemaat === id2);
    const gender1 = jemaat1?.jenisKelamin === true || String(jemaat1?.jenisKelamin) === "true";
    const gender2 = jemaat2?.jenisKelamin === true || String(jemaat2?.jenisKelamin) === "true";
    if (jemaat1 && jemaat2 && gender1 === gender2) {
      toast.error("Pasangan tidak boleh berjenis kelamin sama");
      return;
    }
    try {
      if (editingPernikahanId) {
        const res = await fetch(`/api/pernikahan/${editingPernikahanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Gagal memperbarui");
        toast.success("Data pernikahan diperbarui");
      } else {
        const res = await fetch("/api/pernikahan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Gagal menyimpan");
        toast.success("Data pernikahan tersimpan");
      }
      invalidateData();
      setEditingPernikahanId(null);
      pernikahanForm.reset();
      setOpenPernikahan(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleDeletePernikahan = async (id: string) => {
    try {
      const res = await fetch(`/api/pernikahan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Data pernikahan dihapus");
      invalidateData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleEditPernikahan = (item: PernikahanRecord) => {
    setEditingPernikahanId(item.idPernikahan);
    pernikahanForm.reset({
      klasis: item.klasis,
      tanggal: new Date(item.tanggal).toISOString().split("T")[0],
      jemaatIds: item.jemaats.map(j => j.idJemaat),
    });
    setOpenPernikahan(true);
  };

  const PaginationControls = () => {
    // Show pagination if metadata exists, even if totalPages <= 1, so user can see Total Count and Limit
    if (!metadata) return null;
    return (
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground w-full">
        <div>
          Halaman {metadata.page} dari {Math.max(1, metadata.totalPages)} ({metadata.total} data)
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(val) => onLimitChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= metadata.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Sakramen</h2>
      <p className="text-sm text-muted-foreground">
        Catatan baptis, sidi, dan pernikahan jemaat.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama jemaat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DataFilter
          filters={filterConfig}
          values={filters}
          onFilterChange={onFilterChange}
          onReset={() => {
            setSearchQuery("");
            onResetFilters();
          }}
        />
      </div>

      <div className="mt-6">
        {activeTab === "baptis" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={openBaptis} onOpenChange={setOpenBaptis}>
                <DialogTrigger asChild>
                  <Button>Tambah Data Baptis</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingBaptisId ? "Edit Data Baptis" : "Tambah Data Baptis"}</DialogTitle>
                  </DialogHeader>
                  <Form {...baptisForm}>
                    <form className="grid gap-4 py-4" onSubmit={baptisForm.handleSubmit(createBaptis)}>
                      <FormField control={baptisForm.control} name="idJemaat" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jemaat <span className="text-red-500">*</span></FormLabel>
                          <Combobox
                            value={field.value}
                            onChange={field.onChange}
                            options={masters.jemaat.map((item) => ({ label: `${item.nama} (${item.jenisKelamin ? "L" : "P"})`, value: item.idJemaat }))}
                            placeholder="Pilih Jemaat" modal
                          />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={baptisForm.control} name="idKlasis" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Klasis <span className="text-red-500">*</span></FormLabel>
                          <Combobox
                            value={field.value}
                            onChange={field.onChange}
                            options={masters.klasis.map((item) => ({ label: item.nama, value: item.idKlasis }))}
                            placeholder="Pilih Klasis" modal
                          />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={baptisForm.control} name="tanggal" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <DialogFooter><Button type="submit">Simpan Baptis</Button></DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardHeader><CardTitle>Riwayat Baptis</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? <div className="text-center py-4">Loading...</div> : data.map((item: BaptisRecord) => (
                  <div key={item.idBaptis} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.jemaat?.nama ?? "-"}</p>
                      <p className="text-sm text-muted-foreground">{new Date(item.tanggal).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEditBaptis(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => openDeleteDialog(item.idBaptis, "baptis")}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {!isLoading && data.length === 0 && <div className="text-center py-4 text-muted-foreground">Tidak ada data</div>}
              </CardContent>
              <CardFooter>
                <PaginationControls />
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "sidi" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={openSidi} onOpenChange={setOpenSidi}>
                <DialogTrigger asChild><Button>Tambah Data Sidi</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader><DialogTitle>{editingSidiId ? "Edit Data Sidi" : "Tambah Data Sidi"}</DialogTitle></DialogHeader>
                  <Form {...sidiForm}>
                    <form className="grid gap-4 py-4" onSubmit={sidiForm.handleSubmit(createSidi)}>
                      <FormField control={sidiForm.control} name="idJemaat" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jemaat <span className="text-red-500">*</span></FormLabel>
                          <Combobox value={field.value} onChange={field.onChange} options={masters.jemaat.map((item) => ({ label: `${item.nama} (${item.jenisKelamin ? "L" : "P"})`, value: item.idJemaat }))} placeholder="Pilih Jemaat" modal />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={sidiForm.control} name="idKlasis" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Klasis <span className="text-red-500">*</span></FormLabel>
                          <Combobox value={field.value} onChange={field.onChange} options={masters.klasis.map((item) => ({ label: item.nama, value: item.idKlasis }))} placeholder="Pilih Klasis" modal />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={sidiForm.control} name="tanggal" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <DialogFooter><Button type="submit">Simpan Sidi</Button></DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardHeader><CardTitle>Riwayat Sidi</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? <div className="text-center py-4">Loading...</div> : data.map((item: SidiRecord) => (
                  <div key={item.idSidi} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.jemaat?.nama ?? "-"}</p>
                      <p className="text-sm text-muted-foreground">{new Date(item.tanggal).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEditSidi(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => openDeleteDialog(item.idSidi, "sidi")}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {!isLoading && data.length === 0 && <div className="text-center py-4 text-muted-foreground">Tidak ada data</div>}
              </CardContent>
              <CardFooter>
                <PaginationControls />
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "pernikahan" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={openPernikahan} onOpenChange={setOpenPernikahan}>
                <DialogTrigger asChild><Button>Tambah Data Pernikahan</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader><DialogTitle>{editingPernikahanId ? "Edit Data Pernikahan" : "Tambah Data Pernikahan"}</DialogTitle></DialogHeader>
                  <Form {...pernikahanForm}>
                    <form className="grid gap-4 py-4" onSubmit={pernikahanForm.handleSubmit(createPernikahan)}>
                      <FormField control={pernikahanForm.control} name="klasis" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Klasis <span className="text-red-500">*</span></FormLabel>
                          <Combobox value={field.value} onChange={field.onChange} options={masters.klasis.map((item) => ({ label: item.nama, value: item.nama }))} placeholder="Pilih Klasis" modal />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={pernikahanForm.control} name="tanggal" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={pernikahanForm.control} name="jemaatIds" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pasangan 1 <span className="text-red-500">*</span></FormLabel>
                          <Combobox value={field.value?.[0]} onChange={(val) => { const n = [...(field.value || [])]; n[0] = val || ""; field.onChange(n); }} options={masters.jemaat.map((item) => ({ label: `${item.nama} (${item.jenisKelamin ? "L" : "P"})`, value: item.idJemaat }))} placeholder="Pilih Jemaat 1" modal />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={pernikahanForm.control} name="jemaatIds" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pasangan 2 <span className="text-red-500">*</span></FormLabel>
                          <Combobox value={field.value?.[1]} onChange={(val) => { const n = [...(field.value || [])]; n[1] = val || ""; field.onChange(n); }} options={masters.jemaat.map((item) => ({ label: `${item.nama} (${item.jenisKelamin ? "L" : "P"})`, value: item.idJemaat }))} placeholder="Pilih Jemaat 2" modal />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <DialogFooter><Button type="submit">Simpan Pernikahan</Button></DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardHeader><CardTitle>Riwayat Pernikahan</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? <div className="text-center py-4">Loading...</div> : data.map((item: PernikahanRecord) => (
                  <div key={item.idPernikahan} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.jemaats.map(j => j.nama).join(" & ")}</p>
                      <p className="text-sm text-muted-foreground">{new Date(item.tanggal).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEditPernikahan(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => openDeleteDialog(item.idPernikahan, "pernikahan")}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {!isLoading && data.length === 0 && <div className="text-center py-4 text-muted-foreground">Tidak ada data</div>}
              </CardContent>
              <CardFooter>
                <PaginationControls />
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
