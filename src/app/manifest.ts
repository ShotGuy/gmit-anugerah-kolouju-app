import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "GMIT Bethesda Tarus Tengah",
        short_name: "GMIT JBTT",
        description: "Aplikasi Pendataan Jemaat GMIT Bethesda Tarus Tengah",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
            {
                src: "/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png",
            },
            {
                src: "/logo-GMIT.png",
                sizes: "192x192", // Estimating/Setting standard sizes, browser will resize if needed or we should have generated specific sizes. 
                type: "image/png",
            },
            {
                src: "/logo-GMIT.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
