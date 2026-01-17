import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
    "#d97706", // amber-600
    "#b45309", // amber-700
    "#78350f", // amber-900
    "#fcd34d", // amber-300
    "#92400e", // amber-800
];

const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    name
}) => {
    const RADIAN = Math.PI / 180;
    // Calculate position for the chip
    // Push it slightly further out than the middle
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <g>
            {/* Chip Background (Shadow effect) */}
            <rect
                x={x - 20}
                y={y - 12}
                width="40"
                height="24"
                rx="12"
                fill="white"
                fillOpacity="0.9"
                style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.2))" }}
            />
            {/* Value Text */}
            <text
                x={x}
                y={y}
                fill="#78350f"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-bold font-serif"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
            >
                {value}
            </text>
        </g>
    );
};

export default function StatDonutChart({
    title = "Statistik",
    data = [],
}) {
    return (
        <div className="flex flex-col items-center">
            <h3 className="font-serif text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                {title}
            </h3>

            <div className="w-64 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', borderColor: 'transparent', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Total or Text if needed (Optional) */}
                {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-serif font-bold text-amber-700">Total</span>
        </div> */}
            </div>

            {/* Legend below */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                {data.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {entry.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
