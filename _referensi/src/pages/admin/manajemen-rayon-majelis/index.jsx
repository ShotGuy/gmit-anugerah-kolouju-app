"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, MapPin, Users } from "lucide-react";
import { useRouter } from "next/router";

import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { GridSkeleton } from "@/components/ui/skeletons/SkeletonGrid";
import PageHeader from "@/components/ui/PageHeader";

export default function ManajemenRayonMajelisPage() {
  const router = useRouter();

  // Query untuk get rayon list
  const { data, isLoading, error } = useQuery({
    queryKey: ["rayon-list"],
    queryFn: async () => {
      const response = await axios.get("/api/rayon", {
        params: {
          limit: 100, // Get all rayon
        },
      });

      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GridSkeleton columns={[{ key: "nama" }, { key: "total" }]} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-sm text-gray-500">
                {error.response?.data?.message || "Gagal memuat data rayon"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rayonList = data?.items || [];

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Manajemen Rayon & Majelis" },
        ]}
        description="Kelola majelis di setiap rayon dan atur permission akses"
        title="Manajemen Rayon & Majelis"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 dark:bg-gray-800 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1 dark:text-blue-400">
                  Informasi Permission
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Majelis Utama:</strong> Full akses (CRUD + kelola
                  rayon) | <strong>Koordinator Rayon:</strong> View + kelola
                  rayon | <strong>Majelis Biasa:</strong> View only
                </p>
                <p className="text-xs text-blue-600 mt-1 dark:text-blue-400">
                  * Hanya boleh 1 Majelis Utama per rayon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rayon Cards */}
        {rayonList.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum Ada Rayon
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Silakan buat rayon terlebih dahulu di menu Kelola Rayon
                </p>
                <Button onClick={() => router.push("/admin/rayon")}>
                  Kelola Rayon
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rayonList.map((rayon) => (
              <Card
                key={rayon.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/admin/manajemen-rayon-majelis/${rayon.id}`)
                }
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      <CardTitle className="text-lg">
                        {rayon.namaRayon}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">
                      {rayon._count?.keluargas || 0} KK
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {rayon._count?.keluargas || 0} Keluarga Terdaftar
                      </span>
                    </div>

                    <div className="pt-3 border-t">
                      <Button className="w-full" size="sm" variant="outline">
                        Kelola Majelis Rayon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <div className="text-2xl font-bold text-gray-800">
                  {rayonList.length}
                </div>
                <div className="text-sm text-gray-600">Total Rayon</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg dark:bg-blue-800">
                <div className="text-2xl font-bold text-blue-600">
                  {rayonList.reduce(
                    (sum, r) => sum + (r._count?.keluargas || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-blue-700">Total Keluarga</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

ManajemenRayonMajelisPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
