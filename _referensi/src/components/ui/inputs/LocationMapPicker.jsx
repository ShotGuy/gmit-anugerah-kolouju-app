import { ExternalLink, Map, MapPin, Navigation } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

// Dynamic import to avoid SSR issues
const LeafletMap = dynamic(() => import("../LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-2 text-sm text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
});

export default function LocationMapPicker({
  latitudeName = "latitude",
  longitudeName = "longitude",
  googleMapsLinkName = "googleMapsLink",
  alamatName = "alamat",
  lokasiName = "lokasi",
  label = "Pilih Lokasi di Peta",
  defaultCenter = [-6.2088, 106.8456], // Jakarta coordinates
  zoom = 13,
}) {
  const { control, setValue, watch } = useFormContext();
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Controllers for form fields
  const { field: latField } = useController({ name: latitudeName, control });
  const { field: lngField } = useController({ name: longitudeName, control });
  const { field: gmapField } = useController({
    name: googleMapsLinkName,
    control,
  });
  const { field: alamatField } = useController({ name: alamatName, control });
  const { field: lokasiField } = useController({ name: lokasiName, control });

  // Watch current values
  const currentLat = watch(latitudeName);
  const currentLng = watch(longitudeName);
  const currentGmapLink = watch(googleMapsLinkName);

  // Set initial position when component mounts
  useEffect(() => {
    if (currentLat && currentLng) {
      const lat = parseFloat(currentLat);
      const lng = parseFloat(currentLng);

      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedPosition([lat, lng]);
        setMapCenter([lat, lng]);
      }
    }
  }, [currentLat, currentLng]);

  // Handle map click - INI YANG KAMU MAU BRO!
  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;

    // Update form values
    setValue(latitudeName, lat.toString());
    setValue(longitudeName, lng.toString());

    // Update local state
    setSelectedPosition([lat, lng]);

    // Generate Google Maps link
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    setValue(googleMapsLinkName, googleMapsUrl);

    // Try reverse geocoding untuk dapet alamat
    reverseGeocode(lat, lng);
  };

  // Reverse geocoding untuk auto-fill alamat
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data.display_name) {
        // Auto fill alamat dari hasil reverse geocoding
        setValue(alamatName, data.display_name);

        // Extract nama lokasi kalau ada
        if (
          data.address &&
          (data.address.amenity ||
            data.address.building ||
            data.address.house_name)
        ) {
          const locationName =
            data.address.amenity ||
            data.address.building ||
            data.address.house_name;

          setValue(lokasiName, locationName);
        }
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // GPS Location (tetap ada tapi optional)
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Update form dan map
          setValue(latitudeName, lat.toString());
          setValue(longitudeName, lng.toString());
          setSelectedPosition([lat, lng]);
          setMapCenter([lat, lng]);

          const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          setValue(googleMapsLinkName, googleMapsUrl);

          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Gagal mendapatkan lokasi saat ini");
        }
      );
    } else {
      alert("Browser tidak mendukung geolokasi");
    }
  };

  const generateGoogleMapsLink = () => {
    if (currentLat && currentLng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

      setValue(googleMapsLinkName, googleMapsUrl);
    }
  };

  return (
    <div className="w-full space-y-6">
      <label className="block text-sm font-medium text-gray-700">
        <MapPin className="inline h-4 w-4 mr-1" />
        {label}
      </label>

      {/* PETA LEAFLET YANG BISA DIKLIK - INI DIA BRO! */}
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              Klik di peta untuk memilih lokasi
            </p>
          </div>
          <p className="text-xs text-blue-600">
            Koordinat latitude & longitude akan otomatis terisi saat kamu klik
            titik di peta!
          </p>
        </div>

        <LeafletMap
          center={mapCenter}
          height="400px"
          selectedPosition={selectedPosition}
          zoom={zoom}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Coordinate Display (Read-only tapi bisa diedit manual) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            📍 Latitude
          </label>
          <input
            step="any"
            type="number"
            {...latField}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Klik di peta untuk auto-fill"
            readOnly={false} // Bisa diedit manual juga
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            📍 Longitude
          </label>
          <input
            step="any"
            type="number"
            {...lngField}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Klik di peta untuk auto-fill"
            readOnly={false} // Bisa diedit manual juga
          />
        </div>
      </div>

      {/* Address fields (Auto-filled from reverse geocoding) */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            🏢 Nama Lokasi/Gedung
          </label>
          <input
            type="text"
            {...lokasiField}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Akan terisi otomatis dari peta (atau isi manual)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            📍 Alamat Lengkap
          </label>
          <textarea
            {...alamatField}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Akan terisi otomatis dari reverse geocoding saat klik peta"
            rows={3}
          />
        </div>

        {/* Google Maps Link */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            🗺️ Link Google Maps
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              {...gmapField}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Otomatis dibuat dari koordinat"
            />
            {currentGmapLink && (
              <a
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors"
                href={currentGmapLink}
                rel="noopener noreferrer"
                target="_blank"
                title="Buka di Google Maps"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 transition-colors shadow-sm"
          type="button"
          onClick={handleGetCurrentLocation}
        >
          <Navigation className="h-4 w-4" />
          Gunakan Lokasi Saya
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors shadow-sm"
          type="button"
          onClick={generateGoogleMapsLink}
        >
          <Map className="h-4 w-4" />
          Generate Link Maps
        </button>
      </div>

      {/* Current coordinates display */}
      {selectedPosition && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700">
            <strong>✅ Lokasi terpilih:</strong>{" "}
            {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
