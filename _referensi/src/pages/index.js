import Image from "next/image";

import AboutSection from "@/components/home/aboutSection";
import DailyVerse from "@/components/home/cta/dailyVerse";
import JoinUs from "@/components/home/cta/joinUs";
import NewsRow from "@/components/home/newsRow";
import OurLocation from "@/components/home/ourLocation";
import ScheduleRow from "@/components/home/schedule/scheduleRow";
import ChurchStatistics from "@/components/home/statistics/churchStatistics";
import ChurchStatisticsHorizontal from "@/components/home/statistics/churchStatisticsHorizontal";
import FadeInSection from "@/components/ui/FadeInSection";
import PageTitle from "@/components/ui/PageTitle";
import { WaveBottom, WaveTop } from "@/components/ui/ShapeDividers";

export default function Home({ heroData }) {
  // Default values
  const defaultTagline = "Bersama dalam kasih, bertumbuh dalam iman, melayani dalam pengharapan.";

  // Only the Tagline is dynamic now
  const heroTagline = heroData?.konten || defaultTagline;

  return (
    <>
      <PageTitle
        description="GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur. Ibadah Minggu, Cell Group, Sidi, Pernikahan, Baptis, Pelayanan Jemaat."
        keywords="GMIT Jemaat Betlehem Oesapa Barat, JBOB, Gereja Kupang, Ibadah Minggu Kupang, Gereja Kristen, Gereja Protestan, Gereja di NTT, Ibadah Gereja, Pelayanan Jemaat, Kegiatan Gereja"
        title="Beranda"
      />
      <div className="bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        {/* Mobile Layout - Vertical Stack */}
        <div className="lg:hidden flex flex-col">
          {/* Hero Section */}
          <div className="relative flex justify-start items-center h-[80vh]">
            <Image
              fill
              priority
              alt="Home Head"
              className="object-cover w-full h-full"
              sizes="100vw"
              src="/header/sore3.png"
            />
            <div className="absolute flex flex-col p-6 top-1/4">
              <p className="text-white text-xl font-bold drop-shadow-md animate-slide-up">Selamat Datang di</p>
              <h1 className="text-white text-4xl font-bold drop-shadow-lg mt-1 animate-slide-up-delay">
                GMIT Betlehem Oesapa Barat
              </h1>
              <p className="text-white text-sm mt-3 drop-shadow-md max-w-xs animate-slide-up-delay-2">
                {heroTagline}
              </p>
            </div>
          </div>

          {/* Floating CTA Section (Mobile) */}
          <div className="relative z-20 -mt-16 px-4 mb-12 animate-fade-in">
            <div className="flex flex-col gap-4">
              <JoinUs />
              <DailyVerse />
            </div>
          </div>

          {/* Statistics Section (Pattern Background) */}
          <div className="w-full bg-slate-50 dark:bg-gray-900 relative py-12">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            <div className="relative z-10 px-4">
              <ChurchStatistics />
            </div>
          </div>

          {/* About Section */}
          <AboutSection />

          {/* News */}
          <div className="bg-gray-50 dark:bg-gray-800/50 py-8">
            <NewsRow />
          </div>

          {/* Schedule (Pattern Background) */}
          <div className="w-full bg-white dark:bg-gray-900 relative">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>
            <div className="relative z-10">
              <div className="w-full flex flex-col pt-10 pb-12">
                <ScheduleRow
                  jenisIbadah="Cell Group/Kelompok Kecil"
                  limit={4}
                  title="Jadwal Cell Group"
                />
                <ScheduleRow
                  kategori="Keluarga"
                  limit={6}
                  title="Jadwal Ibadah Keluarga"
                />
                <ScheduleRow limit={4} title="Semua Jadwal Ibadah" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="w-full p-0">
            <OurLocation />
          </div>
        </div>

        {/* Desktop Layout - Vertical Stack */}
        <div className="hidden lg:flex flex-col">
          {/* Hero */}
          <div className="relative flex justify-start items-center h-[85vh] lg:h-[90vh]">
            <Image
              fill
              priority
              alt="Home Head"
              className="object-cover w-full h-full brightness-60"
              sizes="100vw"
              src="/header/sore3.png"
            />
            <div className="absolute flex flex-col p-16 top-1/3">
              <p className="text-white text-4xl font-bold drop-shadow-lg animate-slide-up">
                Selamat Datang di
              </p>
              <h1 className="text-white text-6xl font-bold drop-shadow-xl mt-2 animate-slide-up-delay">
                GMIT Betlehem Oesapa Barat
              </h1>
              <p className="text-white text-lg mt-4 max-w-2xl drop-shadow-md animate-slide-up-delay-2">
                {heroTagline}
              </p>
            </div>

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Floating CTA Section (Overlap Hero) */}
          <div className="relative z-20 -mt-24 px-4 mb-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col gap-6">
                {/* We can combine them or keep them staked. Stacking looks good for floating effect */}
                <JoinUs />
                <div className="mt-6">
                  <DailyVerse />
                </div>
              </div>
            </div>
          </div>



          {/* Statistics Section (Pattern Background) + Top Wave */}
          <div className="w-full bg-slate-50 dark:bg-gray-900 relative py-16 pt-24 md:pt-32">
            {/* Divider from Hero/CTA area */}
            <WaveTop className="fill-slate-50 dark:fill-gray-900 -mt-20 md:-mt-28 top-0 absolute z-0" />

            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-8">
              <FadeInSection>
                <ChurchStatistics />
              </FadeInSection>
            </div>
          </div>

          {/* Horizontal Statistics (Accent Strip) */}
          <div className="relative z-10 shadow-lg">
            <ChurchStatisticsHorizontal />
          </div>

          {/* About Section (Clean White) */}
          <AboutSection />

          {/* News (Soft Gray) */}
          <div className="bg-gray-50 dark:bg-gray-800/50 pt-10 pb-20 md:pb-32 relative">
            <WaveBottom className="fill-white dark:fill-gray-900 text-white dark:text-gray-900" />
            <FadeInSection delay={200}>
              <NewsRow />
            </FadeInSection>
          </div>

          {/* Schedule (Pattern Background) */}
          <div className="w-full bg-white dark:bg-gray-900 relative">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-full flex flex-col pt-12 pb-16">
                <FadeInSection delay={300}>
                  <ScheduleRow
                    jenisIbadah="Cell Group/Kelompok Kecil"
                    limit={4}
                    title="Jadwal Cell Group"
                  />
                </FadeInSection>
                <FadeInSection delay={400}>
                  <ScheduleRow
                    kategori="Keluarga"
                    limit={6}
                    title="Jadwal Ibadah Keluarga"
                  />
                </FadeInSection>
                <FadeInSection delay={500}>
                  <ScheduleRow limit={4} title="Semua Jadwal Ibadah" />
                </FadeInSection>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="w-full p-0">
            <OurLocation />
          </div>
        </div>
      </div>
    </>
  );
}

// Server-side Data Fetching
import prisma from "@/lib/prisma";

export async function getStaticProps() {
  try {
    // Fetch Konten Landing Page for HERO/TAGLINE
    const heroContent = await prisma.kontenLandingPage.findFirst({
      where: {
        section: "TEMAGMIT",
        isActive: true,
        isPublished: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      props: {
        heroData: heroContent ? JSON.parse(JSON.stringify(heroContent)) : null,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return {
      props: {
        heroData: null,
      },
      revalidate: 60,
    };
  }
}
