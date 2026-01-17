import { Book, Clock, MapPin, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CommunityCallToAction() {
    const [verse, setVerse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Daily Verse Logic
    const fetchVerse = async () => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(
                "https://beta.ourmanna.com/api/v1/get?format=json",
                { signal: controller.signal, next: { revalidate: 3600 } }
            );
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Gagal");
            const data = await response.json();

            if (data.verse?.details) {
                setVerse(data.verse.details);
            }
        } catch (err) {
            // Fallback
            setVerse({
                text: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal.",
                reference: "Yohanes 3:16",
                version: "TB",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerse();
    }, []);

    return (
        <div className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    fill
                    alt="Community Background"
                    className="object-cover"
                    src="/header/sore2.png" // User requested sore2.png
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90" />
            </div>

            {/* Decorative Top Wave (White to transition from previous section) */}
            <div className="absolute top-0 left-0 w-full z-10 overflow-hidden leading-none">
                <svg
                    className="relative block w-[calc(100%+1.3px)] h-[80px] sm:h-[150px]"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className="fill-white dark:fill-gray-950 transition-colors duration-500"
                    ></path>
                </svg>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left: Join Us Content */}
                    <div className="text-white space-y-8">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 backdrop-blur-sm">
                            <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">Mari Bergabung</span>
                        </div>

                        <h2 className="font-serif text-5xl lg:text-7xl font-bold leading-tight">
                            Bertumbuh <br />
                            <span className="text-amber-400">Dalam Iman</span>
                        </h2>

                        <p className="text-lg text-gray-200 max-w-lg font-light leading-relaxed">
                            Kami mengundang Anda untuk menjadi bagian dari keluarga besar kerajaan Allah, melayani bersama dan saling menguatkan.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="bg-amber-500 p-2 rounded-lg">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Waktu Ibadah</h4>
                                    <p className="text-gray-300">Minggu: 08.00 & 17.00 WITA</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Lokasi Kami</h4>
                                    <p className="text-gray-300">GMIT Betlehem Oesapa Barat</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Daily Verse (Glassmorphism Card) */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-amber-700 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse" />

                        <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 lg:p-10 shadow-2xl">
                            <div className="flex items-center gap-3 mb-8">
                                <Book className="w-8 h-8 text-amber-400" />
                                <h3 className="text-2xl font-serif font-bold text-white">Ayat Harian</h3>
                            </div>

                            {loading ? (
                                <div className="py-12 flex justify-center">
                                    <span className="loading loading-spinner text-amber-400 loading-lg"></span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <blockquote className="text-2xl md:text-3xl font-serif leading-snug text-white/90 italic">
                                        "{verse?.text}"
                                    </blockquote>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <span className="font-bold text-amber-400 text-lg">
                                            {verse?.reference} ({verse?.version})
                                        </span>
                                        <button
                                            onClick={fetchVerse}
                                            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                            title="Ayat Baru"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
