import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import OrganisasiCardContainer from "@/components/organisasi/OrganisasiCardContainer";
import PasalSection from "@/components/organisasi/PasalSection";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom } from "@/components/ui/ShapeDividers";
import useKategoriPengumuman from "@/hooks/useKategoriPengumuman";

export default function UppSubcategory() {
  const router = useRouter();
  const { category, subcategory } = router.query;
  const { getCategoryBySlug, getSubcategoryBySlug, loading } =
    useKategoriPengumuman();
  const [categoryData, setCategoryData] = useState(null);
  const [subcategoryData, setSubcategoryData] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && category && subcategory) {
      const catData = getCategoryBySlug(category);
      const subData = getSubcategoryBySlug(category, subcategory);

      setCategoryData(catData);
      setSubcategoryData(subData);
    }
  }, [category, subcategory, loading, getCategoryBySlug, getSubcategoryBySlug]);

  if (loading) {
    return (
      <LoadingScreen isLoading={true} message="Memuat data organisasi..." />
    );
  }

  if (!categoryData || !subcategoryData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Sub-Kategori Tidak Ditemukan
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kategori atau sub-kategori organisasi tidak dapat ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <PageTitle
        description={`Organisasi ${categoryData.nama} - ${subcategoryData.nama} (UPP) di GMIT Jemaat Betlehem Oesapa Barat Kupang, Nusa Tenggara Timur.`}
        keywords={`Organisasi ${categoryData.nama}, ${subcategoryData.nama}, Unit Pelayanan Persekutuan, Pelayanan Gereja, GMIT Betlehem Oesapa Barat, Gereja Kupang`}
        title={`Organisasi ${categoryData.nama} - ${subcategoryData.nama} - GMIT Betlehem Oesapa Barat`}
      />

      {/* Hero Section with Parallax */}
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
            <h1 className="text-4xl sm:text-6xl md:text-7xl text-white font-extrabold tracking-tight drop-shadow-2xl mb-4">
              {categoryData.nama}
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-blue-200 font-semibold mt-2 drop-shadow-md">
              {subcategoryData.nama}
            </h2>
            {subcategoryData.deskripsi && (
              <p className="text-gray-100 text-lg sm:text-xl md:text-2xl mt-6 font-light leading-relaxed drop-shadow-md max-w-4xl mx-auto">
                {subcategoryData.deskripsi}
              </p>
            )}
          </div>
        </div>

        {/* Wave Divider */}
        <WaveBottom className="fill-gray-50 dark:fill-gray-900 text-gray-50 dark:text-gray-900 rotate-180" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 -mt-10 md:-mt-20 px-4 pb-20">

        {/* Pasal Info */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <PasalSection
              categoryName={`${categoryData.nama} - ${subcategoryData.nama}`}
              pasalDeskripsi={
                categoryData.pasalDeskripsi || subcategoryData.pasalDeskripsi
              }
            />
          </div>
        </div>

        {/* Cards Section */}
        <div className="max-w-7xl mx-auto">
          <OrganisasiCardContainer
            emptyStateMessage={`Belum ada pengumuman untuk ${subcategoryData.nama}.`}
            jenisId={subcategoryData.id}
          />
        </div>
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
    </div>
  );
}
