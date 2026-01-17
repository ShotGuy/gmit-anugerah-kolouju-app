import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;

// Function to generate a random color
const generateColor = (index) => {
  // Generate colors with good contrast and saturation
  const hue = (index * 137.508) % 360; // Golden angle approximation for good distribution
  const saturation = 70 + (index % 3) * 10; // 70%, 80%, or 90%
  const lightness = 50 + (index % 2) * 10; // 50% or 60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      dominantBaseline="central"
      fill="white"
      fontSize="12"
      textAnchor={x > cx ? "start" : "end"}
      x={x}
      y={y}
    >
      {value}
    </text>
  );
};

export default function StatPieChart({
  title = "Statistik Jenis Kelamin",
  data = [
    { name: "Pria", value: 400 },
    { name: "Wanita", value: 300 },
  ],
  size = "normal", // "small", "normal", "large"
}) {
  // Dynamic sizing based on size prop
  const getSizing = () => {
    switch (size) {
      case "small":
        return {
          titleClass: "text-base font-medium mb-1",
          outerRadius: 50,
          legendHeight: 20,
          fontSize: "16px",
        };
      case "large":
        return {
          titleClass: "text-2xl font-medium mb-2",
          outerRadius: 100,
          legendHeight: 40,
          fontSize: "20px",
        };
      default: // normal
        return {
          titleClass: "text-lg font-medium mb-2",
          outerRadius: 65,
          legendHeight: 28,
          fontSize: "18px",
        };
    }
  };

  const sizing = getSizing();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2
        className={`text-center text-gray-900 dark:text-gray-200 ${sizing.titleClass} mb-1 transition-colors`}
      >
        {title}
      </h2>

      <div className="flex flex-col items-center">
        <div
          style={{
            width: sizing.outerRadius * 2 + 20,
            height: sizing.outerRadius * 2 + 20,
          }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="value"
                fill="#8884d8"
                label={renderCustomizedLabel}
                labelLine={false}
                outerRadius={sizing.outerRadius}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={generateColor(index)}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center">
              <div
                className="w-2.5 h-2.5 mr-1.5"
                style={{ backgroundColor: generateColor(index) }}
              />
              <span
                className="text-gray-700 dark:text-gray-300 transition-colors"
                style={{ fontSize: sizing.fontSize }}
              >
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
