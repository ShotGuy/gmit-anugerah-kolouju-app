import { Clock, MapPin } from "lucide-react";
import Image from "next/image";

export default function JoinUs() {
  return (
    <div className="flex flex-col md:flex-row bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl w-full md:w-3/4 mx-auto gap-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/20 dark:border-slate-700/50 relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-blue-400/20 blur-3xl rounded-full group-hover:bg-blue-400/30 transition-all duration-500 pointer-events-none"></div>
      {/* texts */}
      <div className="flex flex-col justify-center text-gray-800 dark:text-white flex-1 transition-colors duration-300">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 tracking-wide font-sans text-gray-800 dark:text-white">
            Bergabunglah
          </h2>
          <div className="w-16 h-1 bg-blue-600 rounded-full" />
        </div>

        <p className="text-xl font-medium mb-6 text-gray-700 dark:text-gray-200">
          Bersama dalam kasih & firman Tuhan
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Clock className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Minggu Pukul 08.00 & 17.00 WITA</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <MapPin className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">GMIT Betlehem Oesapa Barat</span>
          </div>
        </div>
      </div>

      {/* image */}
      <div className="flex-shrink-0 rounded-2xl overflow-hidden md:w-80 md:h-72 relative flex-1 shadow-md">
        <Image
          fill
          alt="Bergabung Event"
          className="object-cover hover:scale-105 transition-transform duration-500"
          sizes="(min-width: 768px) 384px, 100vw"
          src="/header/sore2.png"
        />
      </div>
    </div>
  );
}
