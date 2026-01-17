import { TrendingUp, User, UserPlus, Users } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function AttendanceChart({ data, loading }) {
    if (loading) {
        return <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">Loading charts...</div>;
    }

    if (!data || !data.summary) {
        return <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400">Tidak ada data untuk ditampilkan</div>;
    }

    const { summary, trend, composition, distribution, rayonPerformance } = data;

    return (
        <div className="space-y-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Kehadiran', value: summary.totalKehadiran, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Rata-rata / Ibadah', value: summary.avgPerIbadah, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Rekor Tertinggi', value: summary.rekorTertinggi, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Target Tercapai', value: `${summary.targetAchievement}%`, icon: User, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                            <p className={`text-2xl font-bold font-display ${item.color}`}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Trend Chart (Line) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-display">Tren Kehadiran</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Hadir" />
                                <Line type="monotone" dataKey="laki" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Pria" />
                                <Line type="monotone" dataKey="perempuan" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Wanita" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gender Composition (Pie) */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-display">Komposisi Gender</h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={composition}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell key="cell-0" fill="#3b82f6" /> {/* Pria - Blue */}
                                    <Cell key="cell-1" fill="#ec4899" /> {/* Wanita - Pink */}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Distribution (Donut) */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-display">Distribusi per Ibadah</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rayon Ranking (Horizontal Bar) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 font-display">Top 10 Keaktifan Rayon</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Berdasarkan Total Kehadiran</span>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={rayonPerformance}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {rayonPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
