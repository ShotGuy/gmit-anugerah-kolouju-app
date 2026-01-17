// ========================================
// CONTOH CARA PAKAI LOADING SCREEN
// ========================================

import { useState } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ExamplePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchData = async () => {
    setIsLoading(true);

    try {
      // Simulasi fetch data
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("Data loaded!");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Example Loading Screen</h1>
      <button onClick={handleFetchData}>Load Data</button>

      {/* Loading Screen Component */}
      <LoadingScreen
        isLoading={isLoading}
        message="Memuat data..."
        size={140}
        // imageFront="/logo-gmit.png"  // Optional: custom logo
        // imageBack="/logo-gmit.png"   // Optional: custom logo
      />
    </div>
  );
}

// ========================================
// PROPS YANG TERSEDIA:
// ========================================
//
// size          : number | string  - Ukuran logo (default: 140)
// message       : string           - Pesan loading (default: "")
// imageFront    : string           - Path gambar depan (default: "/logo-gmit.png")
// imageBack     : string           - Path gambar belakang (default: "/logo-gmit.png")
// paused        : boolean          - Pause animasi (default: false)
// isLoading     : boolean          - Show/hide loading (default: true)
//
// ========================================
// CONTOH PENGGUNAAN DI BERBAGAI KASUS:
// ========================================

// 1. Loading sederhana
<LoadingScreen isLoading={isLoading} />

// 2. Loading dengan pesan
<LoadingScreen isLoading={isLoading} message="Memuat data jemaat..." />

// 3. Loading dengan ukuran custom
<LoadingScreen isLoading={isLoading} size={200} message="Mohon tunggu..." />

// 4. Loading dengan logo custom
<LoadingScreen
  isLoading={isLoading}
  imageFront="/custom-logo.png"
  imageBack="/custom-logo.png"
  message="Processing..."
/>

// 5. Pause animasi (misalnya saat error)
<LoadingScreen
  isLoading={isLoading}
  paused={true}
  message="Terjadi kesalahan..."
/>
