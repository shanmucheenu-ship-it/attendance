import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WaveChart = ({ data, xKey, yKey, color = "#2563EB" }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWave)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
