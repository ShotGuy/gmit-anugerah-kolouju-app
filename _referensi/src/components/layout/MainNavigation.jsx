"use client";

import { Menu } from "lucide-react";
import Head from "next/head";

// import Navbar from "./Navbar";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import ThemeToggle from "@/components/ui/ThemeToggle";
import useKategoriPengumuman from "@/hooks/useKategoriPengumuman";

export default function MainNavigation({ children }) {
  const menuItems = [
    { name: "Beranda", path: "/" },
    { name: "Galeri", path: "/galeri" },
    { name: "Tentang JBOB", path: "/tentang" },
    { name: "Sejarah", path: "/sejarah" },
    { name: "Profil Pendeta", path: "/profil-pendeta" },
  ];

  // Fetch kategori pengumuman data for UPP dropdown
  const { kategoriOptions: uppItems, loading: uppLoading } =
    useKategoriPengumuman();

  return (
    <>
      <Head>
        {/* Preload logo since it's used in navigation on every page */}
        <link as="image" href="/logo-GMIT.png" rel="preload" type="image/png" />
      </Head>
      <div className="drawer text-gray-900 dark:text-white transition-colors duration-300">
        <input className="drawer-toggle" id="my-drawer-3" type="checkbox" />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          {/* Navbar */}
          <div className="navbar bg-white dark:bg-gray-900 w-full fixed top-0 left-0 z-50 transition-all duration-300 shadow-md">
            <div className="flex-none lg:hidden">
              <label
                aria-label="open sidebar"
                className="btn btn-square btn-ghost text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                htmlFor="my-drawer-3"
              >
                <Menu className="w-8 h-8" />
              </label>
            </div>
            <div className="mx-2 flex-1 px-2 flex items-center gap-3">
              <img
                alt="GMIT Betlehem Oesapa Barat Logo"
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
                src="/logo-GMIT.png"
              />
              <div className="flex flex-col justify-center">
                <p className="font-extrabold text-2xl md:text-3xl tracking-tighter leading-none text-gray-900 dark:text-white font-sans">
                  GMIT
                </p>
                <p className="font-medium text-xs md:text-sm tracking-[0.3em] leading-none text-gray-900 dark:text-white uppercase mt-0.5">
                  JBOB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Navbar
                menuItems={menuItems}
                uppItems={uppItems}
                uppLoading={uppLoading}
              />
            </div>
          </div>
          {/* Page content here */}
          <main>{children}</main>
        </div>
        <Sidebar
          menuItems={menuItems}
          uppItems={uppItems}
          uppLoading={uppLoading}
        />
      </div>
    </>
  );
}
