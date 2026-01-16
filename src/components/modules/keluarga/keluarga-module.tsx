"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, Eye, Pencil, Trash2, MoreHorizontal, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataFilter, FilterConfig } from "@/components/ui/data-filter";
import { Combobox } from "@/components/ui/combobox";
import { AsyncKelurahanSelect } from "@/components/modules/jemaat/async-kelurahan-select";
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

type Keluarga = {
  idKeluarga: string;
  noKK?: string | null;
  idRayon: string;
  idStatusKepemilikan: string;
  idStatusTanah: string;
  fotoKartuKeluarga?: string | null;
  alamat: {
    idKelurahan: string;
    jalan: string;
    RT: number;
    RW: number;
  };
  rayon?: { namaRayon: string };
  statusKepemilikan?: { status: string };
  jemaat?: Array<{
    idJemaat: string;
    nama: string;
    status?: { status: string };
  }>;
};

type Masters = {
  statusKepemilikan: Array<{ idStatusKepemilikan: string; status: string }>;
  statusTanah: Array<{ idStatusTanah: string; status: string }>;
  rayon: Array<{ idRayon: string; namaRayon: string }>;
  kelurahan: Array<{ idKelurahan: string; nama: string }>;
};

import { PaginationControls } from "@/components/ui/pagination-controls";

type Props = {
  data: Keluarga[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  masters: Masters;
  isLoading?: boolean;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDataChange: () => void;
};

const schema = z.object({
  noKK: z.string().length(16).regex(/^\d+$/, "Harus 16 digit angka"),
  idStatusKepemilikan: z.string(),
  idStatusTanah: z.string(),
  idRayon: z.string(),
  idKelurahan: z.string(),
  jalan: z.string().min(3),
  RT: z.coerce.number().int().min(0),
  RW: z.coerce.number().int().min(0),
});

type FormValues = z.infer<typeof schema> & { fotoKartuKeluarga?: FileList };

export default function KeluargaModule({
  data,
  metadata,
  masters,
  isLoading,
  filters,
  onFilterChange,
  onResetFilters,
  onPageChange,
  onLimitChange,
  searchQuery,
  onSearchChange,
  onDataChange,
}: Props) {
  // Use passed data directly, no local filtering
  const items = data;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [initialKelurahanName, setInitialKelurahanName] = useState("");
  const router = useRouter();

  const filterConfig: FilterConfig[] = useMemo<FilterConfig[]>(() => [
    {
      key: "idRayon",
      label: "Rayon",
      options: masters.rayon.map((r) => ({ label: r.namaRayon, value: r.idRayon })),
    },
  ], [masters]);

  // Handle file preview removal later if needed
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });

  const handleSubmit = async (values: FormValues) => {
    // Optimization: Dirty Checking
    if (editingId && !form.formState.isDirty) {
      toast.info("Tidak ada perubahan data");
      setOpen(false);
      return;
    }

    try {
      const payload = {
        noKK: values.noKK,
        idStatusKepemilikan: values.idStatusKepemilikan,
        idStatusTanah: values.idStatusTanah,
        idRayon: values.idRayon,
        alamat: {
          idKelurahan: values.idKelurahan,
          jalan: values.jalan,
          RT: values.RT,
          RW: values.RW,
        },
      };

      // Use FormData if file is present or always to support backend change
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      // Check for file in values (FileList)
      if (values.fotoKartuKeluarga && values.fotoKartuKeluarga.length > 0) {
        formData.append("fotoKartuKeluarga", values.fotoKartuKeluarga[0]);
      } else if (selectedFile) {
        // Fallback if state used
        formData.append("fotoKartuKeluarga", selectedFile);
      }


      if (editingId) {
        const res = await fetch(`/api/keluarga/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          body: formData, // Send FormData instead of JSON
        });

        const data = await res.json();
        if (!res.ok) {
          if (data?.errors) {
            Object.entries(data.errors).forEach(([key, msg]) => {
              form.setError(key as any, { type: "server", message: msg as string });
            });
          }
          throw new Error(data?.message ?? "Gagal memperbarui keluarga");
        }
        // setItems((prev) => prev.map((it) => (it.idKeluarga === editingId ? data.data : it))); // CANNOT DO THIS ANYMORE
        onResetFilters(); // Trigger refetch by resetting or we need explicit refetch. 
        // Better: onDataChange()
        // For now, let's just use onResetFilters() or similar to trigger state change? No.
        // Let's rely on router.refresh() if using server, but we use useQuery.
        // I'll add onDataChange prop.
        onDataChange();
        setEditingId(null);
        setOpen(false);
        form.reset();
        toast.success("Keluarga berhasil diperbarui");
      } else {
        const res = await fetch("/api/keluarga", {
          method: "POST",
          body: formData, // Send FormData instead of JSON
        });

        const data = await res.json();

        if (!res.ok) {
          if (data?.errors) {
            Object.entries(data.errors).forEach(([key, msg]) => {
              form.setError(key as any, { type: "server", message: msg as string });
            });
          }
          throw new Error(data?.message ?? "Gagal menyimpan keluarga");
        }

        // setItems((prev) => [data.data, ...prev]); // CANNOT DO THIS
        onDataChange();
        setOpen(false);
        form.reset();
        toast.success("Keluarga berhasil ditambahkan");
      }
      setSelectedFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleEdit = (item: Keluarga) => {
    setEditingId(item.idKeluarga);

    // Find Kelurahan name for AsyncSelect initial label
    const kelName = masters.kelurahan.find(k => k.idKelurahan === item.alamat.idKelurahan)?.nama || "";
    setInitialKelurahanName(kelName);

    form.reset({
      noKK: item.noKK ?? "",
      idStatusKepemilikan: item.idStatusKepemilikan,
      idStatusTanah: item.idStatusTanah,
      idRayon: item.idRayon,
      idKelurahan: item.alamat.idKelurahan,
      jalan: item.alamat.jalan,
      RT: item.alamat.RT,
      RW: item.alamat.RW,
    });
    setSelectedFile(null); // Reset file selection
    setOpen(true);
  };

  const handleDetail = (item: Keluarga) => {
    router.push(`/keluarga/${encodeURIComponent(item.idKeluarga)}`);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/keluarga/${encodeURIComponent(deleteTarget)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Gagal menghapus keluarga");
      // setItems((prev) => prev.filter((it) => it.idKeluarga !== deleteTarget)); // CANNOT DO THIS
      onDataChange();
      toast.success("Keluarga berhasil dihapus");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Data Keluarga</h2>
          <p className="text-sm text-muted-foreground">
            Daftar kepala keluarga beserta rayon.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Keluarga</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Keluarga Baru</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name="noKK"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Kartu Keluarga <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} disabled={!!editingId} maxLength={16} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="idRayon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rayon <span className="text-red-500">*</span></FormLabel>
                        <Combobox
                          value={field.value}
                          onChange={field.onChange}
                          options={masters.rayon.map((item) => ({
                            label: item.namaRayon,
                            value: item.idRayon,
                          }))}
                          placeholder="Pilih Rayon"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idStatusKepemilikan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Kepemilikan <span className="text-red-500">*</span></FormLabel>
                        <Combobox
                          value={field.value}
                          onChange={field.onChange}
                          options={masters.statusKepemilikan.map((item) => ({
                            label: item.status,
                            value: item.idStatusKepemilikan,
                          }))}
                          placeholder="Pilih Status"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idStatusTanah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Tanah <span className="text-red-500">*</span></FormLabel>
                        <Combobox
                          value={field.value}
                          onChange={field.onChange}
                          options={masters.statusTanah.map((item) => ({
                            label: item.status,
                            value: item.idStatusTanah,
                          }))}
                          placeholder="Pilih Status Tanah"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="RT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RT <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="RW"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RW <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="idKelurahan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelurahan <span className="text-red-500">*</span></FormLabel>
                        <AsyncKelurahanSelect
                          value={field.value}
                          onChange={field.onChange}
                          initialLabel={initialKelurahanName}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jalan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jalan <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* File Upload Field */}
                <div className="space-y-2">
                  <FormLabel>Foto Kartu Keluarga (PDF/JPG/PNG)</FormLabel>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        if (file.size > 1 * 1024 * 1024) {
                          toast.error("Ukuran file maksimal 1MB");
                          e.target.value = ""; // Reset input
                          return;
                        }
                        setSelectedFile(file);
                        form.setValue("fotoKartuKeluarga", files);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Maksimal 1MB.</p>
                </div>

                <DialogFooter>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan No KK atau Nama Kepala Keluarga..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <DataFilter
          filters={filterConfig}
          values={filters}
          onFilterChange={onFilterChange}
          onReset={onResetFilters}
        />
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Kartu Keluarga</TableHead>
              <TableHead>ID Keluarga</TableHead>
              <TableHead>Nama Kepala Keluarga</TableHead>
              <TableHead>Rayon</TableHead>
              <TableHead>Jlh. Anggota</TableHead>
              <TableHead className="w-32 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="text-right"><div className="ml-auto h-8 w-16 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Belum ada data keluarga.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                // Find head name based on Status "Kepala Keluarga" (needs precise logic or master ID)
                // Since we don't have head ID anymore, we filter jemaat list
                const kepala = item.jemaat?.find((j) => j.status?.status.toLowerCase().includes("kepala"));
                return (
                  <TableRow key={item.idKeluarga}>
                    <TableCell className="font-mono text-sm">{item.noKK ?? "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{item.idKeluarga}</TableCell>
                    <TableCell>{kepala?.nama ?? "Tanpa Kepala Keluarga"}</TableCell>
                    <TableCell>{item.rayon?.namaRayon ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item.jemaat?.length ?? 0}</span>
                        <span className="text-muted-foreground text-xs">jiwa</span>
                      </div>
                    </TableCell>
                    <TableCell className="space-x-1 text-right whitespace-nowrap">
                      {item.fotoKartuKeluarga && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          onClick={() => window.open(item.fotoKartuKeluarga!, "_blank")}
                          title="Lihat KK"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleDetail(item)}
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.idKeluarga)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={metadata.page}
        limit={metadata.limit}
        totalCount={metadata.total}
        totalPages={metadata.totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        isLoading={isLoading}
      />

      {/* Mobile Grid View for Keluarga */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-lg bg-card">
            Belum ada data keluarga.
          </div>
        ) : (
          items.map((item) => {
            const kepala = item.jemaat?.find((j) => j.status?.status.toLowerCase().includes("kepala"));
            return (
              <div key={item.idKeluarga} className="rounded-lg border bg-card p-4 shadow-sm hover:bg-accent/50 transition-colors">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-xs font-mono text-muted-foreground">No. KK:</span>
                  <span className="font-mono text-sm font-medium">{item.noKK ?? "-"}</span>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-xs font-mono text-muted-foreground">ID Keluarga:</span>
                  <span className="font-mono text-sm font-medium">{item.idKeluarga}</span>
                </div>

                <div className="mt-3 flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">Kepala Keluarga:</span>
                  <span className="font-bold text-base">{kepala?.nama ?? "Tanpa Kepala Keluarga"}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pb-3 border-b">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">Rayon:</span>
                    <span className="font-medium text-sm">{item.rayon?.namaRayon ?? "-"}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">Jlh. Anggota:</span>
                    <span className="font-medium text-sm">{item.jemaat?.length ?? 0} jiwa</span>
                  </div>
                </div>

                {item.fotoKartuKeluarga && (
                  <div className="mt-2 text-sm">
                    <a href={item.fotoKartuKeluarga} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <FileText className="h-3 w-3" />
                      Lihat Kartu Keluarga
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="icon" onClick={() => handleDetail(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(item.idKeluarga)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data keluarga beserta semua anggotanya akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
