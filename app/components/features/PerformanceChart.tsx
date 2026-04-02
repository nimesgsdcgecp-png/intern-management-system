"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface PerformanceChartProps {
  type: 'tasks' | 'hours';
  data: any[];
  title: string;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="dm-dropdown p-3 rounded-4xl shadow-xl">
        <p className="text-xs font-bold dm-text-muted uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-extrabold text-indigo-600">
          {payload[0].value} {payload[0].name === 'hours' ? 'Hours' : 'Tasks'}
        </p>
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ type, data, title }: PerformanceChartProps) {
  return (
    <div className="dm-card p-6 rounded-4xl flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold dm-text tracking-tight">{title}</h3>
        <div className="px-3 py-1 dm-badge rounded-full text-[10px] font-bold uppercase tracking-widest">
          Last 7 Days
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'hours' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHours)"
              />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-xs font-bold dm-text-secondary">{value}</span>}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
