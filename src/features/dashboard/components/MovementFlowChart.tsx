import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WeeklyMovementData } from '../../../hooks/useWebSocketDashboard';

interface MovementFlowChartProps {
  data: WeeklyMovementData[];
}

export const MovementFlowChart: React.FC<MovementFlowChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Fluxo de Movimentação</h3>
        <div className="h-64 flex items-center justify-center text-slate-400">
          <p>Nenhum dado de movimentação disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-4">Fluxo de Movimentação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="dayLabel"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ fontSize: '14px' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="entries"
            stroke="#10B981"
            strokeWidth={2}
            name="Entradas"
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6 }}
            fill="url(#colorEntries)"
          />
          <Line
            type="monotone"
            dataKey="exits"
            stroke="#EF4444"
            strokeWidth={2}
            name="Saídas"
            dot={{ fill: '#EF4444', r: 4 }}
            activeDot={{ r: 6 }}
            fill="url(#colorExits)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
