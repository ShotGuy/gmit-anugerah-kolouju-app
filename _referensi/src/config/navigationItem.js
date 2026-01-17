
import {
    Activity,
    Baby,
    BadgeDollarSign,
    BarChart3,
    BookOpen,
    Briefcase,
    Building2,
    Calendar,
    Church,
    CreditCard,
    Database,
    FileText,
    GraduationCap,
    Heart,
    Home,
    Image,
    Info,
    Layers,
    LayoutDashboard,
    Map,
    Megaphone,
    Monitor,
    PieChart,
    Scroll,
    Settings,
    User,
    UserCog,
    Users,
    Wallet
} from "lucide-react";

export const getRoleConfig = (role, user = null) => {
    // Helper to check granular permissions
    const hasPermission = (permission) => {
        if (!user || user.role !== "EMPLOYEE" || !user.pegawai) return true; // Non-employees or incomplete data -> allow (or handle differently)
        // For admin, usually allow all? Or strictly check? Admin usually defined by role.
        // For Employee, check specific flag
        return user.pegawai[permission] === true;
    };

    // Recursive function to filter navigation items
    const filterNavigation = (items) => {
        return items.reduce((acc, item) => {
            // 1. Check if this item requires a specific permission
            if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
                return acc; // Skip this item
            }

            // 2. Process children if match
            if (item.children) {
                const filteredChildren = filterNavigation(item.children);
                // If the item has children but all are filtered out, should we hide the parent? 
                // Usually yes, unless it's a direct link too.
                // For now, keep parent if it has no requiredPermission itself, or if it had children originally and some survive.
                if (filteredChildren.length > 0 || (item.children.length === 0)) { // Keep if original children were 0 (unlikely for group) or if surviving children exist
                    acc.push({ ...item, children: filteredChildren });
                }
            } else {
                acc.push(item);
            }
            return acc;
        }, []);
    };

    let config = {};

    switch (role) {
        case "admin":
            config = {
                baseRoute: "/admin",
                dashboardRoute: "/admin/dashboard",
                fullTitle: "Admin Panel",
                logoIcon: Church,
                userInfo: {
                    name: "Administrator",
                    organization: "GMIT Betlehem Oesapa Barat",
                },
                navigation: [
                    {
                        label: "Dashboard",
                        href: "/admin/dashboard",
                        icon: LayoutDashboard,
                    },

                    // --- BASIS DATA JEMAAT ---
                    {
                        label: "Basis Data Jemaat", // Group Header
                        href: "group-basis-data-jemaat",
                        icon: Users, // Visual grouping icon
                        children: [
                            { label: "Data Jemaat", href: "/admin/jemaat", icon: Users },
                            { label: "Data Keluarga", href: "/admin/keluarga", icon: Home },
                            { label: "Dokumen Jemaat", href: "/admin/dokumen-jemaat", icon: FileText },
                            { label: "Manajemen User", href: "/admin/users", icon: UserCog },
                        ]
                    },

                    // --- ORGANISASI & SDM ---
                    {
                        label: "Organisasi & SDM",
                        href: "group-organisasi-sdm",
                        icon: Building2,
                        children: [
                            { label: "Majelis", href: "/admin/majelis", icon: UserCog },
                            { label: "Pegawai", href: "/admin/pegawai", icon: Briefcase },
                            { label: "Data Rayon", href: "/admin/rayon", icon: Map },
                            { label: "Manajemen Rayon", href: "/admin/manajemen-rayon-majelis", icon: Settings },
                        ]
                    },

                    // --- PELAYANAN & IBADAH ---
                    {
                        label: "Pelayanan & Ibadah",
                        href: "group-pelayanan-ibadah",
                        icon: Heart,
                        children: [
                            { label: "Jadwal Ibadah", href: "/admin/jadwal-ibadah", icon: Calendar },
                            { label: "Pengumuman", href: "/admin/pengumuman", icon: Megaphone },
                            // Sakramen Group
                            { label: "Baptis", href: "/admin/baptis", icon: Baby },
                            { label: "Sidi", href: "/admin/sidi", icon: Scroll },
                            { label: "Pernikahan", href: "/admin/pernikahan", icon: Heart },
                            // Konten
                            { label: "Galeri", href: "/admin/galeri", icon: Image },
                            { label: "Konten Landing Page", href: "/admin/konten-landing-page", icon: Monitor },
                        ]
                    },

                    // --- KEUANGAN ---
                    {
                        label: "Keuangan",
                        href: "group-keuangan",
                        icon: Wallet,
                        children: [
                            // { label: "Dashboard Keuangan", href: "/admin/keuangan", icon: layouts }, // Optional if exists
                            { label: "Realisasi Keuangan", href: "/admin/keuangan/realisasi", icon: CreditCard },
                            { label: "Laporan", href: "/admin/laporan", icon: FileText },
                            // Master Keuangan
                            { label: "Kategori Keuangan", href: "/admin/keuangan/kategori", icon: Layers }, // Verify path if needed, assuming standard
                            { label: "Rancangan Item", href: "/admin/keuangan/item", icon: BadgeDollarSign },
                            { label: "Periode Anggaran", href: "/admin/keuangan/anggaran", icon: Calendar },
                        ]
                    },

                    // --- DATA MASTER (FULL) ---
                    {
                        label: "Data Master",
                        href: "group-data-master",
                        icon: Database,
                        children: [
                            // Wilayah
                            { label: "Wilayah Administratif", href: "/admin/data-master/wilayah-administratif", icon: Map },

                            // Gerejawi
                            { label: "Klasis", href: "/admin/data-master/klasis", icon: Church },
                            { label: "Jenis Ibadah", href: "/admin/data-master/jenis-ibadah", icon: BookOpen },
                            { label: "Kategori Jadwal", href: "/admin/data-master/kategori-jadwal", icon: Calendar },
                            { label: "Profil Pendeta", href: "/admin/data-master/profil-pendeta", icon: UserCog },

                            // Kependudukan
                            { label: "Pekerjaan", href: "/admin/data-master/pekerjaan", icon: Briefcase },
                            { label: "Pendidikan", href: "/admin/data-master/pendidikan", icon: GraduationCap },
                            { label: "Suku", href: "/admin/data-master/suku", icon: Users },
                            { label: "Pendapatan", href: "/admin/data-master/pendapatan", icon: BadgeDollarSign },
                            { label: "Jaminan Kesehatan", href: "/admin/data-master/jaminan-kesehatan", icon: Activity },

                            // Keluarga & Rumah
                            { label: "Status Keluarga", href: "/admin/data-master/status-keluarga", icon: Home },
                            { label: "Status Dlm Keluarga", href: "/admin/data-master/status-dalam-keluarga", icon: Users },
                            { label: "Keadaan Rumah", href: "/admin/data-master/keadaan-rumah", icon: Home },
                            { label: "Sts Kepemilikan Rumah", href: "/admin/data-master/status-kepemilikan-rumah", icon: Home },

                            // Lainnya
                            { label: "Jenis Jabatan", href: "/admin/data-master/jenis-jabatan", icon: UserCog },
                            { label: "Kategori Pengumuman", href: "/admin/data-master/kategori-pengumuman", icon: Megaphone },
                            { label: "Jenis Pengumuman", href: "/admin/data-master/jenis-pengumuman", icon: Megaphone },
                        ],
                    },

                    // --- SISTEM ---
                    {
                        label: "Sistem",
                        href: "group-sistem",
                        icon: Settings,
                        children: [
                            { label: "Analitik", href: "/admin/analytics", icon: PieChart },
                            { label: "Monitor Traffic", href: "/admin/traffic-monitor", icon: BarChart3 },
                            { label: "Info Sistem", href: "/admin/system-info", icon: Info },
                        ]
                    }
                ],
            };
            break;
        case "majelis":
            config = {
                baseRoute: "/majelis",
                dashboardRoute: "/majelis/dashboard",
                fullTitle: "Majelis Dashboard",
                logoIcon: Church,
                userInfo: {
                    name: "Majelis",
                    organization: "GMIT JBOB",
                },
                navigation: [
                    {
                        label: "Dashboard",
                        href: "/majelis/dashboard",
                        icon: LayoutDashboard,
                    },
                    {
                        label: "Pelayanan",
                        href: "group-majelis-pelayanan",
                        icon: Heart,
                        children: [
                            { label: "Data Jemaat", href: "/majelis/jemaat", icon: Users },
                            { label: "Data Keluarga", href: "/majelis/keluarga", icon: Home },
                            { label: "Dokumen Jemaat", href: "/majelis/dokumen-jemaat", icon: FileText },
                        ]
                    },
                    {
                        label: "Kegiatan",
                        href: "group-majelis-kegiatan",
                        icon: Calendar,
                        children: [
                            { label: "Jadwal Ibadah", href: "/majelis/jadwal-ibadah", icon: Calendar },
                            { label: "Pengumuman", href: "/majelis/pengumuman", icon: Megaphone },
                        ]
                    },
                    {
                        label: "Akun Jemaat",
                        href: "/majelis/akun-jemaat",
                        icon: UserCog
                    }
                ],
            };
            break;
        case "employee":
            config = {
                baseRoute: "/employee",
                dashboardRoute: "/employee/dashboard",
                fullTitle: "Staff Area",
                logoIcon: Church,
                userInfo: {
                    name: "Staff",
                    organization: "GMIT JBOB",
                },
                navigation: [
                    {
                        label: "Dashboard",
                        href: "/employee/dashboard",
                        icon: LayoutDashboard,
                    },
                    {
                        label: "Operasional",
                        href: "group-staff-operasional",
                        icon: Briefcase,
                        children: [
                            {
                                label: "Data Jemaat",
                                href: "/employee/jemaat",
                                icon: Users,
                                requiredPermission: "canViewJemaat"
                            },
                            {
                                label: "Jadwal Ibadah",
                                href: "/employee/jadwal-ibadah",
                                icon: Calendar,
                                requiredPermission: "canManageJadwal"
                            },
                            {
                                label: "Pengumuman",
                                href: "/employee/pengumuman",
                                icon: Megaphone,
                                requiredPermission: "canManagePengumuman"
                            },
                            {
                                label: "Galeri",
                                href: "/employee/galeri",
                                icon: Image,
                                requiredPermission: "canManageGaleri"
                            },
                        ]
                    },
                    {
                        label: "Keuangan",
                        href: "group-staff-keuangan",
                        icon: Wallet,
                        children: [
                            {
                                label: "Statistik Keuangan",
                                href: "/employee/keuangan",
                                icon: LayoutDashboard,
                                requiredPermission: "canManageKeuangan"
                            },
                            {
                                label: "Realisasi Keuangan",
                                href: "/employee/keuangan/transaksi",
                                icon: CreditCard,
                                requiredPermission: "canManageKeuangan"
                            },
                        ]
                    },
                    {
                        label: "Data Master (Keuangan)",
                        href: "group-staff-master-keuangan",
                        icon: Database,
                        children: [
                            {
                                label: "Item Anggaran",
                                href: "/employee/keuangan/master/item",
                                icon: BadgeDollarSign,
                                requiredPermission: "canManageKeuangan"
                            },
                            {
                                label: "Kategori Keuangan",
                                href: "/employee/keuangan/master/kategori",
                                icon: Layers,
                                requiredPermission: "canManageKeuangan"
                            },
                            {
                                label: "Periode Anggaran",
                                href: "/employee/keuangan/master/periode",
                                icon: Calendar,
                                requiredPermission: "canManageKeuangan"
                            },
                        ]
                    }
                ],
            };
            break;
        case "jemaat":
            config = {
                baseRoute: "/jemaat",
                dashboardRoute: "/jemaat/dashboard",
                fullTitle: "Portal Jemaat",
                logoIcon: Church,
                userInfo: {
                    name: "Jemaat",
                    organization: "GMIT JBOB",
                },
                navigation: [
                    {
                        label: "Dashboard",
                        href: "/jemaat/dashboard",
                        icon: LayoutDashboard,
                    },
                    {
                        label: "Ibadah & Kegiatan",
                        href: "/jemaat/jadwal-ibadah",
                        icon: Calendar,
                    },
                    {
                        label: "Data Saya",
                        href: "group-jemaat-data",
                        icon: User,
                        children: [
                            { label: "Keluarga", href: "/jemaat/keluarga", icon: Home },
                            { label: "Profil Pribadi", href: "/jemaat/profile", icon: User },
                        ]
                    }
                ],
            };
            break;
        default:
            config = {
                baseRoute: "/",
                dashboardRoute: "/",
                fullTitle: "GMIT JBOB",
                logoIcon: Church,
                userInfo: {
                    name: "Guest",
                    organization: "GMIT JBOB",
                },
                navigation: [],
            };
            break;
    }

    // Apply filtering before returning
    if (user && role === "employee") {
        config.navigation = filterNavigation(config.navigation);
    }

    return config;
};
