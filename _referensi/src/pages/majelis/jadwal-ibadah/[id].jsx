import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Book,
  Target,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { showToast } from "@/utils/showToast";
import jadwalIbadahService from "@/services/jadwalIbadahService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import PageTitle from "@/components/ui/PageTitle";

export default function DetailJadwalIbadah() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  // Fetch jadwal ibadah detail
  const {
    data: jadwalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jadwal-ibadah", id],
    queryFn: () => jadwalIbadahService.getById(id),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jadwalIbadahService.delete,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Jadwal ibadah berhasil dihapus",
        color: "success",
      });
      router.push("/majelis/jadwal-ibadah");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus jadwal",
        color: "danger",
      });
    },
  });

  const handleDelete = () => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus jadwal ibadah ini?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: idLocale });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      const date = new Date(timeString);
      return format(date, "HH:mm");
    } catch (error) {
      try {
        const fallbackDate = new Date(`1970-01-01T${timeString}`);
        return format(fallbackDate, "HH:mm");
      } catch (fallbackError) {
        return timeString;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat detail jadwal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error.response?.data?.message || error.message}
          </p>
          <Button onClick={() => router.push("/majelis/jadwal-ibadah")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const jadwal = jadwalData?.data;

  if (!jadwal) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Jadwal ibadah tidak ditemukan</p>
          <Button onClick={() => router.push("/majelis/jadwal-ibadah")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle 
        description="Informasi lengkap jadwal ibadah" 
        title={`Detail: ${jadwal.judul}`} 
      />
      
      <div className="space-y-6 p-4">
        <PageHeader
          subtitle="Informasi lengkap jadwal ibadah"
          title="Detail Jadwal Ibadah"
          onBack={() => router.push("/majelis/jadwal-ibadah")}
        />

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{jadwal.judul}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">
                {jadwal.jenisIbadah?.namaIbadah || 'Ibadah'}
              </Badge>
              <Badge variant="secondary">
                {jadwal.kategori?.namaKategori || 'Umum'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/majelis/jadwal-ibadah/${id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={deleteMutation.isLoading}
              variant="outline"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Jadwal & Waktu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Jadwal & Waktu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal</label>
                    <p className="text-lg font-semibold">{formatDate(jadwal.tanggal)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Waktu Mulai</label>
                    <p className="text-lg">{formatTime(jadwal.waktuMulai)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Waktu Selesai</label>
                    <p className="text-lg">{formatTime(jadwal.waktuSelesai)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Konten & Tema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Konten & Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {jadwal.tema && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tema</label>
                    <p className="text-lg font-semibold text-blue-600">{jadwal.tema}</p>
                  </div>
                )}
                
                {jadwal.firman && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Firman</label>
                    <p className="text-lg text-green-600">{jadwal.firman}</p>
                  </div>
                )}
                
                {jadwal.keterangan && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Keterangan</label>
                    <p className="text-gray-700 whitespace-pre-wrap">{jadwal.keterangan}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lokasi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {jadwal.lokasi && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Lokasi</label>
                    <p className="text-lg">{jadwal.lokasi}</p>
                  </div>
                )}
                
                {jadwal.alamat && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alamat</label>
                    <p className="text-gray-700">{jadwal.alamat}</p>
                  </div>
                )}

                {jadwal.keluarga && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Keluarga</label>
                    <p className="text-lg">
                      Bangunan {jadwal.keluarga.noBagungan} - {jadwal.keluarga.rayon?.namaRayon}
                    </p>
                  </div>
                )}

                {jadwal.rayon && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rayon</label>
                    <p className="text-lg">{jadwal.rayon.namaRayon}</p>
                  </div>
                )}

                {jadwal.googleMapsLink && (
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(jadwal.googleMapsLink, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Lihat di Google Maps
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pemimpin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pemimpin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {jadwal.pemimpin?.nama || 'Belum ditentukan'}
                </p>
              </CardContent>
            </Card>

            {/* Target & Peserta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Peserta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {jadwal.targetPeserta && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Target Peserta</label>
                    <p className="text-lg font-semibold">{jadwal.targetPeserta} orang</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Laki-laki</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {jadwal.jumlahLaki || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Perempuan</label>
                    <p className="text-lg font-semibold text-pink-600">
                      {jadwal.jumlahPerempuan || '-'}
                    </p>
                  </div>
                </div>

                {(jadwal.jumlahLaki || jadwal.jumlahPerempuan) && (
                  <div className="pt-2 border-t">
                    <label className="text-sm font-medium text-gray-600">Total Hadir</label>
                    <p className="text-xl font-bold text-green-600">
                      {(jadwal.jumlahLaki || 0) + (jadwal.jumlahPerempuan || 0)} orang
                    </p>
                  </div>
                )}

                {!jadwal.jumlahLaki && !jadwal.jumlahPerempuan && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">
                      📝 Data kehadiran belum diisi. Edit jadwal ini setelah ibadah selesai untuk menambahkan jumlah peserta.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Tambahan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Dibuat</label>
                  <p className="text-sm">
                    {jadwal.createdAt ? formatDate(jadwal.createdAt) : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Terakhir diubah</label>
                  <p className="text-sm">
                    {jadwal.updatedAt ? formatDate(jadwal.updatedAt) : '-'}
                  </p>
                </div>

                {jadwal.pembuat && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Dibuat oleh</label>
                    <p className="text-sm">{jadwal.pembuat.namaLengkap}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}