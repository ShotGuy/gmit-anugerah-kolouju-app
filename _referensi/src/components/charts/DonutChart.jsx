import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const DonutChart = ({ 
  data, 
  title, 
  height = 300, 
  innerRadius = 40, 
  outerRadius = 80,
  showTotal = true 
}) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Jumlah: <span className="font-bold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Persentase: <span className="font-bold">{((data.value / total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text
        dominantBaseline="central"
        fill="white"
        fontSize="11"
        fontWeight="bold"
        textAnchor={x > cx ? 'start' : 'end'}
        x={x}
        y={y}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="w-full relative">
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
            innerRadius={innerRadius}
            label={renderCustomizedLabel}
            labelLine={false}
            outerRadius={outerRadius}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {showTotal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
             />
            <span className="truncate">{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;