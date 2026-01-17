import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryImage({ galleryItem }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Parse fotos if it's a string
  let fotos;
  if (typeof galleryItem.fotos === 'string') {
    try {
      fotos = JSON.parse(galleryItem.fotos);
    } catch (e) {
      console.error("Failed to parse galleryItem.fotos:", e);
      fotos = [];
    }
  } else {
    fotos = galleryItem.fotos;
  }

  // Format the date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % fotos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (!fotos || fotos.length === 0) {
    return <div>No images available</div>;
  }

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Image Container */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img 
          alt={fotos[currentImageIndex].originalName || 'gallery image'} 
          className="object-cover w-full h-full" 
          src={fotos[currentImageIndex].url}
        />
        
        {/* Navigation Arrows */}
        {fotos.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              onClick={prevImage}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              onClick={nextImage}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {fotos.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {fotos.length}
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {fotos.length > 1 && (
        <div className="flex justify-center space-x-2 py-3 bg-gray-100">
          {fotos.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => goToImage(index)}
            />
          ))}
        </div>
      )}

      {/* Event Information */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{galleryItem.namaKegiatan}</h2>
        <p className="text-sm text-gray-600 mb-2">{galleryItem.deskripsi}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{galleryItem.tempat}</span>
          <span>{formatDate(galleryItem.tanggalKegiatan)}</span>
        </div>
      </div>
    </div>
  );
}
