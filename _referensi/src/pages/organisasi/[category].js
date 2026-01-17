import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import OrganisasiCardContainer from "@/components/organisasi/OrganisasiCardContainer";
import PasalSection from "@/components/organisasi/PasalSection";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom } from "@/components/ui/ShapeDividers";
import useKategoriPengumuman from "@/hooks/useKategoriPengumuman";

export default function UppCategory() {
  const router = useRouter();
  const { category } = router.query;
  const { getCategoryBySlug, loading } = useKategoriPengumuman();
  const [categoryData, setCategoryData] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && category) {
      const catData = getCategoryBySlug(category);

      setCategoryData(catData);
    }
  }, [category, loading, getCategoryBySlug]);

  if (loading) {
    return (
      <LoadingScreen
        isLoading={true}
        message="Memuat data organisasi..."
      />
    );
  }

  if (!categoryData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-600">
            The requested Organization category could not be found.
          </p>
        </div>
      </div>
    );
  }

  const hasSubcategories =
    categoryData.jenisPengumuman && categoryData.jenisPengumuman.length > 0;

  return (
    <div>
      <PageTitle
        title={`Organisasi ${categoryData.nama} - GMIT Betlehem Oesapa Barat`}
        description={`Organisasi / Unit Pelayanan Persekutuan (UPP) ${categoryData.nama} di GMIT Jemaat Betlehem Oesapa Barat Kupang, Nusa Tenggara Timur.`}
        keywords={`Organisasi ${categoryData.nama}, UPP, Unit Pelayanan Persekutuan, Pelayanan Gereja, GMIT Betlehem Oesapa Barat, Gereja Kupang, Pelayanan Jemaat`}
      />
      {/* Hero Section with Parallax */}
      <div className="relative h-[60vh] md:h-[70vh] flex justify-center items-center overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <Image
            fill
            priority
            alt="Organisasi Header"
            className="object-cover w-full h-full"
            sizes="100vw"
            src="/header/sore3.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-6xl md:text-7xl text-white font-extrabold tracking-tight drop-shadow-2xl mb-6">
              {categoryData.nama}
            </h1>
            <div className="w-24 h-1.5 bg-yellow-400 mx-auto mb-6 rounded-full shadow-lg" />
            {categoryData.deskripsi && (
              <p className="text-gray-100 text-lg sm:text-xl md:text-2xl font-light leading-relaxed drop-shadow-md">
                {categoryData.deskripsi}
              </p>
            )}
          </div>
        </div>

        {/* Wave Divider */}
        <WaveBottom className="fill-gray-50 dark:fill-gray-900 text-gray-50 dark:text-gray-900 rotate-180" />
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>

      {/* Pasal Section - Always show if exists */}
      <PasalSection
        pasalDeskripsi={categoryData.pasalDeskripsi}
        categoryName={categoryData.nama}
      />

      {/* Show subcategories if available, otherwise show all pengumuman from this category */}
      {hasSubcategories ? (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
              Pilih Kategori {categoryData.nama}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryData.jenisPengumuman.map((jenis) => (
                <Link
                  key={jenis.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 text-center border border-gray-200 dark:border-gray-700"
                  href={`/upp/${category}/${jenis.nama.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {jenis.nama}
                  </h3>
                  {jenis.deskripsi && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{jenis.deskripsi}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <OrganisasiCardContainer
          kategoriId={categoryData.id}
          emptyStateMessage={`Belum ada pengumuman untuk kategori ${categoryData.nama}.`}
        />
      )}
    </div>
  );
}
