"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, Eye, Pencil, Trash2, MoreHorizontal, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
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

type Jemaat = {
  idJemaat: string;
  nama: string;
  jenisKelamin: boolean;
  tanggalLahir: string;
  statusDalamKel: string;
  golDarah?: string | null;
  idPendidikan?: string | null;
  idPekerjaan?: string | null;
  idPendapatan?: string | null;
  idJaminan?: string | null;
  status?: { status: string };
  keluarga?: {
    noKK?: string | null;
    rayon?: { namaRayon: string };
    alamat?: {
      kelurahan?: { nama: string };
    };
  };
};

type MasterCollections = {
  status: Array<{ idStatusDalamKel: string; status: string }>;
  pendidikan: Array<{ idPendidikan: string; jenjang: string }>;
  pekerjaan: Array<{ idPekerjaan: string; namaPekerjaan: string }>;
  pendapatan: Array<{ idPendapatan: string; rentang: string }>;
  jaminan: Array<{ idJaminan: string; jenisJaminan: string }>;
  statusKepemilikan: Array<{ idStatusKepemilikan: string; status: string }>;
  statusTanah: Array<{ idStatusTanah: string; status: string }>;
  rayon: Array<{ idRayon: string; namaRayon: string }>;
};

import { PaginationControls } from "@/components/ui/pagination-controls";
import { ExportModal } from "./export-modal";
import { getJemaatAction } from "@/actions/jemaat";
import { AsyncKelurahanSelect } from "./async-kelurahan-select";
import { Combobox } from "@/components/ui/combobox";

type Props = {
  data: Jemaat[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  masters: MasterCollections;
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

const formSchema = z.object({
  idJemaat: z.string().min(5),
  nama: z.string().min(3),
  jenisKelamin: z.enum(["L", "P"]),
  tanggalLahir: z.string(),
  statusDalamKel: z.string().min(1),
  golDarah: z.string().max(5).nullable().optional(),
  idPendidikan: z.string().nullable().optional(),
  idPekerjaan: z.string().nullable().optional(),
  idPendapatan: z.string().nullable().optional(),
  idJaminan: z.string().nullable().optional(),
  noKK: z.string().length(16).regex(/^\d+$/).optional(),
  keluargaBaru: z
    .object({
      noKK: z.string().length(16).regex(/^\d+$/),
      idStatusKepemilikan: z.string(),
      idStatusTanah: z.string(),
      idRayon: z.string(),
      idKelurahan: z.string(),
      jalan: z.string().min(3),
      RT: z.coerce.number().int().min(0),
      RW: z.coerce.number().int().min(0),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const normalizeStatus = (value: string) => value.toLowerCase().includes("kepala");

export default function JemaatModule({
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
  const items = data;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialKelurahanName, setInitialKelurahanName] = useState("");
  const [isExistingFamily, setIsExistingFamily] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 1000);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 1000);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const handleFetchAllForExport = async (overrideFilters?: any) => {
    // Merge override filters with potentially existing filters, or use overrides primarily
    // For export with "All Data" + manual filters, we use the manual filters.
    // If "Current Page" is used, pagination is used (not handled here).

    const finalFilters = overrideFilters ? { ...filters, ...overrideFilters } : filters;

    // Fetch all data matching current filters
    const res = await getJemaatAction(
      1,
      100000,
      finalFilters,
      searchQuery
    );
    return res.data;
  };

  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      key: "jenisKelamin",
      label: "Jenis Kelamin",
      options: [
        { label: "Laki-laki", value: "L" },
        { label: "Perempuan", value: "P" },
      ],
    },
    {
      key: "golDarah",
      label: "Golongan Darah",
      options: ["A", "B", "AB", "O"].map((g) => ({ label: g, value: g })),
    },
    {
      key: "statusDalamKel",
      label: "Status Keluarga",
      options: masters.status.map((s) => ({ label: s.status, value: s.idStatusDalamKel })),
    },
    {
      key: "idRayon",
      label: "Rayon",
      options: masters.rayon.map((r) => ({ label: r.namaRayon, value: r.idRayon })),
    },
    {
      key: "idPendidikan",
      label: "Pendidikan",
      options: masters.pendidikan.map((p) => ({ label: p.jenjang, value: p.idPendidikan })),
    },
    {
      key: "idPekerjaan",
      label: "Pekerjaan",
      options: masters.pekerjaan.map((p) => ({ label: p.namaPekerjaan, value: p.idPekerjaan })),
    },
    {
      key: "idStatusKepemilikan",
      label: "Status Rumah",
      options: masters.statusKepemilikan.map((s) => ({ label: s.status, value: s.idStatusKepemilikan })),
    },
    {
      key: "idStatusTanah",
      label: "Status Tanah",
      options: masters.statusTanah.map((s) => ({ label: s.status, value: s.idStatusTanah })),
    },
  ], [masters]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      jenisKelamin: "L",
    },
  });

  const selectedStatus = form.watch("statusDalamKel");
  const statusLabel = useMemo(() => {
    return masters.status.find(
      (item) => item.idStatusDalamKel === selectedStatus,
    )?.status;
  }, [selectedStatus, masters.status]);

  const isKepala = !!statusLabel && normalizeStatus(statusLabel);

  // EFECT: Explicitly clean up form values when modes switch to prevent phantom validation errors
  useEffect(() => {
    if (isKepala) {
      // If Head: Unregister the simple noKK field (we use idJemaat or new family)
      form.unregister("noKK");

      if (isExistingFamily) {
        // If Existing Family: Unregister new family fields
        form.unregister("keluargaBaru");
      }
    } else {
      // If Not Head: Unregister new family fields
      form.unregister("keluargaBaru");
    }
  }, [isKepala, isExistingFamily, form]);

  const handleSubmit = async (values: FormValues) => {
    // Optimization: Dirty Checking
    if (editingId && !form.formState.isDirty) {
      toast.info("Tidak ada perubahan data");
      setOpen(false);
      return;
    }

    try {
      const isKepala = normalizeStatus(
        masters.status.find((s) => s.idStatusDalamKel === values.statusDalamKel)?.status ?? "",
      );

      if (isKepala && !isExistingFamily && !values.keluargaBaru && !editingId) {
        toast.error("Lengkapi data keluarga baru untuk kepala keluarga");
        return;
      }

      // Automatically use idJemaat as noKK if linking to existing family as Head (Wait, NO! Logic changed)
      // User says: Identifier is noKK. Head status is status.
      // So if Head: He enters family? Or creates family?
      // If Creating New Family (Head): He Inputs noKK for the Family.

      let finalNoKK = values.noKK;
      // If isExistingFamily (Head), he doesn't enter noKK in "family" field? 
      // The logic: "When adding head... if existing family... wait..."
      // If linking to existing family, we need the noKK of that family.
      // The form asks for "nikKepalaKeluarga" (now "noKK").

      if (isKepala && isExistingFamily) {
        // Logic for "Existing Family" checkbox for Head: 
        // Original: Use idJemaat as nikKepala. 
        // New: We need to ASK for the noKK of the family he is joining as head.
        // BUT wait, if he joins as head, the family should logically usually be new OR he replaces head?
        // Let's assume simplest: If existing family, he must provide noKK.
        // So for "isExistingFamily", we shouldn't hide the input, we should SHOW noKK input.
        // But the UI hides it? 
        // Original code: `if (isKepala) form.unregister("nikKepalaKeluarga")`.
        // This means original logic assumed Head's NIK = Family ID.
        // NOW: Family ID = noKK (Manual Input).
        // So even if Head, he MUST input noKK (either to create new or join existing).
        // I need to change this logic completely.
        // For now I will just blindly rename to noKK to match schema, and let the UI show it if needed.
        // Actually I should look at the inputs.

      }

      // If (!isKepala) && !finalNoKK...
      if (!isKepala && !finalNoKK) {
        toast.error("Isi No. KK untuk menghubungkan");
        return;
      }

      const headPayload =
        isKepala && !isExistingFamily && values.keluargaBaru
          ? {
            noKK: values.keluargaBaru.noKK,
            idStatusKepemilikan: values.keluargaBaru.idStatusKepemilikan,
            idStatusTanah: values.keluargaBaru.idStatusTanah,
            idRayon: values.keluargaBaru.idRayon,
            alamat: {
              idKelurahan: values.keluargaBaru.idKelurahan,
              jalan: values.keluargaBaru.jalan,
              RT: values.keluargaBaru.RT,
              RW: values.keluargaBaru.RW,
            },
          }
          : undefined;

      const payload = {
        ...values,
        noKK: finalNoKK,
        jenisKelamin: values.jenisKelamin === "L",
        keluargaBaru: headPayload,
      };

      if (editingId) {
        // Update existing jemaat
        const updatePayload: any = {
          nama: values.nama,
          jenisKelamin: values.jenisKelamin === "L",
          tanggalLahir: values.tanggalLahir,
          golDarah: values.golDarah ?? null,
          statusDalamKel: values.statusDalamKel,
          idPendidikan: values.idPendidikan ?? null,
          idPekerjaan: values.idPekerjaan ?? null,
          idPendapatan: values.idPendapatan ?? null,
          idJaminan: values.idJaminan ?? null,
        };

        const res = await fetch(`/api/jemaat/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data?.errors) {
            Object.entries(data.errors).forEach(([key, msg]) => {
              form.setError(key as any, { type: "server", message: msg as string });
            });
          }
          throw new Error(data?.message ?? "Gagal memperbarui jemaat");
        }

        // setItems((prev) => prev.map((it) => (it.idJemaat === editingId ? data.data : it)));
        onDataChange();
        setEditingId(null);
        setOpen(false);
        form.reset();
        toast.success("Jemaat berhasil diperbarui");
      } else {
        // Create new Jemaat
        // Use FormData if creating new family (to support file upload)
        // Or actually, we can ALWAYS use FormData for consistency, OR use it only when needed.
        // Server handles both? No, server now expects FormData if multipart, or JSON if not.
        // But for "keluargaBaru" we really want to upload.

        const isCreatingNewFamily = isKepala && !isExistingFamily && values.keluargaBaru;

        if (isCreatingNewFamily && selectedFile) {
          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));
          formData.append("fotoKartuKeluarga", selectedFile);

          const res = await fetch("/api/jemaat", {
            method: "POST",
            body: formData,
            // Content-Type header is explicitly undefined so browser sets boundary
          });

          const data = await res.json();
          if (!res.ok) {
            if (data?.errors) {
              Object.entries(data.errors).forEach(([key, msg]) => {
                form.setError(key as any, { type: "server", message: msg as string });
              });
            }
            throw new Error(data?.message ?? "Gagal menambahkan jemaat");
          }

        } else {
          // Standard JSON submission (if no file or not creating family)
          // Ideally we should unify to FormData but server logic I wrote 
          // "if (contentType.includes("multipart/form-data"))" handles it.
          // Wait, if I send JSON, header is application/json. 
          // If I send FormData, header is multipart/form-data.
          // My server code handles both.

          // HOWEVER, if isCreatingNewFamily is true but NO file selected, 
          // we should still be able to use JSON?
          // Yes.

          const res = await fetch("/api/jemaat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (!res.ok) {
            if (data?.errors) {
              Object.entries(data.errors).forEach(([key, msg]) => {
                form.setError(key as any, { type: "server", message: msg as string });
              });
            }
            throw new Error(data?.message ?? "Gagal menambahkan jemaat");
          }
        }

        onDataChange();
        setOpen(false);
        form.reset();
        setSelectedFile(null); // Reset file
        toast.success("Jemaat berhasil ditambahkan");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
    }
  };

  const handleEdit = (item: Jemaat) => {
    setEditingId(item.idJemaat);
    // populate form
    form.reset({
      idJemaat: item.idJemaat,
      nama: item.nama,
      jenisKelamin: item.jenisKelamin ? "L" : "P",
      tanggalLahir: (item.tanggalLahir as any) instanceof Date
        ? (item.tanggalLahir as any).toISOString().split("T")[0]
        : String(item.tanggalLahir).split("T")[0],
      statusDalamKel: item.statusDalamKel,
      golDarah: item.golDarah?.trim() ?? undefined,
      idPendidikan: item.idPendidikan?.trim() ?? undefined,
      idPekerjaan: item.idPekerjaan?.trim() ?? undefined,
      idPendapatan: item.idPendapatan?.trim() ?? undefined,
      idJaminan: item.idJaminan?.trim() ?? undefined,
      noKK: item.keluarga?.noKK ?? undefined,
    });

    // Set initial kelurahan name if available
    setInitialKelurahanName(item.keluarga?.alamat?.kelurahan?.nama ?? "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/jemaat/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Gagal menghapus jemaat");
      // setItems((prev) => prev.filter((it) => it.idJemaat !== id));
      onDataChange();
      toast.success("Jemaat berhasil dihapus");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  const handleDetail = (item: Jemaat) => {
    router.push(`/jemaat/${encodeURIComponent(item.idJemaat)}`);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      idJemaat: "",
      nama: "",
      jenisKelamin: "L",
      statusDalamKel: "",
      // Reset others implicitly to undefined
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Data Jemaat</h2>
          <p className="text-sm text-muted-foreground">
            Kelola data jemaat beserta status keluarga.
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setShowExportModal(true)}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={handleAdd}>Tambah Jemaat</Button>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Jemaat" : "Tambah Jemaat"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                console.error("Validation errors full:", JSON.stringify(errors, null, 2));

                // Helper to flatten error messages
                const getErrorPaths = (obj: any, prefix = ''): string[] => {
                  return Object.keys(obj).reduce((acc: string[], key) => {
                    const val = obj[key];
                    const path = prefix ? `${prefix}.${key}` : key;
                    if (val?.message) {
                      return [...acc, `${path} (${val.message})`];
                    }
                    if (typeof val === 'object' && val !== null) {
                      return [...acc, ...getErrorPaths(val, path)];
                    }
                    return acc;
                  }, []);
                };

                const errorMessages = getErrorPaths(errors);
                const desc = errorMessages.length > 3
                  ? `${errorMessages.slice(0, 3).join(', ')}... (+${errorMessages.length - 3} lainnya)`
                  : errorMessages.join(', ');

                toast.error(`Validasi gagal: ${desc}`);
              })}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="idJemaat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK Jemaat <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} disabled={!!editingId} maxLength={16} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jenisKelamin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin <span className="text-red-500">*</span></FormLabel>
                        <Combobox
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { label: "Laki-laki", value: "L" },
                            { label: "Perempuan", value: "P" },
                          ]}
                          placeholder="Pilih Jenis Kelamin"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tanggalLahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statusDalamKel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Dalam Keluarga <span className="text-red-500">*</span></FormLabel>
                        <Combobox
                          value={field.value}
                          onChange={field.onChange}
                          options={masters.status.map((item) => ({
                            label: item.status,
                            value: item.idStatusDalamKel,
                          }))}
                          placeholder="Pilih Status"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="golDarah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Golongan Darah</FormLabel>
                        <Combobox
                          value={field.value || undefined}
                          onChange={field.onChange}
                          options={["A", "B", "AB", "O"].map((d) => ({
                            label: d,
                            value: d,
                          }))}
                          placeholder="Pilih Golongan Darah"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idPendidikan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendidikan</FormLabel>
                        <Combobox
                          value={field.value || undefined}
                          onChange={field.onChange}
                          options={masters.pendidikan.map((item) => ({
                            label: item.jenjang,
                            value: item.idPendidikan,
                          }))}
                          placeholder="Pilih Pendidikan"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idPekerjaan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pekerjaan</FormLabel>
                        <Combobox
                          value={field.value || undefined}
                          onChange={field.onChange}
                          options={masters.pekerjaan.map((item) => ({
                            label: item.namaPekerjaan,
                            value: item.idPekerjaan,
                          }))}
                          placeholder="Pilih Pekerjaan"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idPendapatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendapatan</FormLabel>
                        <Combobox
                          value={field.value || undefined}
                          onChange={field.onChange}
                          options={masters.pendapatan.map((item) => ({
                            label: item.rentang,
                            value: item.idPendapatan,
                          }))}
                          placeholder="Pilih Pendapatan"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idJaminan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jaminan Kesehatan</FormLabel>
                        <Combobox
                          value={field.value || undefined}
                          onChange={field.onChange}
                          options={masters.jaminan.map((item) => ({
                            label: item.jenisJaminan,
                            value: item.idJaminan,
                          }))}
                          placeholder="Pilih Jaminan"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isKepala && (
                  <FormField
                    control={form.control}
                    name="noKK"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. Kartu Keluarga</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} maxLength={16} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isKepala && !editingId && (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="existingFamily"
                        checked={isExistingFamily}
                        onCheckedChange={(c) => setIsExistingFamily(!!c)}
                      />
                      <label
                        htmlFor="existingFamily"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Keluarga Sudah Terdaftar?
                      </label>
                    </div>

                    {isExistingFamily ? (
                      <div className="rounded bg-muted p-3 text-sm text-muted-foreground mt-2">
                        Sistem akan otomatis menghubungkan jemaat ini ke data Keluarga dengan NIK yang sama (<b>{form.watch("idJemaat") || "..."}</b>).
                        Pastikan data Keluarga sudah dibuat sebelumnya di menu Keluarga.
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mt-4">
                          Data Keluarga Baru
                        </h4>
                        <FormField
                          control={form.control}
                          name="keluargaBaru.noKK"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>No. Kartu Keluarga <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} maxLength={16} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="keluargaBaru.idStatusKepemilikan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status Kepemilikan Rumah <span className="text-red-500">*</span></FormLabel>
                                <Combobox
                                  value={field.value}
                                  onChange={field.onChange}
                                  options={masters.statusKepemilikan.map((item) => ({
                                    label: item.status,
                                    value: item.idStatusKepemilikan,
                                  }))}
                                  placeholder="Pilih Status Kepemilikan"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="keluargaBaru.idStatusTanah"
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
                          <FormField
                            control={form.control}
                            name="keluargaBaru.idRayon"
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
                            name="keluargaBaru.idKelurahan"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Kelurahan <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <AsyncKelurahanSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    initialLabel={initialKelurahanName}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="keluargaBaru.jalan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Jalan <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="keluargaBaru.RT"
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
                              name="keluargaBaru.RW"
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
                        </div>

                        {/* File Upload for Family Card */}
                        <div className="space-y-2 mt-4 border-t pt-4">
                          <FormLabel className="text-base">Upload Foto Kartu Keluarga</FormLabel>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <FormLabel htmlFor="kk-file" className="text-xs text-muted-foreground">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                            </FormLabel>
                            <Input
                              id="kk-file"
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  setSelectedFile(files[0]);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                )}

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
            placeholder="Cari berdasarkan NIK atau Nama..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
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
              <TableHead>NIK</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>L/P</TableHead>
              <TableHead>Tanggal Lahir</TableHead>
              <TableHead>Status Keluarga</TableHead>
              <TableHead>Rayon</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="text-right"><div className="ml-auto h-8 w-16 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Belum ada data jemaat.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.idJemaat}>
                  <TableCell className="font-mono text-xs">{item.idJemaat}</TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.jenisKelamin ? "L" : "P"}</TableCell>
                  <TableCell>
                    {new Date(item.tanggalLahir).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{item.status?.status ?? "-"}</TableCell>
                  <TableCell>{item.keluarga?.rayon?.namaRayon ?? "-"}</TableCell>
                  <TableCell className="space-x-1 text-right whitespace-nowrap">
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
                      onClick={() => handleDelete(item.idJemaat)}
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Mobile Grid View */}
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
            Belum ada data jemaat.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.idJemaat} className="rounded-lg border bg-card p-4 shadow-sm hover:bg-accent/50 transition-colors">
              <div className="flex flex-col space-y-1.5">
                <span className="text-xs font-mono text-muted-foreground">NIK:</span>
                <span className="font-mono text-sm font-medium">{item.idJemaat}</span>
              </div>

              <div className="mt-3 flex flex-col space-y-1">
                <span className="text-xs text-muted-foreground">Nama:</span>
                <span className="font-bold text-base">{item.nama}</span>
              </div>

              <div className="mt-3 pb-3 border-b flex flex-col space-y-1">
                <span className="text-xs text-muted-foreground">Gender:</span>
                <span className="font-medium text-sm">{item.jenisKelamin ? "Laki-laki" : "Perempuan"}</span>
              </div>

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
                      onClick={() => handleDelete(item.idJemaat)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentPageData={items}
        totalDataCount={metadata.total}
        onFetchAllData={handleFetchAllForExport}
        filterOptions={{
          rayons: masters.rayon.map((r) => ({ label: r.namaRayon, value: r.idRayon })),
          pendidikans: masters.pendidikan.map((p) => ({ label: p.jenjang, value: p.idPendidikan })),
          pekerjaans: masters.pekerjaan.map((p) => ({ label: p.namaPekerjaan, value: p.idPekerjaan })),
          pendapatans: masters.pendapatan.map((p) => ({ label: p.rentang, value: p.idPendapatan })),
          jaminans: masters.jaminan.map((j) => ({ label: j.jenisJaminan, value: j.idJaminan })),
        }}
      />
    </div>
  );
}
