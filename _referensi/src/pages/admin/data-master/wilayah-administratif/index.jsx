"use client";
import { Building, Building2, Home, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import PageTitle from "@/components/ui/PageTitle";

export default function WilayahAdministratifPage() {
  const router = useRouter();

  const administrativeRegions = [
    {
      id: "provinsi",
      title: "Provinsi",
      description: "Tingkat administratif tertinggi di Indonesia",
      icon: Building2,
    },
    {
      id: "kota-kabupaten",
      title: "Kota/Kabupaten",
      description: "Wilayah administratif tingkat kedua",
      icon: Building,
    },
    {
      id: "kecamatan",
      title: "Kecamatan",
      description: "Subdivisi dari kota atau kabupaten",
      icon: MapPin,
    },
    {
      id: "kelurahan-desa",
      title: "Kelurahan/Desa",
      description: "Tingkatan Unit administratif terkecil",
      icon: Home,
    },
  ];

  const handleRegionClick = (regionId) => {
    // TODO: Navigate to specific region component
    router.push(`/admin/data-master/wilayah-administratif/${regionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <PageTitle title="Wilayah Administratif" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            Wilayah Administratif Indonesia
          </h1>
          <p className="text-gray-600 dark:text-gray-200 text-lg max-w-2xl mx-auto">
            Pilih tingkat wilayah administratif yang ingin Anda kelola untuk
            sistem anda.
          </p>
          <div className="w-24 h-px bg-gray-300 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {administrativeRegions.map((region) => {
            const IconComponent = region.icon;

            return (
              <Card
                key={region.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300"
                onClick={() => handleRegionClick(region.id)}
              >
                <CardHeader className="items-center text-center">
                  <IconComponent className="w-10 h-10 text-gray-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <CardTitle className="text-gray-800 dark:text-gray-200 font-semibold text-base">
                    {region.title}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {region.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button
                    className="bg-gray-600 text-white hover:bg-gray-700"
                    size="sm"
                  >
                    Buka
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
