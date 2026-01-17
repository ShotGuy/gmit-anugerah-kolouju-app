import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomBarChart = ({ 
  data, 
  title, 
  height = 300, 
  xAxisDataKey = "name", 
  yAxisDataKey = "value",
  barColor = "#8884d8",
  showGrid = true,
  showLegend = false
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600">
            Jumlah: <span className="font-bold text-blue-600">{data.value.toLocaleString()}</span>
          </p>
          {data.payload.percentage && (
            <p className="text-sm text-gray-600">
              Persentase: <span className="font-bold">{data.payload.percentage.toFixed(1)}%</span>
            </p>
          )}
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
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            angle={-45} 
            dataKey={xAxisDataKey}
            fontSize={12}
            height={100}
            textAnchor="end"
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar dataKey={yAxisDataKey} fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;