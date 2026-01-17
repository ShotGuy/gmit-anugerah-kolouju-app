import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    BarChart2,
    Calendar,
    ClipboardList,
    Clock,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    Users
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import AttendanceModal from "@/components/jadwal/AttendanceModal";
import { Button } from "@/components/ui/Button";
import ButtonActions from "@/components/ui/ButtonActions";
import { Card, CardContent } from "@/components/ui/Card";
import jadwalIbadahService from "@/services/jadwalIbadahService";
import { showToast } from "@/utils/showToast";

// Page Header
function PageHeader({ title, description, breadcrumb, onAdd, onStats }) {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Breadcrumb */}
                {breadcrumb && (
                    <nav aria-label="Breadcrumb" className="flex mb-4">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            {breadcrumb.map((item, index) => (
                                <li key={index} className="inline-flex items-center">
                                    {index > 0 && (
                                        <span className="mx-2 text-gray-400">/</span>
                                    )}
                                    {item.href ? (
                                        <a className="text-sm font-medium text-gray-700 hover:text-blue-600" href={item.href}>
                                            {item.label}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-500">{item.label}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-display">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-gray-500">{description}</p>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={onStats}>
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Statistik
                        </Button>
                        <Button onClick={onAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Jadwal
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton
function TableSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /></td>
                    <td className="p-4"><div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /></td>
                </tr>
            ))}
        </>
    );
}

export default function AdminJadwalIbadahPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [searchTerm, setSearchTerm] = useState("");

    // Attendance Modal State
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedJadwal, setSelectedJadwal] = useState(null);

    const { data: jadwalData, isLoading } = useQuery({
        queryKey: ["jadwal-ibadah", pagination, searchTerm],
        queryFn: () => jadwalIbadahService.getAll({ ...pagination, search: searchTerm }),
        keepPreviousData: true,
    });

    const deleteMutation = useMutation({
        mutationFn: jadwalIbadahService.delete,
        onSuccess: () => {
            showToast({ title: "Berhasil", description: "Jadwal berhasil dihapus", color: "success" });
            queryClient.invalidateQueries(["jadwal-ibadah"]);
        },
        onError: (err) => showToast({ title: "Gagal", description: err.message, color: "danger" })
    });

    const handleDelete = (id) => {
        if (window.confirm("Yakin hapus jadwal ini?")) deleteMutation.mutate(id);
    };

    const handleOpenAttendance = (item) => {
        setSelectedJadwal(item);
        setIsAttendanceModalOpen(true);
    };

    const formatDate = (dateString) => {
        try { return format(new Date(dateString), "dd MMMM yyyy", { locale: idLocale }); } catch { return dateString; }
    };

    const formatTime = (time) => {
        if (!time) return "-";
        try { return time.substring(0, 5); } catch { return time; }
    };

    // Actions Configuration
    const getActions = (item) => [
        {
            icon: ClipboardList,
            label: "Lapor Kehadiran",
            onClick: (i) => handleOpenAttendance(i),
            variant: "ghost",
            className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        },
        {
            icon: Eye,
            label: "Detail",
            onClick: (i) => router.push(`/admin/jadwal-ibadah/${i.id}`),
            variant: "outline",
        },
        {
            icon: Edit,
            label: "Edit",
            onClick: (i) => router.push(`/admin/jadwal-ibadah/${i.id}/edit`),
            variant: "outline",
        },
        {
            icon: Trash2,
            label: "Hapus",
            onClick: (i) => handleDelete(i.id),
            variant: "outline",
            className: "text-red-600 hover:text-red-700 hover:bg-red-50"
        },
    ];

    const items = jadwalData?.data?.items || [];
    const paginationInfo = jadwalData?.data?.pagination || {};

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader
                breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Jadwal Ibadah" }]}
                title="Manajemen Jadwal Ibadah"
                description="Kelola jadwal pelayanan, ibadah raya, dan kegiatan kategorial."
                onAdd={() => router.push("/admin/jadwal-ibadah/create")}
                onStats={() => router.push("/admin/jadwal-ibadah/statistik")}
            />

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                            <input
                                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                placeholder="Cari berdasarkan judul, tema, atau pemimpin..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="p-4">Info Ibadah</th>
                                        <th className="p-4">Waktu</th>
                                        <th className="p-4">Pemimpin</th>
                                        <th className="p-4">Kehadiran</th>
                                        <th className="p-4">Keterangan</th>
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {isLoading ? <TableSkeleton /> : items.length > 0 ? (
                                        items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.judul}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {item.jenisIbadah?.namaIbadah}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{item.kategori?.namaKategori}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            {formatDate(item.tanggal)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                            {formatTime(item.waktuMulai)} - {formatTime(item.waktuSelesai)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                            <Users className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{item.pemimpin?.nama || "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {/* Quick Stats Preview */}
                                                    {(item.jumlahLaki || 0) + (item.jumlahPerempuan || 0) > 0 ? (
                                                        <div className="text-sm">
                                                            <span className="font-bold text-gray-900">{(item.jumlahLaki || 0) + (item.jumlahPerempuan || 0)}</span>
                                                            <span className="text-gray-500 ml-1">Hadir</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Belum ada data</span>
                                                    )}
                                                </td>
                                                <td className="p-4 max-w-xs truncate text-sm text-gray-500">
                                                    {item.tema || item.keterangan || "-"}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <ButtonActions actions={getActions(item)} item={item} maxVisible={3} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-gray-400">
                                                Belum ada jadwal ibadah yang dibuat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls... (Simplifying for brevity, can copy full logic if needed) */}
                        {!isLoading && paginationInfo.total > 0 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-500">Total: {paginationInfo.total}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" disabled={!paginationInfo.hasPrev} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Sebelumnya</Button>
                                    <Button size="sm" variant="outline" disabled={!paginationInfo.hasNext} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Selanjutnya</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Modal */}
            <AttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
                jadwal={selectedJadwal}
            />
        </div>
    );
}
