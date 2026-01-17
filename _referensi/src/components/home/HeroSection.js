import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-500">
            {/* Background Decoration - More symmetric/halo like */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-lighten" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-lighten" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                    {/* Left Column: Text Content */}
                    <div className="lg:col-span-6 text-center lg:text-left relative z-10 lg:pr-8">


                        <h1 className="font-serif text-5xl lg:text-7xl font-bold text-gray-900 dark:text-gray-50 mb-6 leading-[1.1] animate-fade-in-up delay-100">
                            GMIT Betlehem <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-orange-200 italic pr-2">
                                Oesapa Barat
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light animate-fade-in-up delay-200">
                            "Bersama dalam kasih, bertumbuh dalam iman, melayani dalam pengharapan."
                            Mari bergabung dan bertumbuh bersama keluarga besar kami.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
                            <Link
                                href="/tentang"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 bg-gray-900 border border-transparent rounded-full hover:bg-gray-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-xl"
                            >
                                Tentang Kami
                            </Link>
                            <Link
                                href="/jadwal"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 shadow-sm hover:shadow-md"
                            >
                                Jadwal Ibadah
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: The Elegant Arch */}
                    <div className="lg:col-span-6 mt-16 lg:mt-0 relative animate-fade-in-up delay-500">
                        <div className="relative w-full max-w-md mx-auto">
                            {/* Decorative Elements around Arch */}
                            <div className="absolute inset-x-0 -top-10 -bottom-10 border border-gray-200 dark:border-gray-700 rounded-t-[12rem] rounded-b-[3rem] transform rotate-3 scale-105" />
                            <div className="absolute inset-x-0 -top-10 -bottom-10 border border-amber-100 dark:border-amber-900/30 rounded-t-[12rem] rounded-b-[3rem] transform -rotate-2 scale-105" />

                            {/* The Main Arch Container */}
                            <div className="relative z-10 aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-t-[12rem] rounded-b-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 group">
                                <Image
                                    src="/header/sore3.png"
                                    alt="Suasana Gereja"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-in-out"
                                    style={{ transform: `translateY(${scrollY * 0.05}px) scale(1.1)` }}
                                    priority
                                    sizes="(min-width: 1024px) 50vw, 100vw"
                                />
                                {/* Gradient Overlay for integration */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                                {/* Floating Caption inside Arch */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="font-serif text-2xl font-medium mb-2 tracking-wide">Minggu Ini</p>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <div className="h-1 w-1 bg-amber-400 rounded-full"></div>
                                        <p className="text-sm font-light uppercase tracking-wider">Kebaktian: 08:00 & 17:00 WITA</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Seal/Badge */}
                            <div className="absolute -bottom-8 -right-4 z-20 bg-white dark:bg-gray-900 p-2 rounded-full shadow-2xl">
                                <div className="w-24 h-24 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-amber-50 dark:bg-amber-900/10 opacity-50"></div>
                                    <div className="text-center relative z-10">
                                        <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Est.</span>
                                        <span className="block font-serif text-2xl font-bold text-amber-600 dark:text-amber-500">1950</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
