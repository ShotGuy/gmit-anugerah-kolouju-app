"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { DataFilter, FilterConfig } from "@/components/ui/data-filter";
import { Combobox } from "@/components/ui/combobox";

type Assignment = {
  idJemaat: string;
  idJabatan: string;
  tanggalMulai: string;
  tanggalBerakhir?: string | null;
  statusAktif: boolean;
  jabatan?: { namaJabatan: string };
  catatan?: string | null;
};

type Props = {
  initialData: Assignment[];
  masters: {
    jemaat: Array<{ idJemaat: string; nama: string }>;
    jabatan: Array<{ idJabatan: string; namaJabatan: string }>;
  };
  isLoading?: boolean;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
};

const schema = z.object({
  idJemaat: z.string().min(1),
  idJabatan: z.string().min(1),
  tanggalMulai: z.string(),
  tanggalBerakhir: z.string().optional(),
  statusAktif: z.boolean().default(true),
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const buildDeletePath = (assignment: Assignment) =>
  `/api/jemaat-jabatan/${assignment.idJemaat}/${assignment.idJabatan}/${assignment.tanggalMulai}`;

export default function JemaatJabatanModule({
  initialData,
  masters,
  isLoading,
  filters,
  onFilterChange,
  onResetFilters
}: Props) {
  const [items, setItems] = useState(initialData);

  useEffect(() => {
    if (initialData) {
      setItems(initialData);
    }
  }, [initialData]);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<Assignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      key: "idJabatan",
      label: "Jabatan",
      options: masters.jabatan.map((j) => ({ label: j.namaJabatan, value: j.idJabatan })),
    },
    {
      key: "statusAktif",
      label: "Status Aktif",
      options: [
        { label: "Aktif", value: "true" },
        { label: "Tidak Aktif", value: "false" },
      ],
    },
  ], [masters]);

  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.jabatan?.namaJabatan.toLowerCase().includes(searchLower) ||
      masters.jemaat
        .find((j) => j.idJemaat === item.idJemaat)
        ?.nama.toLowerCase()
        .includes(searchLower)
    );
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      statusAktif: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Optimization: Dirty Checking
    if (editingItem && !form.formState.isDirty) {
      toast.info("Tidak ada perubahan data");
      setOpen(false);
      return;
    }

    try {
      if (editingItem) {
        const res = await fetch(
          `/api/jemaat-jabatan/${encodeURIComponent(editingItem.idJemaat)}/${encodeURIComponent(editingItem.idJabatan)}/${encodeURIComponent(editingItem.tanggalMulai)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tanggalBerakhir: values.tanggalBerakhir,
              statusAktif: values.statusAktif,
              catatan: values.catatan,
            }),
          }
        );
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message ?? "Gagal memperbarui jabatan");

        setItems((prev) =>
          prev.map((item) =>
            item.idJemaat === editingItem.idJemaat &&
              item.idJabatan === editingItem.idJabatan &&
              item.tanggalMulai === editingItem.tanggalMulai
              ? { ...item, ...payload.data }
              : item
          )
        );
        toast.success("Jabatan diperbarui");
      } else {
        const res = await fetch("/api/jemaat-jabatan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload?.message ?? "Gagal menambahkan jabatan");
        }

        setItems((prev) => [payload.data, ...prev]);
        toast.success("Jabatan jemaat tersimpan");
      }
      form.reset({ statusAktif: true });
      setOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(buildDeletePath(deleteTarget), { method: "DELETE" });
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.idJemaat === deleteTarget.idJemaat &&
              item.idJabatan === deleteTarget.idJabatan &&
              item.tanggalMulai === deleteTarget.tanggalMulai
            )
        )
      );
      toast.success("Relasi jabatan dihapus");
    } catch {
      toast.error("Gagal menghapus data");
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const openDeleteDialog = (item: Assignment) => {
    setDeleteTarget(item);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (item: Assignment) => {
    setEditingItem(item);
    form.reset({
      idJemaat: item.idJemaat,
      idJabatan: item.idJabatan,
      tanggalMulai: new Date(item.tanggalMulai).toISOString().split("T")[0],
      tanggalBerakhir: item.tanggalBerakhir
        ? new Date(item.tanggalBerakhir).toISOString().split("T")[0]
        : undefined,
      statusAktif: item.statusAktif,
      catatan: item.catatan ?? undefined,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Jabatan Jemaat</h2>
          <p className="text-sm text-muted-foreground">
            Catat penugasan jabatan pelayanan jemaat.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Jabatan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Jabatan Jemaat" : "Tambah Jabatan Jemaat"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="grid gap-4 py-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="idJemaat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jemaat <span className="text-red-500">*</span></FormLabel>
                      <Combobox
                        value={field.value}
                        onChange={field.onChange}
                        options={masters.jemaat.map((item) => ({
                          label: item.nama,
                          value: item.idJemaat,
                        }))}
                        placeholder="Pilih Jemaat"
                        disabled={!!editingItem}
                        modal
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idJabatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan <span className="text-red-500">*</span></FormLabel>
                      <Combobox
                        value={field.value}
                        onChange={field.onChange}
                        options={masters.jabatan.map((item) => ({
                          label: item.namaJabatan,
                          value: item.idJabatan,
                        }))}
                        placeholder="Pilih Jabatan"
                        disabled={!!editingItem}
                        modal
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tanggalMulai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Mulai <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} disabled={!!editingItem} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tanggalBerakhir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Berakhir</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="catatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statusAktif"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                      </FormControl>
                      <FormLabel className="mb-0">Masih aktif</FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Simpan Penugasan</Button>
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
            placeholder="Cari jemaat atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jemaat</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={`${item.idJemaat}-${item.idJabatan}-${item.tanggalMulai}`}>
                <TableCell>{item.idJemaat}</TableCell>
                <TableCell>{item.jabatan?.namaJabatan ?? "-"}</TableCell>
                <TableCell>
                  {new Date(item.tanggalMulai).toLocaleDateString("id-ID")}
                  {item.tanggalBerakhir
                    ? ` - ${new Date(item.tanggalBerakhir).toLocaleDateString("id-ID")}`
                    : ""}
                </TableCell>
                <TableCell>{item.statusAktif ? "Aktif" : "Nonaktif"}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    onClick={() => handleEdit(item)}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => openDeleteDialog(item)}
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari database.
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
    </div >
  );
}

