import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";

import profilPendetaService from "@/services/profilPendetaService";

const ProfilPendetaDisplay = ({ className = "", size = "md" }) => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profil-pendeta-active"],
    queryFn: () => profilPendetaService.getActive(),
  });

  const profile = profileData?.data;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "p-4",
      image: "w-16 h-16",
      title: "text-lg",
      name: "text-base",
    },
    md: {
      container: "p-6",
      image: "w-24 h-24",
      title: "text-xl",
      name: "text-lg",
    },
    lg: {
      container: "p-8",
      image: "w-32 h-32",
      title: "text-2xl",
      name: "text-xl",
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 ${config.container} ${className}`}
      >
        <div className="text-center">
          <div
            className={`${config.image} bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 animate-pulse`}
          />
          <div
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"
            style={{ width: "120px" }}
          />
          <div
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"
            style={{ width: "80px" }}
          />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null; // Don't show anything if no active profile
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 ${config.container} ${className}`}
    >
      <div className="text-center">
        {/* Photo */}
        <div
          className={`${config.image} mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600`}
        >
          {profile.urlFoto ? (
            <img
              alt={profile.nama}
              className="w-full h-full object-cover"
              src={profile.urlFoto}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`${config.title} font-bold text-gray-900 dark:text-white mb-2`}
        >
          Pendeta
        </h3>

        {/* Name */}
        <p
          className={`${config.name} font-semibold text-gray-700 dark:text-gray-300`}
        >
          {profile.nama}
        </p>
      </div>
    </div>
  );
};

export default ProfilPendetaDisplay;
