import FadeInSection from "@/components/ui/FadeInSection";
import { Filter, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import Lightbox from "./Lightbox";

export default function GalleryGrid({ galleryItems }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [filterQuery, setFilterQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");

    // 1. Flatten all photos from all events into a single array with metadata
    const allPhotos = useMemo(() => {
        if (!galleryItems) return [];

        // Sort events by date descending first (newest first)
        const sortedItems = [...galleryItems].sort((a, b) =>
            new Date(b.tanggalKegiatan) - new Date(a.tanggalKegiatan)
        );

        return sortedItems.flatMap(event => {
            let photos = [];
            try {
                photos = typeof event.fotos === 'string' ? JSON.parse(event.fotos) : event.fotos;
            } catch (e) {
                photos = [];
            }

            return photos.map(photo => ({
                ...photo,
                event: event // Attach event metadata to each photo
            }));
        });
    }, [galleryItems]);

    // 2. Filter logic
    const filteredPhotos = useMemo(() => {
        return allPhotos.filter(photo => {
            const matchesQuery = filterQuery === "" ||
                photo.event.namaKegiatan.toLowerCase().includes(filterQuery.toLowerCase()) ||
                photo.event.deskripsi?.toLowerCase().includes(filterQuery.toLowerCase());

            // Mock category logic since we don't have explicit categories yet
            // We can just use "All" for now, or infer if we had tags.
            const matchesCategory = activeCategory === "Semua" ? true : true;

            return matchesQuery && matchesCategory;
        });
    }, [allPhotos, filterQuery, activeCategory]);

    // Lightbox handlers
    const openLightbox = (index) => setSelectedImageIndex(index);
    const closeLightbox = () => setSelectedImageIndex(null);
    const nextImage = () => setSelectedImageIndex(prev => (prev + 1) % filteredPhotos.length);
    const prevImage = () => setSelectedImageIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);

    // Categories (Mocked for UI visualization, logic effectively ignores non-All for now)
    const categories = ["Semua", "Ibadah", "Kegiatan", "Pembangunan", "Pemuda"];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                    ? "bg-blue-600 text-white shadow-md scale-105"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari kegiatan..."
                        className="input input-sm input-bordered w-full pl-10 rounded-full bg-white bg-opacity-80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Masonry Grid via CSS Columns */}
            {filteredPhotos.length > 0 ? (
                <div className="mb-12">
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                        {filteredPhotos.map((photo, index) => (
                            <FadeInSection key={`${photo.url}-${index}`} delay={index % 10 * 100}>
                                <div
                                    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100"
                                    onClick={() => openLightbox(index)}
                                >
                                    <Image
                                        src={photo.url}
                                        alt={photo.originalName || "Gallery Photo"}
                                        width={500}
                                        height={500}
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <p className="text-white font-semibold text-sm line-clamp-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            {photo.event.namaKegiatan}
                                        </p>
                                        <p className="text-gray-300 text-xs translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                            {new Date(photo.event.tanggalKegiatan).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Tidak ada foto yang ditemukan untuk pencarian ini.</p>
                </div>
            )}

            {/* Lightbox */}
            <Lightbox
                isOpen={selectedImageIndex !== null}
                onClose={closeLightbox}
                image={selectedImageIndex !== null ? filteredPhotos[selectedImageIndex] : null}
                onNext={nextImage}
                onPrev={prevImage}
                hasNext={filteredPhotos.length > 1}
                hasPrev={filteredPhotos.length > 1}
            />
        </div>
    );
}
