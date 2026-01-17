import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";

export default function Lightbox({ isOpen, onClose, image, onNext, onPrev, hasNext, hasPrev }) {
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && hasNext) onNext();
        if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        // Lock body scroll when lightbox is open
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [handleKeyDown, isOpen]);

    if (!isOpen || !image) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
            >
                <X size={32} />
            </button>

            {/* Main Image Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4 py-12 md:p-12">
                <div className="relative w-full h-full max-h-[85vh] max-w-7xl flex items-center justify-center">
                    <Image
                        src={image.url}
                        alt={image.originalName || "Gallery Image"}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                    />
                </div>
            </div>

            {/* Navigation - Left */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-black/20 hover:bg-black/50 transition-colors backdrop-blur-sm"
                >
                    <ChevronLeft size={40} />
                </button>
            )}

            {/* Navigation - Right */}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-black/20 hover:bg-black/50 transition-colors backdrop-blur-sm"
                >
                    <ChevronRight size={40} />
                </button>
            )}

            {/* Caption / Metadata Overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pb-8 md:p-8 text-white">
                <div className="max-w-7xl mx-auto">
                    {image.event && (
                        <>
                            <h3 className="text-xl md:text-2xl font-bold mb-1">{image.event.namaKegiatan}</h3>
                            <p className="text-sm md:text-base text-gray-300 opacity-90 line-clamp-2 md:line-clamp-none">
                                {image.event.deskripsi}
                            </p>
                            <div className="mt-2 text-xs md:text-sm text-blue-300 font-medium">
                                {new Date(image.event.tanggalKegiatan).toLocaleDateString('id-ID', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })} • {image.event.tempat}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
