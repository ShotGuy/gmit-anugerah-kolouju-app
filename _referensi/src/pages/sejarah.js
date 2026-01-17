import Image from "next/image";
import { useEffect, useState } from "react";

import History from "@/components/about/history";
import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom } from "@/components/ui/ShapeDividers";

export default function SejarahPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <PageTitle
        description="Sejarah perjalanan GMIT Jemaat Betlehem Oesapa Barat dari masa ke masa. Mengenal jejak pelayanan dan perkembangan jemaat dalam melayani Tuhan dan sesama di Kupang, Nusa Tenggara Timur."
        title="Sejarah GMIT Betlehem Oesapa Barat"
        keywords="Sejarah GMIT Betlehem Oesapa Barat, Sejarah Gereja di Kupang, Perjalanan Gereja, Sejarah Jemaat, Gereja Masehi Injili di Timor, Misi Gereja, Sejarah JBOB"
      />
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section with Parallax */}
        <div className="relative h-[60vh] md:h-[70vh] flex justify-center items-center overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          >
            <Image
              alt="Sejarah GMIT Betlehem Oesapa Barat"
              className="w-full h-full object-cover"
              src="/header/malam.png"
              fill
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center text-white px-4">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent drop-shadow-lg">
                Sejarah Kami
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-white to-orange-400 mx-auto mb-8 rounded-full shadow-lg" />
              <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-light text-gray-100 drop-shadow-md">
                Perjalanan panjang GMIT Betlehem Oesapa Barat dalam melayani dan
                berkarya untuk kemuliaan Tuhan dan kebaikan sesama
              </p>
            </div>
          </div>

          {/* Wave Divider */}
          <WaveBottom className="fill-white dark:fill-gray-900 text-white dark:text-gray-900 rotate-180" />
        </div>

        {/* Introduction Section */}
        <div className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100">
                Warisan Iman Yang Berkelanjutan
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Lebih dari tujuh dekade, GMIT Betlehem Oesapa Barat telah menjadi saksi
                perubahan zaman sambil tetap mempertahankan nilai-nilai iman
                Kristen dan budaya lokal Timor. Setiap era membawa tantangan dan
                berkat tersendiri, namun komitmen untuk melayani tetap menjadi
                fondasi yang kokoh.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
                <blockquote className="text-2xl font-semibold text-blue-800 dark:text-blue-300 italic">
                  "Kami tidak hanya mewarisi gedung dan tradisi, tetapi juga
                  semangat melayani yang telah diteruskan dari generasi ke
                  generasi."
                </blockquote>
                <p className="text-blue-600 dark:text-blue-400 mt-4 font-medium">
                  — Majelis GMIT Betlehem Oesapa Barat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main History Timeline */}
        <div className="dark:bg-gray-900">
          <History />
        </div>

        {/* Legacy Section */}
        <div className="py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800 dark:text-amber-400">
                Warisan Yang Kami Jaga
              </h2>
              <p className="text-lg text-amber-700 dark:text-gray-300 max-w-3xl mx-auto">
                Nilai-nilai dan tradisi yang terus kami lestarikan untuk
                generasi mendatang
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tradisi Ibadah */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-amber-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-4 text-center">
                  Tradisi Ibadah
                </h3>
                <p className="text-amber-700 dark:text-gray-300 text-center leading-relaxed">
                  Liturgi dan tatacara ibadah yang memadukan unsur Reformed
                  dengan kearifan lokal Timor, menciptakan pengalaman spiritual
                  yang autentik dan bermakna.
                </p>
              </div>

              {/* Budaya Lokal */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-amber-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-4 text-center">
                  Budaya Lokal
                </h3>
                <p className="text-green-700 dark:text-gray-300 text-center leading-relaxed">
                  Pelestarian bahasa, adat istiadat, dan nilai-nilai budaya
                  Timor yang diintegrasikan dengan ajaran Kristen dalam
                  kehidupan sehari-hari jemaat.
                </p>
              </div>

              {/* Pelayanan Sosial */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-amber-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                  Pelayanan Sosial
                </h3>
                <p className="text-blue-700 dark:text-gray-300 text-center leading-relaxed">
                  Komitmen dalam melayani masyarakat melalui berbagai program
                  sosial, pendidikan, dan pemberdayaan ekonomi yang
                  berkelanjutan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 dark:from-slate-900 dark:to-blue-950 py-20 px-4 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Mari Menjadi Bagian dari Sejarah Ini
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 text-gray-100">
              Sejarah tidak berhenti di masa lalu. Anda bisa menjadi bagian dari
              perjalanan iman dan pelayanan GMIT Betlehem Oesapa Barat ke depan.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <a
                className="inline-block bg-white text-blue-900 dark:bg-blue-600 dark:text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-blue-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
                href="/tentang"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>

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
    </>
  );
}
