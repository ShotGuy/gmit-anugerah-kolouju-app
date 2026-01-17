import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomLineChart = ({ 
  data, 
  title, 
  height = 300, 
  xAxisDataKey = "name", 
  lines = [{ dataKey: "value", color: "#8884d8", name: "Value" }],
  showGrid = true,
  showLegend = true
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              <span className="font-bold" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="ml-1 font-bold">{entry.value}</span>
            </p>
          ))}
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
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              activeDot={{ r: 8 }}
              dataKey={line.dataKey}
              dot={{ r: 6 }}
              name={line.name}
              stroke={line.color}
              strokeWidth={3}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;