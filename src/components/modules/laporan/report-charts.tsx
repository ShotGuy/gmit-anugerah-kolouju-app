"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, Activity, HeartPulse } from "lucide-react";

// Standard vivid palette matching Dashboard
const COLORS = {
    blue: "#3b82f6",
    pink: "#ec4899",
    emerald: "#10b981",
    amber: "#f59e0b",
    violet: "#8b5cf6",
    cyan: "#06b6d4",
    rose: "#f43f5e",
    slate: "#64748b",
};
const PIE_COLORS = [COLORS.blue, COLORS.pink, COLORS.emerald, COLORS.amber, COLORS.violet, COLORS.cyan];

type ChartProps = {
    data: {
        totalJemaat: number;
        genderStats: { name: string; value: number }[];
        educationStats: { idPendidikan: string | null; _count: { _all: number } }[];
        jobStats: { idPekerjaan: string | null; _count: { _all: number } }[];
        bloodStats: { name: string; value: number }[];
        sakramenStats: { name: string; value: number }[];
    };
    masters: {
        pendidikan: { idPendidikan: string; jenjang: string }[];
        pekerjaan: { idPekerjaan: string; namaPekerjaan: string }[];
    };
};

export function ReportCharts({ data, masters }: ChartProps) {
    // Transform Data
    const educationChartData = data.educationStats
        .map((item) => {
            const label =
                masters.pendidikan.find((p) => p.idPendidikan === item.idPendidikan)
                    ?.jenjang || "Lainnya";
            return { name: label, value: item._count._all };
        })
        .sort((a, b) => b.value - a.value);

    const jobChartData = data.jobStats
        .map((item) => {
            const label =
                masters.pekerjaan.find((p) => p.idPekerjaan === item.idPekerjaan)
                    ?.namaPekerjaan || "Lainnya";
            return { name: label, value: item._count._all };
        })
        .slice(0, 10); // Limit to top 10

    // Calculate totals for KPI
    const countL = data.genderStats.find(g => g.name === "Kami")?.value || data.genderStats.find(g => g.name === "Laki-laki")?.value || 0;
    // data.genderStats comes from DB groupBy boolean, so name is mapped in report.ts as "Laki-laki"/"Perempuan"

    const cards = [
        {
            title: "Total Jemaat",
            value: data.totalJemaat,
            description: "Jiwa",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Sudah Baptis",
            value: data.sakramenStats.find(s => s.name === "Baptis")?.value || 0,
            description: "Anggota",
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
        },
        {
            title: "Sudah Sidi",
            value: data.sakramenStats.find(s => s.name === "Sidi")?.value || 0,
            description: "Anggota",
            icon: Activity,
            color: "text-violet-600",
            bg: "bg-violet-100",
        },
        {
            title: "Sudah Menikah",
            value: data.sakramenStats.find(s => s.name === "Menikah")?.value || 0,
            description: "Anggota",
            icon: HeartPulse,
            color: "text-pink-600",
            bg: "bg-pink-100",
        },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((item, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`rounded-full p-3 ${item.bg} dark:bg-opacity-20`}>
                                    <item.icon className={`h-6 w-6 ${item.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {item.title}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <h2 className="text-2xl font-bold">{item.value}</h2>
                                        <span className="text-xs text-muted-foreground">{item.description}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Row 1: Gender & Sakramen Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Gender Pie Chart */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Komposisi Gender</CardTitle>
                        <CardDescription>Perbandingan Laki-laki dan Perempuan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.genderStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {data.genderStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.blue : COLORS.pink} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sakramen Bar Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Status Sakramen</CardTitle>
                        <CardDescription>Jumlah anggota berdasarkan status gerejawi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.sakramenStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill={COLORS.emerald} radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Education & Jobs */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Education Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tingkat Pendidikan</CardTitle>
                        <CardDescription>Distribusi jenjang pendidikan jemaat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={educationChartData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill={COLORS.amber} radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pekerjaan Utama</CardTitle>
                        <CardDescription>Top 10 pekerjaan terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobChartData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill={COLORS.violet} radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Blood Type */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Golongan Darah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.bloodStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {data.bloodStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
