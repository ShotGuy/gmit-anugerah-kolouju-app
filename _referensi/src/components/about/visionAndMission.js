import { useEffect, useState } from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import kontenLandingPageService from "@/services/kontenLandingPageService";

// Mapping gambar statis berdasarkan section
const sectionImages = {
  VISI: "/bible-on-church.webp",
  MISI: "/salib.webp",
};

export default function VisionAndMission() {
  const [visiData, setVisiData] = useState(null);
  const [misiData, setMisiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Visi
        const visiResponse = await kontenLandingPageService.getPublicBySection(
          "VISI"
        );

        if (visiResponse.success && visiResponse.data.length > 0) {
          setVisiData(visiResponse.data[0]); // Ambil yang pertama
        }

        // Fetch Misi
        const misiResponse = await kontenLandingPageService.getPublicBySection(
          "MISI"
        );

        if (misiResponse.success && misiResponse.data.length > 0) {
          setMisiData(misiResponse.data[0]); // Ambil yang pertama
        }
      } catch (error) {
        console.error("Error fetching visi misi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen isLoading={true} message="Memuat Visi & Misi..." />;
  }


  // Parse misi list jika ada metadata
  const misiList = misiData?.metadata?.list || [];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-900 text-gray-900 dark:text-white p-8 md:p-16 transition-colors duration-300">
      {/* Vision Section - Image Left, Text Right */}
      {visiData && (
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 order-1 md:hidden text-center bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {visiData.judul}
          </h2>

          <div className="flex-1 order-2 md:order-1 group">
            <div className="relative overflow-hidden rounded-xl shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <img
                alt={visiData.judul}
                className="w-full h-64 md:h-96 object-cover"
                src={sectionImages.VISI}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
            </div>
          </div>

          <div className="flex-1 order-3 md:order-2 md:pl-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 hidden md:block bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {visiData.judul}
            </h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50">
              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200">
                {visiData.konten}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mission Section - Text Left, Image Right */}
      {misiData && (
        <div className="flex flex-col md:flex-row items-center gap-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 order-1 md:hidden text-center bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {misiData.judul}
          </h2>

          <div className="flex-1 order-3 md:order-1 md:pr-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 hidden md:block bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {misiData.judul}
            </h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50">
              {misiList.length > 0 ? (
                <ul className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200 space-y-3">
                  {misiList.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 dark:text-green-400 mr-3 font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200">
                  {misiData.konten}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 order-2 group">
            <div className="relative overflow-hidden rounded-xl shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <img
                alt={misiData.judul}
                className="w-full h-64 md:h-96 object-cover"
                src={sectionImages.MISI}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
