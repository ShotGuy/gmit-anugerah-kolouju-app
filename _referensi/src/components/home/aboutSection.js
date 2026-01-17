import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Fetch SEJARAH content from API
import kontenLandingPageService from "@/services/kontenLandingPageService";
import { useQuery } from "@tanstack/react-query";

// Default hardcoded data (fallback)
const defaultHistory = [
  {
    judul: "Awal Mula",
    konten: "GMIT Betlehem Oesapa Barat didirikan sebagai bagian dari pelayanan gereja di wilayah Timor, lahir dari semangat penyebaran Injil dan kebutuhan masyarakat lokal.",
    urutan: "1950",
    colorFrom: "from-blue-500",
    colorTo: "to-indigo-600",
  },
  {
    judul: "Pertumbuhan",
    konten: "Masa pembangunan gedung gereja yang lebih besar dan pengembangan berbagai pelayanan seperti sekolah minggu dan persekutuan pemuda.",
    urutan: "1970",
    colorFrom: "from-green-500",
    colorTo: "to-emerald-600",
  },
  {
    judul: "Era Modern",
    konten: "Mengintegrasikan teknologi dalam pelayanan dan keterlibatan aktif dalam pembangunan masyarakat serta pelestarian budaya Timor.",
    urutan: "2024",
    colorFrom: "from-purple-500",
    colorTo: "to-pink-600",
  }
];

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Fetch dynamic content
  const { data: historyResponse } = useQuery({
    queryKey: ["publicContent", "SEJARAH"],
    queryFn: () => kontenLandingPageService.getPublicBySection("SEJARAH"),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const historyData = historyResponse?.data;

  // Use API data if available, otherwise use default
  const displayHistory = historyData?.length > 0
    ? historyData.map((item, index) => ({
      ...item,
      // Assign colors cyclically based on index
      colorFrom: index % 3 === 0 ? "from-blue-500" : index % 3 === 1 ? "from-green-500" : "from-purple-500",
      colorTo: index % 3 === 0 ? "to-indigo-600" : index % 3 === 1 ? "to-emerald-600" : "to-pink-600",
    }))
    : defaultHistory;

  useEffect(() => {
    // Add fallback timeout to ensure content shows even if IntersectionObserver fails
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(fallbackTimer);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px 0px", // Trigger earlier
      }
    );

    const element = sectionRef.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 transition-colors duration-300"
      id="about-section"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              Mengenal GMIT Betlehem Oesapa Barat
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6 rounded-full" />
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Gereja yang hidup dalam kasih, bertumbuh dalam iman, dan melayani
              dengan hati
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 transform translate-x-0" : "opacity-0 transform -translate-x-8"}`}
          >
            {/* Timeline Preview */}
            <div className="space-y-8">
              {displayHistory.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.colorFrom} ${item.colorTo} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-sm">{item.urutan}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {item.judul}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.konten}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link className="group" href="/about">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Pelajari Lebih Lanjut
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300 inline-block">
                    →
                  </span>
                </div>
              </Link>
              <Link className="group" href="/sejarah">
                <div className="border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 px-8 py-3 rounded-full font-semibold text-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white transform hover:scale-105 transition-all duration-300">
                  Sejarah Lengkap
                </div>
              </Link>
            </div>
          </div>

          {/* Right - Visual */}
          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-8"}`}
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="relative w-full h-80 lg:h-96">
                  <Image
                    fill
                    alt="GMIT Betlehem Oesapa Barat"
                    className="object-cover transform hover:scale-110 transition-transform duration-700"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src="/header/IMG_5867.JPG"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Overlay Content */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                      GMIT Betlehem Oesapa Barat
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      "Bersama dalam kasih, bertumbuh dalam iman, melayani dalam pengharapan"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          className={`mt-16 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}
        >
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold mb-2">70+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Tahun Melayani
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Anggota Jemaat
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
