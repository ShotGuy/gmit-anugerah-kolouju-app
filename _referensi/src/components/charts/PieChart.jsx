import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

const CustomPieChart = ({ data, title, height = 300, showLegend = true, showLabels = true }) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
    if (!showLabels) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        dominantBaseline="central"
        fill="white"
        fontSize="12"
        fontWeight="bold"
        textAnchor={x > cx ? 'start' : 'end'}
        x={x}
        y={y}
      >
        {value}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Jumlah: <span className="font-bold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Persentase: <span className="font-bold">{((data.value / data.payload.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer height={height} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            fill="#8884d8"
            label={renderCustomizedLabel}
            labelLine={false}
            outerRadius={80}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPieChart;