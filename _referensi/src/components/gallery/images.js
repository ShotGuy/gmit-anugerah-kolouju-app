import EmptyState from "../common/EmptyState";

import GalleryImage from "./galleryImage";

export default function Images({ galleryItems }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {galleryItems && galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <GalleryImage key={item.id} galleryItem={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Belum ada foto atau gambar yang tersedia untuk ditampilkan."
          size="lg"
          title="Galeri Kosong"
          type="gallery"
        />
      )}
    </div>
  );
}
