import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomAreaChart = ({ 
  data, 
  title, 
  height = 300, 
  xAxisDataKey = "name", 
  areas = [{ dataKey: "value", color: "#8884d8", name: "Value" }],
  showGrid = true,
  showLegend = false
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
              <span className="ml-1 font-bold">{entry.value.toLocaleString()}</span>
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
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={index}
              dataKey={area.dataKey}
              fill={area.color}
              fillOpacity={0.6}
              name={area.name}
              stackId="1"
              stroke={area.color}
              type="monotone"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomAreaChart;