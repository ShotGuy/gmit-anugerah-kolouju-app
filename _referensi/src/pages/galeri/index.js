import Image from "next/image";
import { useEffect, useState } from "react";

import EmptyState from "@/components/common/EmptyState";
import Images from "@/components/gallery/images";
import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom } from "@/components/ui/ShapeDividers";
import axios from "@/lib/axios";

export default function Galeri() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGaleri() {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/galeri");

        if (response.data.success && response.data.data.items.length > 0) {
          // Pass the gallery items directly without flattening
          setGalleryItems(response.data.data.items);
        } else {
          setGalleryItems([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat data galeri");
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGaleri();
  }, []);

  return (
    <div>
      <PageTitle
        description="Galeri Kegiatan GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Dokumentasi Ibadah Minggu, Cell Group, Sidi, Pernikahan, Baptis dan berbagai kegiatan gereja di Kupang, Nusa Tenggara Timur."
        title="Galeri Kegiatan Gereja"
        keywords="Galeri Gereja, Galeri GMIT, Galeri Jemaat, Foto Ibadah Minggu, Kegiatan Gereja Kupang, Dokumentasi Gereja, Galeri Kegiatan GMIT Betlehem Oesapa Barat, JBOB Galeri"
      />


      {/* New Hero Section (Image Background) */}
      <div className="relative flex justify-center items-center h-[50vh] md:h-[60vh] overflow-hidden text-center text-white">
        <Image
          fill
          priority
          alt="Galeri Head"
          className="object-cover brightness-50"
          sizes="100vw"
          src="/header/malam2.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>

        <div className="relative z-10 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">
            Galeri Kegiatan
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light">
            Momen-momen berharga dalam persekutuan dan pelayanan di GMIT Betlehem Oesapa Barat
          </p>
        </div>

        {/* Decorative Wave - Rotated 180deg */}
        <WaveBottom className="fill-gray-50 dark:fill-gray-900 text-gray-50 dark:text-gray-900 rotate-180" />
      </div>

      {/* Main Content (No Search/Filter) */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="loading loading-xl text-primary" />
          </div>
        ) : error ? (
          <EmptyState
            actionText="Coba Lagi"
            description={`Terjadi kesalahan: ${error}`}
            title="Gagal Memuat Galeri"
            type="error"
            onAction={() => window.location.reload()}
          />
        ) : (
          <div className="animate-fade-in-up">
            <Images galleryItems={galleryItems} />
          </div>
        )}
      </div>
    </div>
  );
}
