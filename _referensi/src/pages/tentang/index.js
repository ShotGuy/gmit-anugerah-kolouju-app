import Image from "next/image";
import { useEffect, useState } from "react";

import VisionAndMission from "@/components/about/visionAndMission";
import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom } from "@/components/ui/ShapeDividers";

export default function Tentang() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <PageTitle
        description="Tentang GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur. Sejarah, Visi, dan Misi Gereja."
        title="Tentang Kami"
        keywords="Tentang GMIT Betlehem Oesapa Barat, Sejarah Gereja, Visi Misi Gereja, Profil Gereja, Gereja di Kupang, Gereja Masehi Injili, JBOB Kupang"
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
            alt="GMIT Betlehem Oesapa Barat"
            className="w-full h-full object-cover"
            sizes="100vw"
            src="/header/malam2.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              Tentang Kami
            </h1>
            <div className="w-32 h-1 bg-blue-500 mx-auto mb-8 rounded-full" />
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-light text-gray-100">
              GMIT Betlehem Oesapa Barat - Gereja yang hidup, bertumbuh dalam iman,
              pengharapan dan kasih.
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <WaveBottom className="fill-gray-50 dark:fill-gray-900 text-gray-50 dark:text-gray-900 rotate-180" />
      </div>

      {/* Welcome Section */}
      <div className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gray-800 dark:text-white transition-colors">
              Selamat Datang di GMIT Betlehem Oesapa Barat
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed transition-colors">
              Kami adalah komunitas iman yang berkomitmen untuk hidup bersama
              dalam kasih Kristus, melayani sesama, dan melestarikan budaya
              lokal Timor. Bergabunglah dengan keluarga besar kami dalam
              perjalanan iman yang bermakna.
            </p>
          </div>
        </div>
      </div>

      {/* Vision and Mission */}
      <VisionAndMission />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}
