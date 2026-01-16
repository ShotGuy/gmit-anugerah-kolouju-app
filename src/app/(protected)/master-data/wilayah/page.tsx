import Link from "next/link";
import { Globe, MapPin, Map, Home, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WilayahAdminPage() {
  const cards = [
    {
      title: "Provinsi",
      subtitle: "Tingkat administratif tertinggi di Indonesia",
      href: "/master-data/provinsi",
      Icon: Globe,
    },
    {
      title: "Kota/Kabupaten",
      subtitle: "Wilayah administratif tingkat kedua",
      href: "/master-data/kota-kabupaten",
      Icon: MapPin,
    },
    {
      title: "Kecamatan",
      subtitle: "Subdivisi dari kota atau kabupaten",
      href: "/master-data/kecamatan",
      Icon: Map,
    },
    {
      title: "Kelurahan/Desa",
      subtitle: "Tingkatan Unit administratif terkecil",
      href: "/master-data/kelurahan",
      Icon: Home,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-muted-foreground mb-2">
            <Link href="/master-data" className="hover:underline">
              Data Master
            </Link>
            <span className="mx-2">/</span>
            <span className="font-semibold">Wilayah Administratif</span>
          </nav>

          <h1 className="text-3xl font-bold">Wilayah Administratif Indonesia</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pilih tingkat wilayah administratif yang ingin Anda kelola untuk
            sistem anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/master-data" className="inline-flex items-center">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <Card
            key={c.title}
            className="transform transition hover:scale-[1.02] hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <c.Icon className="h-8 w-8 text-muted-foreground" />
                <CardTitle>{c.title}</CardTitle>
              </div>
              <CardDescription className="mt-2 text-sm">
                {c.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <Link href={c.href}>
                  <Button> Buka </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
