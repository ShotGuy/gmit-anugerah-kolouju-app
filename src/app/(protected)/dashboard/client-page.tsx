"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsAction } from "@/actions/dashboard";
import {
    Users,
    Home,
    Droplets,
    Heart,
    Cake,
    Calendar,
    PlusCircle,
    MapPin,
    BookOpen,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
    counts: {
        jemaat: number;
        keluarga: number;
        baptis: number;
        pernikahan: number;
        sidi: number;
    };
    genderStats: Array<{ name: string; value: number; fill: string }>;
    ageStats: Array<{ name: string; value: number }>;
    rayonStats: Array<{ name: string; value: number }>;
    upcomingBirthdays: Array<{
        id: string;
        nama: string;
        tanggal: string; // Serialized date from server action
        usia: number;
    }>;
}

interface DashboardClientPageProps {
    initialData: DashboardStats | undefined;
}

const COLORS = ["#3b82f6", "#ec4899"]; // Blue, Pink

export default function DashboardClientPage({
    initialData,
}: DashboardClientPageProps) {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const data = await getDashboardStatsAction();
            return data as unknown as DashboardStats;
        },
        initialData: initialData,
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    const statCards = [
        {
            label: "Total Jemaat",
            value: stats?.counts.jemaat ?? 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            label: "Total Keluarga",
            value: stats?.counts.keluarga ?? 0,
            icon: Home,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
        },
        {
            label: "Data Baptis",
            value: stats?.counts.baptis ?? 0,
            icon: Droplets,
            color: "text-cyan-600",
            bg: "bg-cyan-100 dark:bg-cyan-900/20",
        },
        {
            label: "Data Sidi",
            value: stats?.counts.sidi ?? 0,
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
            label: "Data Pernikahan",
            value: stats?.counts.pernikahan ?? 0,
            icon: Heart,
            color: "text-pink-600",
            bg: "bg-pink-100 dark:bg-pink-900/20",
        },
    ];

    if (isLoading) {
        return <div className="p-8 text-center">Memuat data dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header & Quick Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Ringkasan data dan statistik jemaat GMIT Bethesda Tarus Tengah.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild size="sm" className="gap-1">
                        <Link href="/jemaat">
                            <PlusCircle className="h-4 w-4" />
                            Jemaat Baru
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-1">
                        <Link href="/keluarga">
                            <PlusCircle className="h-4 w-4" />
                            Keluarga Baru
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className={`rounded-full p-3 ${card.bg}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {card.label}
                            </p>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 lg:grid-cols-7">
                {/* Gender Chart (2 cols) */}
                <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">Komposisi Jemaat</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.genderStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.genderStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-center gap-6">
                        {stats?.genderStats.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: entry.fill }}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {entry.name} ({entry.value})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Age Chart (3 cols) */}
                <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-3">
                    <h3 className="mb-4 text-lg font-semibold">Sebaran Usia</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.ageStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{ borderRadius: "8px" }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Birthdays (2 cols) */}
                <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-center gap-2">
                        <Cake className="h-5 w-5 text-pink-500" />
                        <h3 className="text-lg font-semibold">Ulang Tahun Minggu Ini</h3>
                    </div>
                    <div className="space-y-4">
                        {stats?.upcomingBirthdays.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Tidak ada yang berulang tahun dalam 7 hari ke depan.
                            </p>
                        ) : (
                            stats?.upcomingBirthdays.map((jemaat) => (
                                <div
                                    key={jemaat.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div>
                                        <p className="font-medium">{jemaat.nama}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(jemaat.tanggal).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600 dark:bg-pink-900/30">
                                        {jemaat.usia}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Rayon Stats */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Statistik Per Rayon (Top 10)</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.rayonStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{ borderRadius: "8px" }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#10b981" // Emerald 500
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
