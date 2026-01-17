import { useEffect, useRef } from "react";

// Dynamic import leaflet to avoid SSR issues
let L = null;

const LeafletMap = ({
  center = [-6.2088, 106.8456], // Default Jakarta
  zoom = 13,
  selectedPosition,
  onMapClick,
  height = "300px",
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Dynamically import leaflet on client side only
    const initMap = async () => {
      if (typeof window !== "undefined" && !L) {
        L = (await import("leaflet")).default;

        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      }

      if (L && mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        const map = L.map(mapRef.current, {
          center: center,
          zoom: zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add click event
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;

          // Remove existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // Add new marker
          markerRef.current = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
            .openPopup();

          // Call callback
          if (onMapClick) {
            onMapClick({ latlng: { lat, lng } });
          }
        });

        mapInstanceRef.current = map;

        // Add initial marker if position exists
        if (selectedPosition) {
          const [lat, lng] = selectedPosition;

          markerRef.current = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
            .openPopup();
        }
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker when selectedPosition changes
  useEffect(() => {
    if (L && mapInstanceRef.current && selectedPosition) {
      const [lat, lng] = selectedPosition;

      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
        .openPopup();

      // Center map on new position
      mapInstanceRef.current.setView(
        [lat, lng],
        mapInstanceRef.current.getZoom()
      );
    }
  }, [selectedPosition]);

  // Handle center changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  return (
    <div className="relative w-full">
      <div
        ref={mapRef}
        className="rounded-lg border border-gray-300 z-10"
        style={{ height, width: "100%" }}
      />
    </div>
  );
};

export default LeafletMap;
