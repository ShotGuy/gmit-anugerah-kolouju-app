import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChurchOverview() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("church-overview");

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div className="py-16 lg:py-24 bg-white" id="church-overview">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Sepintas Mengenai GMIT Betlehem Oesapa Barat
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full" />
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Gereja yang berdiri kokoh sejak 1950-an, melayani dengan kasih dan
              melestarikan budaya Timor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left - Main Content */}
          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 transform translate-x-0" : "opacity-0 transform -translate-x-8"}`}
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
                  Tentang Kami
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  GMIT Betlehem Oesapa Barat adalah gereja yang berkomitmen untuk hidup
                  bersama dalam kasih Kristus, melayani sesama, dan melestarikan
                  budaya lokal Timor. Kami percaya bahwa iman Kristen dapat
                  hidup berdampingan dengan kearifan budaya setempat.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 shadow-lg">
                <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                  Pelayanan Kami
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Lebih dari 70 tahun melayani, kami terus mengembangkan
                  berbagai program pelayanan untuk segala usia - dari sekolah
                  minggu hingga persekutuan lansia, dari pelayanan pastoral
                  hingga program pemberdayaan masyarakat.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 shadow-lg">
                <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-3" />
                  Budaya & Tradisi
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Kami bangga melestarikan budaya Timor dalam ibadah dan
                  kehidupan gereja. Bahasa lokal, musik tradisional, dan
                  nilai-nilai kearifan lokal menjadi bagian integral dari
                  identitas gereja kami.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Visual & Stats */}
          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-8"}`}
          >
            <div className="space-y-8">
              {/* Church Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
                <img
                  alt="GMIT Betlehem Oesapa Barat"
                  className="w-full h-64 lg:h-80 object-cover transform group-hover:scale-110 transition-transform duration-700"
                  src="/header/home.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Overlay Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-semibold text-blue-800">
                      Sejak 1950
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-gray-800 mb-1">
                      GMIT Betlehem Oesapa Barat
                    </h4>
                    <p className="text-sm text-gray-600 italic">
                      "Bersama dalam kasih, bertumbuh dalam iman, melayani dalam
                      pengharapan"
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">70+</div>
                  <div className="text-sm opacity-90">Tahun Melayani</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-sm opacity-90">Anggota Jemaat</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">15+</div>
                  <div className="text-sm opacity-90">Program Pelayanan</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">1</div>
                  <div className="text-sm opacity-90">Keluarga Besar</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Values */}
        <div
          className={`transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}
        >
          <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Nilai-Nilai Yang Kami Junjung
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
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
                <h4 className="text-xl font-bold mb-2 text-yellow-300">
                  Kasih
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Hidup dalam kasih Kristus dan mengasihi sesama tanpa memandang
                  perbedaan
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2 text-green-300">Iman</h4>
                <p className="text-gray-300 leading-relaxed">
                  Bertumbuh dalam iman yang kokoh dengan berpedoman pada Firman
                  Allah
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2 text-blue-300">
                  Pelayanan
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Melayani dengan sukacita untuk kemuliaan Tuhan dan kebaikan
                  masyarakat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div
          className={`text-center mt-12 transition-all duration-1000 delay-900 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"}`}
        >
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link className="group" href="/about">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Pelajari Lebih Lanjut
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300 inline-block">
                  →
                </span>
              </div>
            </Link>
            <Link className="group" href="/sejarah">
              <div className="inline-block border-2 border-blue-600 text-blue-600 font-semibold px-8 py-4 rounded-full hover:bg-blue-600 hover:text-white transform hover:scale-105 transition-all duration-300">
                Lihat Sejarah Lengkap
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
