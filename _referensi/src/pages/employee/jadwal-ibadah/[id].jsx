import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Book, Calendar, Edit, MapPin, Target, Trash2, Users } from "lucide-react";
import { useRouter } from "next/router";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";
import jadwalIbadahService from "@/services/jadwalIbadahService";
import { showToast } from "@/utils/showToast";

export default function DetailJadwalIbadahEmployee() {
    const router = useRouter();
    const { id } = router.query;

    const { data: jadwalData, isLoading, error } = useQuery({
        queryKey: ["jadwal-ibadah", id],
        queryFn: () => jadwalIbadahService.getById(id),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: jadwalIbadahService.delete,
        onSuccess: () => {
            showToast({ title: "Berhasil", description: "Jadwal ibadah berhasil dihapus", color: "success" });
            router.push("/employee/jadwal-ibadah");
        },
        onError: (err) => showToast({ title: "Gagal", description: err.message, color: "danger" })
    });

    if (isLoading) return <div className="p-12 text-center">Loading...</div>;
    if (error || !jadwalData?.data) {
        return <div className="p-12 text-center text-red-500">Error: Jadwal tidak ditemukan</div>;
    }

    const jadwal = jadwalData.data;

    // Helper formats
    const formatDate = (d) => { try { return format(new Date(d), "dd MMMM yyyy", { locale: idLocale }); } catch { return d; } };
    const formatTime = (t) => { if (!t) return '-'; try { return t.substring(0, 5); } catch { return t; } };

    return (
        <>
            <PageTitle title={`Detail: ${jadwal.judul}`} />
            <div className="space-y-6 p-4">
                <PageHeader subtitle="Informasi lengkap jadwal" title="Detail Jadwal Ibadah" onBack={() => router.push("/employee/jadwal-ibadah")} />

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{jadwal.judul}</h1>
                        <div className="flex gap-2 mt-2">
                            <Badge>{jadwal.jenisIbadah?.namaIbadah}</Badge>
                            <Badge variant="secondary">{jadwal.kategori?.namaKategori}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/employee/jadwal-ibadah/${id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="outline" className="text-red-600 border-red-200" onClick={() => { if (confirm("Hapus jadwal ini?")) deleteMutation.mutate(id); }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><Calendar className="w-5 h-5" /> Waktu</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4">
                                <div><label className="text-sm font-medium text-gray-500">Tanggal</label><p className="font-semibold">{formatDate(jadwal.tanggal)}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Mulai</label><p>{formatTime(jadwal.waktuMulai)}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Selesai</label><p>{formatTime(jadwal.waktuSelesai)}</p></div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><Book className="w-5 h-5" /> Konten</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {jadwal.tema && <div><label className="text-sm font-medium text-gray-500">Tema</label><p className="text-lg font-semibold text-blue-600">{jadwal.tema}</p></div>}
                                {jadwal.firman && <div><label className="text-sm font-medium text-gray-500">Firman</label><p className="text-green-600 italic">{jadwal.firman}</p></div>}
                                {jadwal.keterangan && <div><label className="text-sm font-medium text-gray-500">Keterangan</label><p className="whitespace-pre-wrap">{jadwal.keterangan}</p></div>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><MapPin className="w-5 h-5" /> Lokasi</CardTitle></CardHeader>
                            <CardContent>
                                <p className="font-medium">{jadwal.lokasi || "Lokasi tidak spesifik"}</p>
                                {jadwal.alamat && <p className="text-gray-500">{jadwal.alamat}</p>}
                                {jadwal.rayon && <p className="mt-2 text-sm bg-gray-100 p-2 rounded inline-block">Rayon: {jadwal.rayon.namaRayon}</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><Users className="w-5 h-5" /> Pemimpin</CardTitle></CardHeader>
                            <CardContent><p className="text-lg font-semibold">{jadwal.pemimpin?.nama || "-"}</p></CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><Target className="w-5 h-5" /> Kehadiran</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-blue-50 p-2 rounded"><p className="text-xs font-bold text-blue-600">PRIA</p><p className="text-2xl font-bold text-blue-700">{jadwal.jumlahLaki || '-'}</p></div>
                                    <div className="bg-pink-50 p-2 rounded"><p className="text-xs font-bold text-pink-600">WANITA</p><p className="text-2xl font-bold text-pink-700">{jadwal.jumlahPerempuan || '-'}</p></div>
                                </div>
                                <div className="border-t pt-2 text-center">
                                    <p className="text-sm text-gray-500">Total Hadir</p>
                                    <p className="text-3xl font-black text-gray-800">{(jadwal.jumlahLaki || 0) + (jadwal.jumlahPerempuan || 0)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
