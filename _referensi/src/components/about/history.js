import { useEffect, useState } from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import kontenLandingPageService from "@/services/kontenLandingPageService";

export default function History() {
  const [sejarahData, setSejarahData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Sejarah
        const sejarahResponse =
          await kontenLandingPageService.getPublicBySection("SEJARAH");

        if (sejarahResponse.success && sejarahResponse.data.length > 0) {
          setSejarahData(sejarahResponse.data);
        }
      } catch (error) {
        console.error("Error fetching sejarah:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Array warna untuk timeline
  const colors = [
    {
      gradient: "from-blue-400 to-indigo-400",
      text: "text-blue-300",
    },
    {
      gradient: "from-green-400 to-emerald-400",
      text: "text-green-300",
    },
    {
      gradient: "from-purple-400 to-pink-400",
      text: "text-purple-300",
    },
    {
      gradient: "from-orange-400 to-red-400",
      text: "text-orange-300",
    },
    {
      gradient: "from-cyan-400 to-blue-400",
      text: "text-cyan-300",
    },
  ];

  if (loading) {
    return <LoadingScreen isLoading={true} message="Memuat Sejarah Gereja..." />;
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 dark:bg-white rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-200 dark:bg-blue-300 rounded-full blur-2xl opacity-50" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-200 dark:bg-indigo-300 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
            Sejarah Kami
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mx-auto rounded-full" />
        </div>

        {/* Timeline */}
        {sejarahData.length > 0 ? (
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent dark:before:via-gray-700">
            {sejarahData.map((item, index) => {
              const color = colors[index % colors.length];
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  {/* Timeline Dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mx-auto absolute left-0 md:static">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color.gradient}`} />
                  </div>

                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ml-auto md:ml-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-xl font-bold bg-gradient-to-r ${color.gradient} bg-clip-text text-transparent`}>
                        {item.judul}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                      {item.konten}
                    </p>
                    {item.deskripsi && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic border-t border-gray-100 dark:border-gray-700 pt-2">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Belum ada data sejarah yang tersedia
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
