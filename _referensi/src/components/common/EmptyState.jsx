import {
  AlertCircle,
  BookOpen,
  Calendar,
  Database,
  FileX,
  Image,
  Inbox,
  Plus,
  Search,
  Users,
} from "lucide-react";

const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  type = "default",
  size = "md",
  className = "",
}) => {
  // Icon mapping based on type
  const iconMap = {
    default: Database,
    search: Search,
    users: Users,
    calendar: Calendar,
    gallery: Image,
    books: BookOpen,
    inbox: Inbox,
    error: AlertCircle,
    nodata: FileX,
  };

  // Get appropriate icon
  const IconComponent = icon || iconMap[type] || iconMap.default;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "py-8",
      icon: "w-12 h-12",
      title: "text-lg",
      description: "text-sm",
      button: "btn-sm",
    },
    md: {
      container: "py-12",
      icon: "w-16 h-16",
      title: "text-xl",
      description: "text-base",
      button: "btn-md",
    },
    lg: {
      container: "py-16",
      icon: "w-20 h-20",
      title: "text-2xl",
      description: "text-lg",
      button: "btn-lg",
    },
  };

  const config = sizeConfig[size];

  // Default content based on type
  const defaultContent = {
    default: {
      title: "Tidak ada data",
      description: "Belum ada data yang tersedia untuk ditampilkan.",
    },
    search: {
      title: "Tidak ada hasil",
      description:
        "Pencarian Anda tidak menghasilkan data apapun. Coba kata kunci yang berbeda.",
    },
    users: {
      title: "Belum ada jemaat",
      description: "Belum ada data jemaat yang terdaftar.",
    },
    calendar: {
      title: "Tidak ada jadwal",
      description: "Belum ada jadwal acara yang tersedia.",
    },
    gallery: {
      title: "Galeri kosong",
      description: "Belum ada foto atau gambar yang diupload.",
    },
    books: {
      title: "Tidak ada dokumen",
      description: "Belum ada dokumen atau file yang tersedia.",
    },
    inbox: {
      title: "Kotak masuk kosong",
      description: "Tidak ada pesan atau notifikasi baru.",
    },
    error: {
      title: "Terjadi kesalahan",
      description: "Maaf, terjadi kesalahan saat memuat data.",
    },
    nodata: {
      title: "Data tidak ditemukan",
      description: "Data yang Anda cari tidak ditemukan atau telah dihapus.",
    },
  };

  const content = defaultContent[type];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${config.container} ${className} animate-fade-in`}
    >
      {/* Icon */}
      <div
        className={`text-base-content/40 mb-4 hover:scale-110 transition-transform duration-300 animate-bounce-in`}
      >
        <IconComponent className={config.icon} />
      </div>

      {/* Title */}
      <h3
        className={`font-semibold text-base-content/80 mb-2 ${config.title} animate-slide-up`}
      >
        {title || content.title}
      </h3>

      {/* Description */}
      <p
        className={`text-base-content/60 mb-6 max-w-md ${config.description} animate-slide-up-delay`}
      >
        {description || content.description}
      </p>

      {/* Action Button */}
      {actionText && onAction && (
        <button
          className={`btn btn-primary ${config.button} gap-2 hover:scale-105 transition-transform duration-200 animate-slide-up-delay-2`}
          onClick={onAction}
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

// Predefined variants for common use cases
export const EmptyStates = {
  NoData: (props) => <EmptyState type="default" {...props} />,
  NoSearch: (props) => <EmptyState type="search" {...props} />,
  NoUsers: (props) => <EmptyState type="users" {...props} />,
  NoCalendar: (props) => <EmptyState type="calendar" {...props} />,
  NoGallery: (props) => <EmptyState type="gallery" {...props} />,
  NoBooks: (props) => <EmptyState type="books" {...props} />,
  NoInbox: (props) => <EmptyState type="inbox" {...props} />,
  Error: (props) => <EmptyState type="error" {...props} />,
  NotFound: (props) => <EmptyState type="nodata" {...props} />,
};

export default EmptyState;
