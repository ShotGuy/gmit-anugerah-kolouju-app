"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getJemaatAction } from "@/actions/jemaat";
import { getKeluargaAction } from "@/actions/keluarga";
import { getDashboardStatsAction } from "@/actions/dashboard";
import { getMasterDataAction } from "@/actions/master-data";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Tag,
  Home,
  Users,
  Calendar,
  BookOpen,
  Briefcase,
  CreditCard,
  Heart,
  MapPin,
  Award,
  Droplet,
  Star,
  Wallet,
  PieChart,
  List,
} from "lucide-react";
import { useState } from "react";

import { MASTER_DATASETS } from "@/constants/master-datasets";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/jemaat", label: "Jemaat", icon: Users },
  { href: "/keluarga", label: "Keluarga", icon: Home },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/laporan", label: "Laporan", icon: PieChart },
  { href: "/jabatan", label: "Jabatan", icon: Briefcase },
];

const SAKRAMEN_ITEMS = [
  { href: "/sakramen/baptis", label: "Baptis", icon: Droplet },
  { href: "/sakramen/sidi", label: "Sidi", icon: Star },
  { href: "/sakramen/pernikahan", label: "Pernikahan", icon: Award },
];

const datasetIconMap: Record<string, any> = {
  pendidikan: BookOpen,
  pekerjaan: Briefcase,
  pendapatan: CreditCard,
  "jaminan-kesehatan": Heart,
  rayon: MapPin,
  klasis: Award,
  jabatan: Tag,
};

const WILAYAH_ITEM = {
  href: "/master-data/wilayah",
  label: "Wilayah Administratif",
  icon: MapPin,
};

export const SidebarContent = () => {
  const pathname = usePathname();
  const [sakramenOpen, setSakramenOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [keuanganMasterOpen, setKeuanganMasterOpen] = useState(false);
  const queryClient = useQueryClient();

  // Filter out the old single "Keuangan" item if it exists in navItems, 
  // and add the new feature menus: Statistik & Realisasi
  const mainNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/jemaat", label: "Jemaat", icon: Users },
    { href: "/keluarga", label: "Keluarga", icon: Home },
    { href: "/laporan", label: "Laporan", icon: BookOpen }, // Changed icon to distinguish
    { href: "/jabatan", label: "Jabatan", icon: Briefcase },
  ];

  const handlePrefetch = (href: string) => {
    if (href === "/jemaat") {
      queryClient.prefetchQuery({
        queryKey: ["jemaat"],
        queryFn: () => getJemaatAction(),
        staleTime: 2 * 60 * 1000,
      });
    } else if (href === "/keluarga") {
      queryClient.prefetchQuery({
        queryKey: ["keluarga"],
        queryFn: () => getKeluargaAction(),
        staleTime: 2 * 60 * 1000,
      });
    } else if (href === "/dashboard") {
      queryClient.prefetchQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => getDashboardStatsAction(),
        staleTime: 2 * 60 * 1000,
      });
    } else if (href.startsWith("/master-data/")) {
      const slug = href.replace("/master-data/", "");
      queryClient.prefetchQuery({
        queryKey: ["master-data", slug],
        queryFn: () => getMasterDataAction(slug),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center border-b border-border/40 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="relative h-8 w-8">
            <Image
              src="/logo-GMIT.png"
              alt="Logo GMIT"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          <span className="">GMIT Anugerah Koluju</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => handlePrefetch(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all font-semibold",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* Sakramen Group */}
          <div className="mt-4">
            <button
              onClick={() => setSakramenOpen(!sakramenOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary text-left"
            >
              <span className="flex items-center gap-3 font-semibold">
                <BookOpen className="h-4 w-4" />
                Sakramen
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  sakramenOpen && "rotate-180"
                )}
              />
            </button>
            {sakramenOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                {SAKRAMEN_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                      pathname === item.href
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Data Master Group */}
          <div className="mt-4">
            <button
              onClick={() => setMasterOpen(!masterOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary text-left"
            >
              <span className="flex items-center gap-3 font-semibold">
                <Tag className="h-4 w-4" />
                Data Master
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  masterOpen && "rotate-180"
                )}
              />
            </button>
            {masterOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                <Link
                  href={WILAYAH_ITEM.href}
                  onMouseEnter={() => handlePrefetch(WILAYAH_ITEM.href)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname === WILAYAH_ITEM.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <WILAYAH_ITEM.icon className="h-4 w-4" />
                  {WILAYAH_ITEM.label}
                </Link>
                {MASTER_DATASETS.filter((d) => !d.hidden).map((dataset) => {
                  const Icon = datasetIconMap[dataset.slug] || Tag;
                  const href = `/master-data/${dataset.slug}`;
                  return (
                    <Link
                      key={dataset.slug}
                      href={href}
                      onMouseEnter={() => handlePrefetch(href)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        pathname === href
                          ? "bg-muted text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {dataset.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Financial Features (Realisasi & Statistik) - Moved here per request */}
          <div className="mt-4 space-y-1">
            <Link
              href="/keuangan/realisasi"
              className={cn(
                "flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary font-semibold",
                pathname === "/keuangan/realisasi"
                  ? "bg-muted text-primary rounded-lg"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4" />
                Realisasi Keuangan
              </div>
            </Link>
            <Link
              href="/keuangan/statistik"
              className={cn(
                "flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary font-semibold",
                pathname === "/keuangan/statistik"
                  ? "bg-muted text-primary rounded-lg"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <PieChart className="h-4 w-4" />
                Statistik Keuangan
              </div>
            </Link>
          </div>

          {/* Data Master Keuangan Group */}
          <div className="mt-4">
            <button
              onClick={() => setKeuanganMasterOpen(!keuanganMasterOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary text-left"
            >
              <span className="flex items-center gap-3 font-semibold">
                <CreditCard className="h-4 w-4" />
                Data Master Keuangan
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  keuanganMasterOpen && "rotate-180"
                )}
              />
            </button>
            {keuanganMasterOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                {/* 1. Kategori Keuangan */}
                <Link
                  href="/master-data/kategori-keuangan"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname === "/master-data/kategori-keuangan"
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Tag className="h-4 w-4" />
                  Kategori Keuangan
                </Link>

                {/* 2. Periode Anggaran */}
                <Link
                  href="/master-data/periode-anggaran"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname === "/master-data/periode-anggaran"
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Periode Anggaran
                </Link>

                {/* 3. Rancangan Item Keuangan (Existing Tree) */}
                <Link
                  href="/keuangan"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname === "/keuangan"
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                  Rancangan Item
                </Link>
              </div>
            )}
          </div>

        </nav>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 bg-transparent lg:block p-4">
      <div className="flex h-full flex-col rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <SidebarContent />
      </div>
    </aside>
  );
};
