import { Facebook, Instagram, MapPin, Youtube } from "lucide-react";
import Link from "next/link";

import { useTheme } from "@/contexts/ThemeContext";

export default function Footer() {
  const { isDark } = useTheme();
  const logoSrc = isDark ? "/logo-dark.png" : "/logo-light.png";

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img alt="GMIT Logo" className="h-12 w-auto" src="/logo-GMIT.png" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  GMIT Betlehem
                </h3>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  Oesapa Barat
                </h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              "Sungguh, alangkah baiknya dan indahnya, apabila saudara-saudara diam bersama dengan rukun!"
              <br />
              <span className="italic text-xs mt-1 block">- Mazmur 133:1</span>
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Tentang JBOB
                </Link>
              </li>
              <li>
                <Link href="/sejarah" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sejarah Gereja
                </Link>
              </li>
              <li>
                <Link href="/profil-pendeta" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Profil Pendeta
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Galeri
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Social */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">
              Hubungi Kami
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Jalan Pahlawan No. 12<br />
                  Oesapa Barat, Kota Kupang<br />
                  Nusa Tenggara Timur
                </span>
              </div>
              {/* Placeholder for phone/mail if needed
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>(0380) 123456</span>
              </div>
              */}
            </div>

            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                Ikuti Kami
              </h5>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/GMITJIO/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/gmit_imanuelopr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-500 dark:hover:text-white transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.youtube.com/@gmit_imanuel_oepura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} GMIT Betlehem Oesapa Barat. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
