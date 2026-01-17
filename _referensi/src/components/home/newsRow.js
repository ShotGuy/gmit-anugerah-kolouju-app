import { useEffect, useState } from "react";

import OrganisasiCard from "@/components/organisasi/OrganisasiCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/Carousel";
import pengumumanService from "@/services/pengumumanService";

export default function NewsRow() {
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await pengumumanService.getAll({
          limit: 6,
          status: "PUBLISHED",
          sortBy: "tanggalPengumuman",
          sortOrder: "desc",
        });
        if (response.success && response.data.items) {
          setNewsData(response.data.items);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="w-full px-4 md:px-8 py-8 bg-gray-300 dark:bg-gray-700 transition-colors duration-300">
      <div className="divider divider-start divider-neutral dark:divider-gray text-3xl text-black dark:text-white">Pengumuman</div>
      <div className="max-w-full overflow-hidden">
        {newsData.length === 0 ? (
          <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-300">Saat ini belum ada berita.</div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {newsData.map((news) => (
                <CarouselItem
                  key={news.id}
                  className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <OrganisasiCard pengumuman={news} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center text-black dark:text-white gap-4 mt-8">
              <CarouselPrevious className="relative left-0 top-0" />
              <CarouselNext className="relative right-0 top-0" />
            </div>
          </Carousel>
        )}
      </div>
    </div>
  );
}
