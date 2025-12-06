import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package } from 'lucide-react';

interface TopMovedItem {
  item_id: string;
  item_name: string;
  movement_count: number;
  total_quantity: number;
}

interface TopItemsChartProps {
  data: TopMovedItem[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const TopItemsChart: React.FC<TopItemsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Package className="w-12 h-12 mb-2" />
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.item_name.length > 20 ? item.item_name.substring(0, 20) + '...' : item.item_name,
    fullName: item.item_name,
    count: item.movement_count,
    quantity: item.total_quantity,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
            stroke="#64748B"
          />
          <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-semibold text-slate-800">{data.fullName}</p>
                    <p className="text-sm text-slate-600">Movimentações: {data.count}</p>
                    <p className="text-sm text-slate-600">Quantidade total: {data.quantity}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
