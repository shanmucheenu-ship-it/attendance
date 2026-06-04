import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const LineChart = ({ data, xKey, yKey, color = "#2563EB", referenceValue, referenceLabel }) => {
  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          {referenceValue && (
            <ReferenceLine y={referenceValue} stroke="#DC2626" strokeDasharray="3 3" label={{ position: 'top', value: referenceLabel, fill: '#DC2626', fontSize: 12 }} />
          )}
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
