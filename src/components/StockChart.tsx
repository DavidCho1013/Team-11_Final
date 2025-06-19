import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

interface StockChartProps {
  data: Array<{ date: number; price: number; open?: number; high?: number; low?: number; close?: number }>;
  ticker: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // Access the full data point
    // Ensure dataPoint.date is a valid number before formatting
    const date = typeof dataPoint.date === 'number' ? dayjs(dataPoint.date).format('YYYY.MM.DD') : 'N/A';
    const price = dataPoint.price !== undefined && typeof dataPoint.price === 'number' ? dataPoint.price.toFixed(2) : 'N/A';

    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-300 shadow-sm rounded-md text-sm">
        <p className="label text-gray-700 mb-1">{`${date}`}</p>
        <p className="price text-gray-800 font-medium">가격: ${price}</p>
      </div>
    );
  }

  return null;
};

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  // Sort data by date in ascending order to ensure correct line drawing
  const sortedData = [...data].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Add subtle grid lines */}
        <XAxis
          dataKey="date"
          domain={['auto', 'auto']} // Use auto domain for dates
          type="number" // Treat date as number (timestamp) for domain calculation
          scale="time" // Use time scale for date axis
          tickFormatter={(unixTime) => dayjs(unixTime).format('YYYY.MM.DD')} // Format timestamp to date
          minTickGap={30} // Ensure minimum gap between ticks
          angle={-45} // Rotate labels for better readability
          textAnchor="end" // Anchor rotated labels correctly
          height={60} // Increase height to accommodate rotated labels
          tick={{ fontSize: 12 }} // 폰트 크기 축소
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(value) => `$${value.toFixed(2)}`} // Add dollar sign and format
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone" // Use monotone type for smooth line
          dataKey="price" // Use the 'price' data key for the line chart
          stroke="#22c55e" // Green color for the line
          strokeWidth={2} // Adjust line thickness
          dot={false} // Do not show dots on data points
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart; 