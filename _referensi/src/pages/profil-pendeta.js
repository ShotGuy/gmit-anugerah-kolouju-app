import { Award, Calendar, Quote, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom } from "@/components/ui/ShapeDividers";

export default function ProfilPendetaPage() {
  const [scrollY, setScrollY] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);

        // Fetch all profiles (without active filter to get history too)
        const allProfilesResponse = await fetch("/api/public/profil-pendeta");
        const allProfilesData = await allProfilesResponse.json();

        if (allProfilesData.success && Array.isArray(allProfilesData.data)) {
          // Sort: Active first, then by Creation Date descending
          const sortedProfiles = allProfilesData.data.sort((a, b) => {
            if (a.isActive === b.isActive) return 0;
            return a.isActive ? -1 : 1;
          });
          setProfiles(sortedProfiles);
        }
      } catch (error) {
        console.error("Error fetching pastor profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <>
        <PageTitle
          description="Profil pendeta dan pelayan gereja GMIT Jemaat Betlehem Oesapa Barat yang melayani dengan dedikasi tinggi."
          title="Profil Pendeta"
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Memuat profil pendeta...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        description="Profil pendeta dan pelayan gereja GMIT Jemaat Betlehem Oesapa Barat yang melayani dengan dedikasi tinggi di Kupang, Nusa Tenggara Timur."
        keywords="Profil Pendeta, Pendeta GMIT, Pendeta Gereja, Pelayan Gereja, Pendeta Kupang, Gereja Masehi Injili, Pelayan JBOB"
        title="Profil Pendeta GMIT Betlehem Oesapa Barat"
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
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
              src="/header/IMG_5867.JPG"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/90" />
          </div>

          <div className="relative z-10 text-center text-white px-4">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
                Profil Pendeta
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-8 rounded-full shadow-lg" />
              <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light text-gray-100">
                Mengenal pelayan-pelayan Tuhan yang mendedikasikan hidup untuk membimbing jemaat
              </p>
            </div>
          </div>

          {/* Wave Divider */}
          <WaveBottom className="fill-gray-50 dark:fill-gray-900 text-gray-50 dark:text-gray-900 rotate-180" />
        </div>

        {/* Profiles Section */}
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {profiles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`
                      group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden 
                      shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                      border border-gray-100 dark:border-gray-700
                    `}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className={`
                        px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md
                        ${profile.isActive
                            ? "bg-green-500/90 text-white"
                            : "bg-gray-500/90 text-white"
                          }
                      `}
                      >
                        {profile.isActive ? "Aktif Melayani" : "Purna Tugas"}
                      </span>
                    </div>

                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
                      <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
                        <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white dark:bg-gray-700">
                          {profile.urlFoto ? (
                            <Image
                              alt={profile.nama}
                              fill
                              src={profile.urlFoto}
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="pt-20 pb-8 px-6 text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {profile.nama}
                      </h3>

                      {profile.status && (
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-4">
                          <Award className="w-4 h-4" />
                          <span>{profile.status}</span>
                        </div>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {profile.periode && (
                          <div className="flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700/50 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span>Periode: {profile.periode}</span>
                          </div>
                        )}
                      </div>

                      {/* Quote */}
                      {profile.quote && (
                        <div className="relative mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                          <Quote className="w-8 h-8 text-blue-100 dark:text-blue-900 absolute -top-4 left-1/2 transform -translate-x-1/2 fill-current" />
                          <p className="text-gray-600 dark:text-gray-300 italic font-serif leading-relaxed px-4">
                            "{profile.quote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <User className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Belum Ada Profil Pendeta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Data profil pendeta belum tersedia saat ini.
                </p>
              </div>
            )}
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
    </>
  );
}
